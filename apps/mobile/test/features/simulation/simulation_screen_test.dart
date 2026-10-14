import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:heliora_mobile/core/api/generated/export.dart';
import 'package:heliora_mobile/features/assessment/data/health_profile_repository.dart';
import 'package:heliora_mobile/features/home/presentation/widgets/bottom_nav_bar.dart';
import 'package:heliora_mobile/features/home/presentation/widgets/statutory_disclaimer_card.dart';
import 'package:heliora_mobile/features/simulation/data/simulation_repository.dart';
import 'package:heliora_mobile/features/simulation/presentation/simulation_screen.dart';
import 'package:heliora_mobile/features/simulation/presentation/widgets/delta_row.dart';

class FakeSimulationRepository implements SimulationRepository {
  bool shouldFail = false;

  @override
  Future<WhatIfSimulationResponse> runWhatIfSimulation(WhatIfSimulationRequest request) async {
    if (shouldFail) {
      throw Exception('Simulasi gagal di server');
    }
    return const WhatIfSimulationResponse(
      appliedParameters: {},
      derivedBmi: 23.2,
      baselineHealthScore: 74,
      simulatedHealthScore: 82,
      healthScoreDelta: 8,
      baselineLifestyleScore: 68,
      simulatedLifestyleScore: 79,
      lifestyleScoreDelta: 11,
      conditionComparisons: [
        WhatIfConditionComparison(
          condition: WhatIfConditionComparisonCondition.diabetes,
          label: 'Diabetes Tipe 2',
          baselineProbability: 0.14,
          simulatedProbability: 0.11,
          baselineScore: 14,
          simulatedScore: 11,
          deltaPercentage: -3.0,
          riskLevel: WhatIfConditionComparisonRiskLevel.low,
          riskLabel: WhatIfConditionComparisonRiskLabel.lower,
          trend: WhatIfConditionComparisonTrend.decreasing,
          impactSummary: 'Penurunan risiko diabetes tipe 2.',
        ),
        WhatIfConditionComparison(
          condition: WhatIfConditionComparisonCondition.hypertension,
          label: 'Hipertensi',
          baselineProbability: 0.25,
          simulatedProbability: 0.22,
          baselineScore: 25,
          simulatedScore: 22,
          deltaPercentage: -3.0,
          riskLevel: WhatIfConditionComparisonRiskLevel.moderate,
          riskLabel: WhatIfConditionComparisonRiskLabel.moderate,
          trend: WhatIfConditionComparisonTrend.decreasing,
          impactSummary: 'Penurunan risiko hipertensi.',
        ),
        WhatIfConditionComparison(
          condition: WhatIfConditionComparisonCondition.cardiovascular,
          label: 'Penyakit Kardiovaskular',
          baselineProbability: 0.10,
          simulatedProbability: 0.10,
          baselineScore: 10,
          simulatedScore: 10,
          deltaPercentage: 0.0,
          riskLevel: WhatIfConditionComparisonRiskLevel.low,
          riskLabel: WhatIfConditionComparisonRiskLabel.lower,
          trend: WhatIfConditionComparisonTrend.stable,
          impactSummary: 'Risiko kardiovaskular stabil.',
        ),
      ],
    );
  }
}

class FakeHealthProfileRepository implements HealthProfileRepository {
  @override
  Future<HealthProfileResponse?> getHealthProfile() async {
    return const HealthProfileResponse(
      id: 'prof-test',
      userId: 'user-test',
      age: 30,
      gender: 'female',
      heightCm: 165,
      weightKg: 62.0,
      physicalActivityMinPerWeek: 120,
      sleepDurationHours: 6.5,
      smokingStatus: 'never',
      familyHistory: false,
    );
  }

  @override
  Future<HealthProfileResponse> createHealthProfile(HealthProfileCreateRequest request) =>
      throw UnimplementedError();

  @override
  Future<HealthProfileResponse> updateHealthProfile(HealthProfileUpdateRequest request) =>
      throw UnimplementedError();

  @override
  Future<HealthProfileResponse> saveHealthProfile(HealthProfileCreateRequest request) =>
      throw UnimplementedError();
}

