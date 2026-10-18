import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:heliora_mobile/core/api/generated/export.dart';
import 'package:heliora_mobile/features/assessment/data/assessment_repository.dart';
import 'package:heliora_mobile/features/consent/presentation/consent_controller.dart';
import 'package:heliora_mobile/features/home/presentation/home_screen.dart';
import 'package:heliora_mobile/features/home/presentation/widgets/bottom_nav_bar.dart';
import 'package:heliora_mobile/features/home/presentation/widgets/risk_card.dart';
import 'package:heliora_mobile/features/home/presentation/widgets/score_card.dart';
import 'package:heliora_mobile/features/home/presentation/widgets/simulation_banner.dart';
import 'package:heliora_mobile/features/home/presentation/widgets/statutory_disclaimer_card.dart';

void main() {
  group('ScoreCard Widget Tests', () {
    testWidgets('displays Health Score with optimal clinical interpretation', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ScoreCard(
              title: 'Health Score',
              score: 85,
              isHealthScore: true,
            ),
          ),
        ),
      );

      expect(find.text('Health Score'), findsOneWidget);
      expect(find.text('85'), findsOneWidget);
      expect(find.text('/100'), findsOneWidget);
      expect(find.text('Kondisi Optimal'), findsOneWidget);
    });

    testWidgets('displays Lifestyle Score with descriptive interpretation', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ScoreCard(
              title: 'Lifestyle Score',
              score: 65,
              isHealthScore: false,
            ),
          ),
        ),
      );

      expect(find.text('Lifestyle Score'), findsOneWidget);
      expect(find.text('65'), findsOneWidget);
      expect(find.text('/100'), findsOneWidget);
      expect(find.text('Cukup Seimbang'), findsOneWidget);
    });

  });

  group('RiskCard Widget Tests', () {
    testWidgets('displays condition, percentage, status text with icon and trend without pill chips',
        (tester) async {
      const riskItem = RiskAssessmentItem(
        condition: RiskAssessmentItemCondition.diabetes,
        label: 'Diabetes Tipe 2',
        probability: 0.14,
        estimatedRiskScore: 14,
        riskLevel: RiskAssessmentItemRiskLevel.low,
        riskLabel: RiskAssessmentItemRiskLabel.lower,
        trend: RiskAssessmentItemTrend.decreasing,
        description: 'Risiko diabetes rendah berdasarkan profil terkini.',
      );

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: RiskCard(item: riskItem),
          ),
        ),
      );

      expect(find.text('Diabetes Tipe 2'), findsOneWidget);
      expect(find.text('14%'), findsOneWidget);
      expect(find.text('estimasi 10 tahun'), findsOneWidget);
      expect(find.text('Risiko Rendah'), findsOneWidget);
      expect(find.text('Tren menurun'), findsOneWidget);
      expect(find.byType(LinearProgressIndicator), findsOneWidget);
    });

    testWidgets('displays moderate and higher risk statuses properly', (tester) async {
      const moderateItem = RiskAssessmentItem(
        condition: RiskAssessmentItemCondition.hypertension,
        label: 'Hipertensi',
        probability: 0.28,
        estimatedRiskScore: 28,
        riskLevel: RiskAssessmentItemRiskLevel.moderate,
        riskLabel: RiskAssessmentItemRiskLabel.moderate,
        trend: RiskAssessmentItemTrend.stable,
        description: 'Perlu modifikasi asupan garam.',
      );

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: RiskCard(item: moderateItem),
          ),
        ),
      );

      expect(find.text('Hipertensi'), findsOneWidget);
      expect(find.text('28%'), findsOneWidget);
      expect(find.text('Risiko Sedang'), findsOneWidget);
      expect(find.text('Tren stabil'), findsOneWidget);
    });
  });

  group('HomeScreen State Tests', () {
    testWidgets('renders normal state with full assessment data and triggers navigation',
        (tester) async {
      var simulationTapped = false;
      const dummyAssessment = AssessmentSummaryResponse(
        id: 'test-assessment-01',
        healthScore: 78,
        lifestyleScore: 72,
        risks: [
          RiskAssessmentItem(
            condition: RiskAssessmentItemCondition.diabetes,
            label: 'Diabetes Tipe 2',
            probability: 0.12,
            estimatedRiskScore: 12,
            riskLevel: RiskAssessmentItemRiskLevel.low,
            riskLabel: RiskAssessmentItemRiskLabel.lower,
            trend: RiskAssessmentItemTrend.stable,
            description: 'Risiko diabetes rendah.',
          ),
          RiskAssessmentItem(
            condition: RiskAssessmentItemCondition.hypertension,
            label: 'Hipertensi',
            probability: 0.25,
            estimatedRiskScore: 25,
            riskLevel: RiskAssessmentItemRiskLevel.moderate,
            riskLabel: RiskAssessmentItemRiskLabel.moderate,
            trend: RiskAssessmentItemTrend.increasing,
            description: 'Risiko hipertensi sedang.',
          ),
          RiskAssessmentItem(
            condition: RiskAssessmentItemCondition.cardiovascular,
            label: 'Penyakit Kardiovaskular',
            probability: 0.09,
            estimatedRiskScore: 9,
            riskLevel: RiskAssessmentItemRiskLevel.low,
            riskLabel: RiskAssessmentItemRiskLabel.lower,
            trend: RiskAssessmentItemTrend.decreasing,
            description: 'Risiko kardiovaskular rendah.',
          ),
        ],
        topFactors: [],
        recommendations: [],
        assessedAt: '2026-10-12T00:00:00Z',
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            consentStatusProvider.overrideWith(
              (ref) => Future.value(const ConsentStatusResponse(hasActiveConsent: true)),
            ),
            latestAssessmentProvider.overrideWith(
              (ref) => Future.value(dummyAssessment),
            ),
          ],
          child: MaterialApp(
            home: HomeScreen(
              onOpenSimulation: () => simulationTapped = true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Top Scores
      expect(find.text('Health Score'), findsOneWidget);
      expect(find.text('78'), findsOneWidget);
      expect(find.text('Lifestyle Score'), findsOneWidget);
      expect(find.text('72'), findsOneWidget);

      // Section Eyebrow
      expect(find.text('ESTIMASI RISIKO 10 TAHUN'), findsOneWidget);

      // 3 Risk Cards
      expect(find.text('Diabetes Tipe 2'), findsOneWidget);
      expect(find.text('Hipertensi'), findsOneWidget);
      expect(find.text('Penyakit Kardiovaskular'), findsOneWidget);
      expect(find.text('12%'), findsOneWidget);
      expect(find.text('25%'), findsOneWidget);
      expect(find.text('9%'), findsOneWidget);

      // Simulation Banner & Statutory Disclaimer
      expect(find.byType(SimulationBanner), findsOneWidget);
      expect(find.byType(StatutoryDisclaimerCard), findsOneWidget);
      expect(find.byType(HelioraBottomNav), findsOneWidget);

      // Scroll and Tap Simulation CTA
      await tester.scrollUntilVisible(find.text('Buka Simulasi'), 200);
      await tester.tap(find.text('Buka Simulasi'));
      await tester.pumpAndSettle();
      expect(simulationTapped, isTrue);

    });

    testWidgets('renders empty state when assessment is null with explicit CTA "Mulai Asesmen"',
        (tester) async {
      var startAssessmentTapped = false;

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            consentStatusProvider.overrideWith(
              (ref) => Future.value(const ConsentStatusResponse(hasActiveConsent: true)),
            ),
            latestAssessmentProvider.overrideWith(
              (ref) => Future.value(null),
            ),
          ],
          child: MaterialApp(
            home: HomeScreen(
              onStartAssessment: () => startAssessmentTapped = true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Belum Ada Asesmen'), findsOneWidget);
      expect(
        find.text(
          'Lengkapi profil gaya hidup dan kesehatan Anda untuk mendapatkan skor kesehatan dan estimasi risiko preventif.',
        ),
        findsOneWidget,
      );
      expect(find.text('Mulai Asesmen'), findsOneWidget);
      expect(find.byType(StatutoryDisclaimerCard), findsOneWidget);

      // Tap "Mulai Asesmen"
      await tester.tap(find.text('Mulai Asesmen'));
      await tester.pumpAndSettle();
      expect(startAssessmentTapped, isTrue);
    });

    testWidgets('renders neutral state when consent is revoked with reconsent CTA',
        (tester) async {
      var reconsentTapped = false;

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            consentStatusProvider.overrideWith(
              (ref) => Future.value(const ConsentStatusResponse(hasActiveConsent: false)),
            ),
            latestAssessmentProvider.overrideWith(
              (ref) => Future.value(null),
            ),
          ],
          child: MaterialApp(
            home: HomeScreen(
              onReconsent: () => reconsentTapped = true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Analisis Dihentikan'), findsOneWidget);
      expect(
        find.text(
          'Analisis dihentikan sesuai permintaanmu. Data Anda tidak lagi diproses untuk kalkulasi estimasi risiko preventif.',
        ),
        findsOneWidget,
      );
      expect(find.text('Beri Persetujuan Kembali'), findsOneWidget);
      expect(find.byType(StatutoryDisclaimerCard), findsOneWidget);

      // Tap "Beri Persetujuan Kembali"
      await tester.tap(find.text('Beri Persetujuan Kembali'));
      await tester.pumpAndSettle();
      expect(reconsentTapped, isTrue);
    });

    testWidgets('renders honest empty container when assessment risks list is empty without fake scores',
        (tester) async {
      const emptyRisksAssessment = AssessmentSummaryResponse(
        id: 'test-assessment-empty-risks',
        healthScore: 82,
        lifestyleScore: 79,
        risks: [],
        topFactors: [],
        recommendations: [],
        assessedAt: '2026-10-14T00:00:00Z',
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            consentStatusProvider.overrideWith(
              (ref) => Future.value(const ConsentStatusResponse(hasActiveConsent: true)),
            ),
            latestAssessmentProvider.overrideWith(
              (ref) => Future.value(emptyRisksAssessment),
            ),
          ],
          child: const MaterialApp(
            home: HomeScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Belum ada rincian kondisi risiko yang tercatat pada asesmen ini.'), findsOneWidget);
      // Strictly verify no fake risk percentages appear
      expect(find.text('12%'), findsNothing);
      expect(find.text('24%'), findsNothing);
      expect(find.text('8%'), findsNothing);
    });

    testWidgets('renders official error state with reload action when assessment API fails',
        (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            consentStatusProvider.overrideWith(
              (ref) => Future.value(const ConsentStatusResponse(hasActiveConsent: true)),
            ),
            latestAssessmentProvider.overrideWith(
              (ref) => Future.error(Exception('500 Server Error')),
            ),
          ],
          child: const MaterialApp(
            home: HomeScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Analisis Sedang Tidak Tersedia'), findsOneWidget);
      expect(
        find.text(
          'Analisis sedang tidak tersedia, coba lagi. Heliora tidak pernah menampilkan estimasi atau skor rekaan saat sistem sedang mengalami kendala.',
        ),
        findsOneWidget,
      );
      expect(find.text('Muat Ulang'), findsOneWidget);
      expect(find.byType(StatutoryDisclaimerCard), findsOneWidget);
    });
  });
}
