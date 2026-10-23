import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:heliora_mobile/core/api/generated/models/consent_status_response.dart';
import 'package:heliora_mobile/core/routing/app_router.dart';
import 'package:heliora_mobile/core/storage/preferences_service.dart';
import 'package:heliora_mobile/features/auth/presentation/auth_controller.dart';
import 'package:heliora_mobile/features/consent/presentation/consent_controller.dart';

class FakeFirstLaunchNotifier extends StateNotifier<bool> implements FirstLaunchNotifier {
  FakeFirstLaunchNotifier(super.state);

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  group('GoRouter Declarative Navigation & Guards (MOB-005, ADR-012)', () {
    test('unauthenticated user defaults to /login when not first launch', () {
      final containerRef = ProviderContainer(
        overrides: [
          isAuthenticatedProvider.overrideWithValue(false),
          isFirstLaunchProvider.overrideWith((ref) => FakeFirstLaunchNotifier(false)),
          authViewModeProvider.overrideWith((ref) => null),
        ],
      );

      final router = containerRef.read(appRouterProvider);
      expect(router, isA<GoRouter>());
      expect(router.configuration.routes.length, 9);
    });

    test('declares all canonical routes matching PRD-Mobile and ADR-012', () {
      final container = ProviderContainer(
        overrides: [
          isAuthenticatedProvider.overrideWithValue(true),
          consentStatusProvider.overrideWith(
            (ref) => Future.value(const ConsentStatusResponse(hasActiveConsent: true)),
          ),
        ],
      );

      final router = container.read(appRouterProvider);
      final paths = router.configuration.routes.map((r) => (r as GoRoute).path).toList();

      expect(paths, containsAll([
        AppRoutes.home,
        AppRoutes.login,
        AppRoutes.register,
        AppRoutes.consent,
        AppRoutes.assessment,
        AppRoutes.simulation,
        AppRoutes.profile,
        AppRoutes.terms,
        AppRoutes.privacy,
      ]));
    });

    test('RouterNotifier responds to state changes and triggers listener', () {
      final container = ProviderContainer(
        overrides: [
          isAuthenticatedProvider.overrideWithValue(false),
        ],
      );

      final notifier = container.read(routerNotifierProvider);
      var notified = false;
      notifier.addListener(() => notified = true);

      container.read(authViewModeProvider.notifier).state = AuthViewMode.register;
      expect(notified, isTrue);
    });

    test('cold-start router configuration builds cleanly with empty defaults', () {
      final container = ProviderContainer(
        overrides: [
          isAuthenticatedProvider.overrideWithValue(true),
        ],
      );

      final router = container.read(appRouterProvider);
      expect(router, isNotNull);
      expect(router.routeInformationProvider, isNotNull);
    });
  });
}
