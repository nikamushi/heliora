import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:heliora_mobile/core/api/generated/models/assessment_summary_response.dart';
import 'package:heliora_mobile/core/api/generated/models/consent_status_response.dart';
import 'package:heliora_mobile/features/assessment/data/assessment_repository.dart';
import 'package:heliora_mobile/features/auth/presentation/auth_controller.dart';
import 'package:heliora_mobile/features/consent/presentation/consent_controller.dart';
import 'package:heliora_mobile/main.dart';

void main() {
  testWidgets('app starts and shows login screen by default when not first launch',
      (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          isAuthenticatedProvider.overrideWithValue(false),
          authViewModeProvider.overrideWith((ref) => AuthViewMode.login),
        ],
        child: const HelioraApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Masuk ke HELIORA'), findsOneWidget);
    expect(find.text('Lanjutkan asesmen gaya hidup Anda.'), findsOneWidget);
    expect(find.widgetWithText(ElevatedButton, 'Masuk'), findsOneWidget);
  });

  testWidgets('app starts and shows register screen on first launch',
      (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          isAuthenticatedProvider.overrideWithValue(false),
          authViewModeProvider.overrideWith((ref) => AuthViewMode.register),
        ],
        child: const HelioraApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Buat akun HELIORA'), findsOneWidget);
    expect(find.text('Daftar'), findsNWidgets(2));
  });

  testWidgets('app starts and shows consent screen when authenticated without active consent',
      (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          isAuthenticatedProvider.overrideWithValue(true),
          consentStatusProvider.overrideWith(
            (ref) => Future.value(const ConsentStatusResponse(hasActiveConsent: false)),
          ),
        ],
        child: const HelioraApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Sebelum memulai asesmen'), findsOneWidget);
    expect(find.text('LANGKAH 01 / 02 · PERSETUJUAN DATA'), findsOneWidget);
  });

  testWidgets('app shows empty home screen and navigates to assessment flow when authenticated with active consent but no assessment',
      (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          isAuthenticatedProvider.overrideWithValue(true),
          consentStatusProvider.overrideWith(
            (ref) => Future.value(const ConsentStatusResponse(hasActiveConsent: true)),
          ),
          latestAssessmentProvider.overrideWith((ref) => Future.value(null)),
        ],
        child: const HelioraApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Belum Ada Asesmen'), findsOneWidget);
    expect(find.text('Mulai Asesmen'), findsOneWidget);

    // Tap "Mulai Asesmen" button to navigate to assessment flow
    await tester.tap(find.text('Mulai Asesmen'));
    await tester.pumpAndSettle();

    expect(find.text('LANGKAH 02 / 02 · PROFIL KESEHATAN'), findsOneWidget);
    expect(find.text('Tahap 1 dari 3'), findsOneWidget);
    expect(find.text('Data dasar'), findsOneWidget);
  });

  testWidgets('app starts and shows home screen when authenticated with active consent and existing assessment',
      (tester) async {
    const dummyAssessment = AssessmentSummaryResponse(
      id: 'existing-assessment',
      healthScore: 82,
      lifestyleScore: 78,
      risks: [],
      topFactors: [],
      recommendations: [],
      assessedAt: '2026-10-12T00:00:00Z',
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          isAuthenticatedProvider.overrideWithValue(true),
          currentUserProfileProvider.overrideWith((ref) => null),
          consentStatusProvider.overrideWith(
            (ref) => Future.value(const ConsentStatusResponse(hasActiveConsent: true)),
          ),
          latestAssessmentProvider.overrideWith((ref) => Future.value(dummyAssessment)),
        ],
        child: const HelioraApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Health Score'), findsOneWidget);
    expect(find.text('Lifestyle Score'), findsOneWidget);
    expect(find.text('ESTIMASI RISIKO 10 TAHUN'), findsOneWidget);
    expect(find.text('Buka Simulasi'), findsOneWidget);
    expect(find.byTooltip('Keluar'), findsOneWidget);
  });
}