void main() {
  group('DeltaRow Widget Tests', () {
    testWidgets('renders condition, baseline to simulated arrow, and delta direction correctly',
        (tester) async {
      const comparison = WhatIfConditionComparison(
        condition: WhatIfConditionComparisonCondition.diabetes,
        label: 'Diabetes Tipe 2',
        baselineProbability: 0.12,
        simulatedProbability: 0.10,
        baselineScore: 12,
        simulatedScore: 10,
        deltaPercentage: -2.0,
        riskLevel: WhatIfConditionComparisonRiskLevel.low,
        riskLabel: WhatIfConditionComparisonRiskLabel.lower,
        trend: WhatIfConditionComparisonTrend.decreasing,
        impactSummary: 'Risiko menurun.',
      );

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: DeltaRow(comparison: comparison),
          ),
        ),
      );

      expect(find.text('Diabetes Tipe 2'), findsOneWidget);
      expect(find.text('12%'), findsOneWidget);
      expect(find.text('10%'), findsOneWidget);
      expect(find.text('-2%'), findsOneWidget);
    });
  });

  group('SimulationScreen Widget Tests', () {
    testWidgets('renders all initial lifestyle sliders, baseline labels, and disclaimers',
        (tester) async {
      final fakeSimRepo = FakeSimulationRepository();
      final fakeProfileRepo = FakeHealthProfileRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            simulationRepositoryProvider.overrideWithValue(fakeSimRepo),
            healthProfileRepositoryProvider.overrideWithValue(fakeProfileRepo),
          ],
          child: const MaterialApp(
            home: SimulationScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Simulasi Gaya Hidup'), findsOneWidget);
      expect(find.text('UBAH KEBIASAAN'), findsOneWidget);
      expect(find.text('PROYEKSI ESTIMASI RISIKO'), findsOneWidget);

      // Check lifestyle sliders
      expect(find.text('Durasi tidur harian'), findsOneWidget);
      expect(find.text('Aktivitas fisik mingguan'), findsOneWidget);
      expect(find.text('Berat badan'), findsOneWidget);

      // Check Buttons
      expect(find.text('Atur ulang'), findsOneWidget);
      expect(find.text('Jalankan simulasi'), findsOneWidget);

      // Check disclaimer
      expect(find.byType(StatutoryDisclaimerCard), findsOneWidget);
      expect(find.byType(HelioraBottomNav), findsOneWidget);
    });

    testWidgets('tapping "Jalankan simulasi" executes what-if scenario and displays delta outcomes',
        (tester) async {
      final fakeSimRepo = FakeSimulationRepository();
      final fakeProfileRepo = FakeHealthProfileRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            simulationRepositoryProvider.overrideWithValue(fakeSimRepo),
            healthProfileRepositoryProvider.overrideWithValue(fakeProfileRepo),
          ],
          child: const MaterialApp(
            home: SimulationScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap "Jalankan simulasi"
      await tester.ensureVisible(find.text('Jalankan simulasi'));
      await tester.tap(find.text('Jalankan simulasi'));
      await tester.pumpAndSettle();

      // Outcomes summary
      await tester.ensureVisible(find.text('Health Score'));
      expect(find.text('Health Score'), findsOneWidget);
      expect(find.text('82'), findsOneWidget);
      expect(find.text('(+8)'), findsOneWidget);

      expect(find.text('Lifestyle Score'), findsOneWidget);
      expect(find.text('79'), findsOneWidget);
      expect(find.text('(+11)'), findsOneWidget);

      // Condition comparisons
      expect(find.text('Diabetes Tipe 2'), findsOneWidget);
      expect(find.text('Hipertensi'), findsOneWidget);
      expect(find.text('Penyakit Kardiovaskular'), findsOneWidget);
      expect(find.text('Tetap'), findsOneWidget);
      expect(find.byType(DeltaRow), findsNWidgets(3));
    });

    testWidgets('shows failure inline alert and allows retry when API fails', (tester) async {
      final fakeSimRepo = FakeSimulationRepository()..shouldFail = true;
      final fakeProfileRepo = FakeHealthProfileRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            simulationRepositoryProvider.overrideWithValue(fakeSimRepo),
            healthProfileRepositoryProvider.overrideWithValue(fakeProfileRepo),
          ],
          child: const MaterialApp(
            home: SimulationScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap "Jalankan simulasi"
      await tester.ensureVisible(find.text('Jalankan simulasi'));
      await tester.tap(find.text('Jalankan simulasi'));
      await tester.pumpAndSettle();

      // Check failure UI
      await tester.ensureVisible(find.text('Coba lagi'));
      expect(find.text('Coba lagi'), findsOneWidget);

      // Tap retry with success
      fakeSimRepo.shouldFail = false;
      await tester.tap(find.text('Coba lagi'));
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('PROYEKSI ESTIMASI RISIKO'));
      expect(find.text('PROYEKSI ESTIMASI RISIKO'), findsOneWidget);
      expect(find.byType(DeltaRow), findsNWidgets(3));
    });

    testWidgets('navigates home when back or tab 0 is tapped', (tester) async {
      var homeNavigated = false;
      final fakeSimRepo = FakeSimulationRepository();
      final fakeProfileRepo = FakeHealthProfileRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            simulationRepositoryProvider.overrideWithValue(fakeSimRepo),
            healthProfileRepositoryProvider.overrideWithValue(fakeProfileRepo),
          ],
          child: MaterialApp(
            home: SimulationScreen(
              onNavigateHome: () => homeNavigated = true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap "Beranda" tab
      await tester.tap(find.text('Beranda'));
      await tester.pumpAndSettle();

      expect(homeNavigated, isTrue);
    });
  });
}
