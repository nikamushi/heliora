import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:heliora_mobile/core/api/generated/export.dart';
import 'package:heliora_mobile/features/assessment/data/health_profile_repository.dart';
import 'package:heliora_mobile/features/auth/data/auth_repository.dart';
import 'package:heliora_mobile/features/auth/presentation/auth_controller.dart';
import 'package:heliora_mobile/features/consent/data/consent_repository.dart';
import 'package:heliora_mobile/features/consent/presentation/consent_controller.dart';
import 'package:heliora_mobile/features/home/presentation/widgets/bottom_nav_bar.dart';
import 'package:heliora_mobile/features/profile/presentation/profile_screen.dart';

class FakeAuthRepository implements AuthRepository {
  bool signOutCalled = false;

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<UserResponse> fetchCurrentUserProfile() async {
    return UserResponse(
      id: 'usr-123',
      email: 'alexa@heliora.id',
      fullName: 'Alexa Wijaya',
      createdAt: DateTime(2026, 1, 15),
    );
  }

  @override
  Future<void> signOut() async {
    signOutCalled = true;
  }
}

class FakeHealthProfileRepository implements HealthProfileRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<HealthProfileResponse?> getHealthProfile() async {
    return const HealthProfileResponse(
      id: 'prof-999',
      userId: 'usr-123',
      age: 29,
      gender: 'female',
      heightCm: 168,
      weightKg: 58.5,
      physicalActivityMinPerWeek: 180,
      sleepDurationHours: 7.5,
      smokingStatus: 'never',
      familyHistory: true,
    );
  }
}

class FakeConsentRepository implements ConsentRepository {
  bool revokeCalled = false;

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<ConsentStatusResponse> getConsentStatus() async {
    return ConsentStatusResponse(
      hasActiveConsent: true,
      termsVersion: '1.0',
      activeConsent: ConsentResponse(
        id: 'c-001',
        userId: 'usr-123',
        consentVersion: '1.0',
        acceptedAt: DateTime(2026, 10, 10, 14, 30),
        isActive: true,
      ),
    );
  }

  @override
  Future<ConsentResponse> revokeConsent() async {
    revokeCalled = true;
    return ConsentResponse(
      id: 'c-001',
      userId: 'usr-123',
      consentVersion: '1.0',
      acceptedAt: DateTime(2026, 10, 10, 14, 30),
      isActive: false,
      revokedAt: DateTime(2026, 10, 13, 10, 0),
    );
  }
}

