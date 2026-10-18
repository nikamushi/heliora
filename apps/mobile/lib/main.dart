import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/config/app_config.dart';
import 'core/storage/preferences_service.dart';
import 'core/storage/secure_storage_service.dart';
import 'features/auth/presentation/auth_controller.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/register_screen.dart';
import 'features/consent/presentation/consent_controller.dart';
import 'features/consent/presentation/consent_screen.dart';
import 'features/assessment/data/assessment_repository.dart';
import 'features/assessment/presentation/assessment_flow_screen.dart';
import 'features/home/presentation/home_screen.dart';
import 'features/profile/presentation/profile_screen.dart';
import 'features/simulation/presentation/simulation_screen.dart';

import 'features/splash/presentation/splash_screen.dart';
import 'theme/theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final config = AppConfig.fromEnvironment();
  final prefs = await SharedPreferences.getInstance();

  try {
    await Supabase.initialize(
      url: config.supabaseUrl,
      publishableKey: config.supabaseAnonKey,
      authOptions: FlutterAuthClientOptions(
        localStorage: SecureSupabaseLocalStorage(),
      ),
    );
  } catch (e) {
    debugPrint('Supabase initialization handled: $e');
  }

  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
      child: const HelioraApp(),
    ),
  );
}

/// Navigation mode for unauthenticated users.
enum AuthViewMode { login, register }

/// Provider tracking active unauthenticated screen.
final authViewModeProvider = StateProvider<AuthViewMode?>((ref) => null);

/// Root widget. Design tokens (MOB-004) and routing (MOB-005) plug in here.
class HelioraApp extends ConsumerStatefulWidget {
  const HelioraApp({
    super.key,
    this.showSplash = true,
  });

  /// Controls whether the cold-start animated splash screen is shown.
  final bool showSplash;

  @override
  ConsumerState<HelioraApp> createState() => _HelioraAppState();
}

class _HelioraAppState extends ConsumerState<HelioraApp> {
  late bool _splashActive;

  @override
  void initState() {
    super.initState();
    _splashActive = widget.showSplash;
  }

  @override
  Widget build(BuildContext context) {
    final isAuthenticated = ref.watch(isAuthenticatedProvider);

    return MaterialApp(
      title: 'HELIORA',
      debugShowCheckedModeBanner: false,
      theme: HelioraTheme.lightTheme,
      darkTheme: HelioraTheme.darkTheme,
      home: Builder(
        builder: (context) {
          final reduceMotion = MediaQuery.maybeOf(context)?.disableAnimations ?? false;
          return AnimatedSwitcher(
            duration: Duration(milliseconds: reduceMotion ? 150 : 200),
            child: _splashActive
                ? SplashScreen(
                    key: const ValueKey('splash_screen'),
                    onSplashComplete: () {
                      if (mounted) {
                        setState(() => _splashActive = false);
                      }
                    },
                  )
                : (isAuthenticated
                    ? const _AuthenticatedFlowRouter(
                        key: ValueKey('authenticated_router'),
                      )
                    : const _UnauthenticatedNavigationFlow(
                        key: ValueKey('unauthenticated_router'),
                      )),
          );
        },
      ),
    );
  }
}

/// Router enforcing consent-aware navigation for authenticated users (BR-CONSENT-001).
class _AuthenticatedFlowRouter extends ConsumerStatefulWidget {
  const _AuthenticatedFlowRouter({super.key});

  @override
  ConsumerState<_AuthenticatedFlowRouter> createState() =>
      _AuthenticatedFlowRouterState();
}

