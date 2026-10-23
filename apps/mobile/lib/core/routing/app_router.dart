import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/assessment/data/assessment_repository.dart';
import '../../features/assessment/data/health_profile_repository.dart';
import '../../features/assessment/presentation/assessment_flow_screen.dart';
import '../../features/auth/presentation/auth_controller.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/consent/presentation/consent_controller.dart';
import '../../features/consent/presentation/consent_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/simulation/presentation/simulation_screen.dart';
import '../api/generated/models/health_profile_response.dart';
import '../storage/preferences_service.dart';

/// Navigation mode for unauthenticated users.
enum AuthViewMode { login, register }

/// Provider tracking active unauthenticated screen mode.
final authViewModeProvider = StateProvider<AuthViewMode?>((ref) => null);

/// Route path definitions for declarative navigation (ADR-012, PRD-Mobile §11).
abstract class AppRoutes {
  static const home = '/';
  static const login = '/login';
  static const register = '/register';
  static const consent = '/consent';
  static const assessment = '/assessment';
  static const simulation = '/simulation';
  static const profile = '/profile';
}

/// Notifier that triggers GoRouter redirect re-evaluation on state changes.
class RouterNotifier extends ChangeNotifier {
  RouterNotifier(this.ref) {
    ref.listen<bool>(isAuthenticatedProvider, (previous, next) => notifyListeners());
    ref.listen(consentStatusProvider, (previous, next) => notifyListeners());
    ref.listen<AuthViewMode?>(authViewModeProvider, (previous, next) => notifyListeners());
  }

  final Ref ref;
}

/// Provides the RouterNotifier instance.
final routerNotifierProvider = Provider<RouterNotifier>((ref) => RouterNotifier(ref));