void main() {
  group('ProfileScreen Widget Tests (MFR-010, BR-CONSENT-003)', () {
    testWidgets('renders user identity and health profile summary from API', (tester) async {
      final fakeAuth = FakeAuthRepository();
      final fakeHealth = FakeHealthProfileRepository();
      final fakeConsent = FakeConsentRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authRepositoryProvider.overrideWithValue(fakeAuth),
            healthProfileRepositoryProvider.overrideWithValue(fakeHealth),
            consentRepositoryProvider.overrideWithValue(fakeConsent),
            currentUserProfileProvider.overrideWith((ref) => fakeAuth.fetchCurrentUserProfile()),
            healthProfileProvider.overrideWith((ref) => fakeHealth.getHealthProfile()),
            consentStatusProvider.overrideWith((ref) => fakeConsent.getConsentStatus()),
          ],
          child: const MaterialApp(
            home: ProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Check User Identity
      expect(find.text('Profil & Privasi'), findsOneWidget);
      expect(find.text('Alexa Wijaya'), findsOneWidget);
      expect(find.text('alexa@heliora.id'), findsOneWidget);

      // Check Health Profile Summary
      expect(find.text('RINGKASAN PROFIL KESEHATAN'), findsOneWidget);
      expect(find.text('29 tahun • Perempuan'), findsOneWidget);
      expect(find.text('168 cm • 58.5 kg'), findsOneWidget);
      expect(find.text('7.5 jam / hari'), findsOneWidget);
      expect(find.text('180 menit / minggu'), findsOneWidget);
      expect(find.text('Tidak pernah merokok'), findsOneWidget);
      expect(find.text('Ada riwayat keluarga'), findsOneWidget);

      // Check Consent Section
      expect(find.text('PERSETUJUAN & ETIKA DATA'), findsOneWidget);
      expect(find.text('Persetujuan Aktif'), findsOneWidget);
      expect(find.text('Versi 1.0 (BR-CONSENT-001)'), findsOneWidget);
      expect(find.byType(HelioraBottomNav), findsOneWidget);
    });

    testWidgets('tapping "Perbarui profil kesehatan" triggers onEditHealthProfile callback',
        (tester) async {
      var editCalled = false;
      final fakeAuth = FakeAuthRepository();
      final fakeHealth = FakeHealthProfileRepository();
      final fakeConsent = FakeConsentRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authRepositoryProvider.overrideWithValue(fakeAuth),
            healthProfileRepositoryProvider.overrideWithValue(fakeHealth),
            consentRepositoryProvider.overrideWithValue(fakeConsent),
            currentUserProfileProvider.overrideWith((ref) => fakeAuth.fetchCurrentUserProfile()),
            healthProfileProvider.overrideWith((ref) => fakeHealth.getHealthProfile()),
            consentStatusProvider.overrideWith((ref) => fakeConsent.getConsentStatus()),
          ],
          child: MaterialApp(
            home: ProfileScreen(
              onEditHealthProfile: () => editCalled = true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Perbarui profil kesehatan'));
      await tester.tap(find.text('Perbarui profil kesehatan'));
      await tester.pumpAndSettle();

      expect(editCalled, isTrue);
    });

    testWidgets('tapping "Cabut persetujuan" opens confirmation dialog and executes revokeConsent',
        (tester) async {
      var revokedCalled = false;
      final fakeAuth = FakeAuthRepository();
      final fakeHealth = FakeHealthProfileRepository();
      final fakeConsent = FakeConsentRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authRepositoryProvider.overrideWithValue(fakeAuth),
            healthProfileRepositoryProvider.overrideWithValue(fakeHealth),
            consentRepositoryProvider.overrideWithValue(fakeConsent),
            currentUserProfileProvider.overrideWith((ref) => fakeAuth.fetchCurrentUserProfile()),
            healthProfileProvider.overrideWith((ref) => fakeHealth.getHealthProfile()),
            consentStatusProvider.overrideWith((ref) => fakeConsent.getConsentStatus()),
          ],
          child: MaterialApp(
            home: ProfileScreen(
              onConsentRevoked: () => revokedCalled = true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Cabut persetujuan
      await tester.ensureVisible(find.text('Cabut persetujuan'));
      await tester.tap(find.text('Cabut persetujuan'));
      await tester.pumpAndSettle();

      // Dialog opens
      expect(find.text('Cabut Persetujuan Data Medis?'), findsOneWidget);
      expect(find.text('Batal'), findsOneWidget);
      expect(find.text('Ya, Cabut Persetujuan'), findsOneWidget);

      // Confirm revocation
      await tester.tap(find.text('Ya, Cabut Persetujuan'));
      await tester.pumpAndSettle();

      expect(fakeConsent.revokeCalled, isTrue);
      expect(revokedCalled, isTrue);
    });

    testWidgets('tapping "Keluar dari Akun" opens confirmation dialog and signs out',
        (tester) async {
      final fakeAuth = FakeAuthRepository();
      final fakeHealth = FakeHealthProfileRepository();
      final fakeConsent = FakeConsentRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authRepositoryProvider.overrideWithValue(fakeAuth),
            healthProfileRepositoryProvider.overrideWithValue(fakeHealth),
            consentRepositoryProvider.overrideWithValue(fakeConsent),
            currentUserProfileProvider.overrideWith((ref) => fakeAuth.fetchCurrentUserProfile()),
            healthProfileProvider.overrideWith((ref) => fakeHealth.getHealthProfile()),
            consentStatusProvider.overrideWith((ref) => fakeConsent.getConsentStatus()),
          ],
          child: const MaterialApp(
            home: ProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Keluar
      await tester.ensureVisible(find.text('Keluar dari Akun'));
      await tester.tap(find.text('Keluar dari Akun'));
      await tester.pumpAndSettle();

      // Dialog
      expect(find.text('Keluar dari Heliora?'), findsOneWidget);
      expect(find.text('Keluar'), findsOneWidget);

      // Confirm sign out
      await tester.tap(find.text('Keluar'));
      await tester.pumpAndSettle();

      expect(fakeAuth.signOutCalled, isTrue);
    });

    testWidgets('bottom navigation tabs navigate to Home and Simulation', (tester) async {
      var homeCalled = false;
      var simCalled = false;

      final fakeAuth = FakeAuthRepository();
      final fakeHealth = FakeHealthProfileRepository();
      final fakeConsent = FakeConsentRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authRepositoryProvider.overrideWithValue(fakeAuth),
            healthProfileRepositoryProvider.overrideWithValue(fakeHealth),
            consentRepositoryProvider.overrideWithValue(fakeConsent),
            currentUserProfileProvider.overrideWith((ref) => fakeAuth.fetchCurrentUserProfile()),
            healthProfileProvider.overrideWith((ref) => fakeHealth.getHealthProfile()),
            consentStatusProvider.overrideWith((ref) => fakeConsent.getConsentStatus()),
          ],
          child: MaterialApp(
            home: ProfileScreen(
              onNavigateHome: () => homeCalled = true,
              onNavigateSimulation: () => simCalled = true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Beranda tab
      await tester.tap(find.text('Beranda'));
      await tester.pumpAndSettle();
      expect(homeCalled, isTrue);

      // Tap Simulasi tab
      await tester.tap(find.text('Simulasi'));
      await tester.pumpAndSettle();
      expect(simCalled, isTrue);
    });
  });
}