class _AuthenticatedFlowRouterState
    extends ConsumerState<_AuthenticatedFlowRouter>
    with WidgetsBindingObserver {
  bool _inAssessmentFlow = false;
  bool _inConsentFlow = false;
  bool _inSimulationFlow = false;
  bool _inProfileFlow = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Re-check consent status when app returns to foreground (Tiket 05)
      ref.read(consentControllerProvider.notifier).refreshStatus();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_inAssessmentFlow) {
      return AssessmentFlowScreen(
        onAssessmentCompleted: () {
          setState(() => _inAssessmentFlow = false);
          ref.invalidate(latestAssessmentProvider);
        },
      );
    }

    if (_inConsentFlow) {
      return ConsentScreen(
        onConsentGranted: () {
          setState(() => _inConsentFlow = false);
          ref.invalidate(consentStatusProvider);
        },
      );
    }

    if (_inSimulationFlow) {
      return SimulationScreen(
        onNavigateHome: () {
          setState(() => _inSimulationFlow = false);
        },
        onNavigateProfile: () {
          setState(() {
            _inSimulationFlow = false;
            _inProfileFlow = true;
          });
        },
      );
    }

    if (_inProfileFlow) {
      return ProfileScreen(
        onNavigateHome: () {
          setState(() => _inProfileFlow = false);
        },
        onNavigateSimulation: () {
          setState(() {
            _inProfileFlow = false;
            _inSimulationFlow = true;
          });
        },
        onEditHealthProfile: () {
          setState(() {
            _inProfileFlow = false;
            _inAssessmentFlow = true;
          });
        },
        onConsentRevoked: () {
          setState(() {
            _inProfileFlow = false;
            _inSimulationFlow = false;
          });
        },
      );
    }

    final consentStatusAsync = ref.watch(consentStatusProvider);

    return consentStatusAsync.when(
      data: (status) {
        // If user never had any consent recorded at all (brand new user onboarding)
        if (!status.hasActiveConsent && status.activeConsent == null) {
          return ConsentScreen(
            onConsentGranted: () {
              ref.invalidate(consentStatusProvider);
            },
          );
        }

        return HomeScreen(
          onStartAssessment: () {
            setState(() => _inAssessmentFlow = true);
          },
          onReconsent: () {
            setState(() => _inConsentFlow = true);
          },
          onOpenSimulation: () {
            setState(() => _inSimulationFlow = true);
          },
          onOpenProfile: () {
            setState(() => _inProfileFlow = true);
          },
        );
      },
      loading: () => const Scaffold(
        backgroundColor: Color(0xFFF7F9F8),
        body: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation(Color(0xFF0F7A4E)),
          ),
        ),
      ),
      error: (_, _) => HomeScreen(
        onStartAssessment: () {
          setState(() => _inAssessmentFlow = true);
        },
        onReconsent: () {
          setState(() => _inConsentFlow = true);
        },
        onOpenSimulation: () {
          setState(() => _inSimulationFlow = true);
        },
        onOpenProfile: () {
          setState(() => _inProfileFlow = true);
        },
      ),
    );
  }
}



class _UnauthenticatedNavigationFlow extends ConsumerWidget {
  const _UnauthenticatedNavigationFlow({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Gracefully handle uninitialized SharedPreferences in testing
    var isFirstLaunch = false;
    try {
      isFirstLaunch = ref.watch(isFirstLaunchProvider);
    } catch (_) {
      isFirstLaunch = false;
    }

    final viewMode = ref.watch(authViewModeProvider);

    // First launch cold-start defaults to Register, subsequent launches default to Login (MFR-012)
    final effectiveMode =
        viewMode ?? (isFirstLaunch ? AuthViewMode.register : AuthViewMode.login);

    if (effectiveMode == AuthViewMode.register) {
      return RegisterScreen(
        isFirstLaunch: isFirstLaunch && viewMode == null,
        onNavigateToLogin: () {
          try {
            ref.read(isFirstLaunchProvider.notifier).markLaunched();
          } catch (_) {}
          ref.read(authViewModeProvider.notifier).state = AuthViewMode.login;
        },
        onRegistrationSuccess: () {
          try {
            ref.read(isFirstLaunchProvider.notifier).markLaunched();
          } catch (_) {}
        },
      );
    } else {
      return LoginScreen(
        onNavigateToRegister: () {
          ref.read(authViewModeProvider.notifier).state = AuthViewMode.register;
        },
      );
    }
  }
}