/// Root GoRouter configuration enforcing declarative consent and auth guards (MOB-005).
final appRouterProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(routerNotifierProvider);

  return GoRouter(
    initialLocation: AppRoutes.home,
    refreshListenable: notifier,
    redirect: (BuildContext context, GoRouterState state) {
      final isAuthenticated = ref.read(isAuthenticatedProvider);
      final location = state.matchedLocation;
      final isAuthRoute = location == AppRoutes.login || location == AppRoutes.register;

      if (!isAuthenticated) {
        final viewMode = ref.read(authViewModeProvider);
        var isFirstLaunch = false;
        try {
          isFirstLaunch = ref.read(isFirstLaunchProvider);
        } catch (_) {
          isFirstLaunch = false;
        }

        final targetAuthRoute = viewMode != null
            ? (viewMode == AuthViewMode.register ? AppRoutes.register : AppRoutes.login)
            : (isFirstLaunch ? AppRoutes.register : AppRoutes.login);

        if (!isAuthRoute) {
          return targetAuthRoute;
        }

        // Keep viewMode synced if an explicit mode override is set
        if (viewMode != null) {
          final expected = viewMode == AuthViewMode.register ? AppRoutes.register : AppRoutes.login;
          if (location != expected) {
            return expected;
          }
        }
        return null;
      }

      // Authenticated user attempting to access login or register
      if (isAuthRoute) {
        return AppRoutes.home;
      }

      // Check consent status for protected flows (BR-CONSENT-001)
      final consentAsync = ref.read(consentStatusProvider);
      final healthProfileAsync = ref.read(healthProfileProvider);
      final hasProfile = healthProfileAsync.asData?.value != null;

      // Hold navigation while consent evaluation is in-flight on cold start
      if (consentAsync.isLoading) {
        return null;
      }

      final status = consentAsync.asData?.value;
      if (status != null) {
        final hasActiveConsent = status.hasActiveConsent;

        // First-time onboarding user without active consent and without profile
        if (!hasActiveConsent && !hasProfile && status.activeConsent == null) {
          if (location != AppRoutes.consent) {
            return AppRoutes.consent;
          }
          return null;
        }

        // If on consent screen but consent is active, redirect to assessment if no assessment exists, else home
        if (hasActiveConsent && location == AppRoutes.consent) {
          final hasAssessment = ref.read(latestAssessmentProvider).asData?.value != null;
          return hasAssessment ? AppRoutes.home : AppRoutes.assessment;
        }

        // If consent is revoked, restrict access to simulation and assessment
        if (!hasActiveConsent && (location == AppRoutes.simulation || location == AppRoutes.assessment)) {
          return AppRoutes.home;
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.home,
        name: 'home',
        builder: (context, state) => HomeScreen(
          onStartAssessment: () => context.push(AppRoutes.assessment),
          onReconsent: () => context.push(AppRoutes.consent),
          onOpenSimulation: () => context.go(AppRoutes.simulation),
          onOpenSimulationWithFocus: (focus) => context.go('${AppRoutes.simulation}?focus=$focus'),
          onOpenProfile: () => context.go(AppRoutes.profile),
        ),
      ),
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => LoginScreen(
          onNavigateToRegister: () {
            ref.read(authViewModeProvider.notifier).state = AuthViewMode.register;
            context.go(AppRoutes.register);
          },
        ),
      ),
      GoRoute(
        path: AppRoutes.register,
        name: 'register',
        builder: (context, state) {
          var isFirstLaunch = false;
          try {
            isFirstLaunch = ref.watch(isFirstLaunchProvider);
          } catch (_) {
            isFirstLaunch = false;
          }
          final viewMode = ref.watch(authViewModeProvider);

          return RegisterScreen(
            isFirstLaunch: isFirstLaunch && viewMode == null,
            onNavigateToLogin: () {
              try {
                ref.read(isFirstLaunchProvider.notifier).markLaunched();
              } catch (_) {
                // Ignore if unmounted in tests
              }
              ref.read(authViewModeProvider.notifier).state = AuthViewMode.login;
              context.go(AppRoutes.login);
            },
            onRegistrationSuccess: () {
              try {
                ref.read(isFirstLaunchProvider.notifier).markLaunched();
              } catch (_) {
                // Ignore if unmounted in tests
              }
            },
          );
        },
      ),
      GoRoute(
        path: AppRoutes.consent,
        name: 'consent',
        builder: (context, state) => ConsentScreen(
          onConsentGranted: () {
            ref.invalidate(consentStatusProvider);
            ref.invalidate(healthProfileProvider);
            final latestAssessment = ref.read(latestAssessmentProvider).asData?.value;
            if (latestAssessment == null) {
              context.go(AppRoutes.assessment);
            } else if (context.canPop()) {
              context.pop();
            } else {
              context.go(AppRoutes.home);
            }
          },
        ),
      ),
      GoRoute(
        path: AppRoutes.assessment,
        name: 'assessment',
        builder: (context, state) {
          final initialProfile = state.extra as HealthProfileResponse?;
          return AssessmentFlowScreen(
            initialProfile: initialProfile,
            onBack: initialProfile != null ? () => context.pop() : null,
            onAssessmentCompleted: () {
              ref.invalidate(latestAssessmentProvider);
              ref.invalidate(healthProfileProvider);
              if (context.canPop()) {
                context.pop();
              } else {
                context.go(AppRoutes.home);
              }
            },
          );
        },
      ),
      GoRoute(
        path: AppRoutes.simulation,
        name: 'simulation',
        builder: (context, state) {
          final focus = state.uri.queryParameters['focus'];
          return SimulationScreen(
            initialFocus: focus,
            onNavigateHome: () => context.go(AppRoutes.home),
            onNavigateProfile: () => context.go(AppRoutes.profile),
          );
        },
      ),
      GoRoute(
        path: AppRoutes.profile,
        name: 'profile',
        builder: (context, state) => ProfileScreen(
          onNavigateHome: () => context.go(AppRoutes.home),
          onNavigateSimulation: () => context.go(AppRoutes.simulation),
          onEditHealthProfile: () {
            final currentProfile = ref.read(healthProfileProvider).asData?.value;
            context.push(AppRoutes.assessment, extra: currentProfile);
          },
          onReconsent: () => context.push(AppRoutes.consent),
          onConsentRevoked: () {
            context.go(AppRoutes.home);
          },
        ),
      ),
    ],
  );
});
