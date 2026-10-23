import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:heliora_mobile/core/api/generated/export.dart';
import 'package:heliora_mobile/features/home/presentation/widgets/contributing_factors_section.dart';
import 'package:heliora_mobile/features/home/presentation/widgets/recommendations_section.dart';
import 'package:heliora_mobile/features/home/presentation/widgets/safety_guardrail_card.dart';

void main() {
  group('SafetyGuardrailCard Widget Tests', () {
    testWidgets('renders statutory warning copy and alert icon', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SafetyGuardrailCard(),
          ),
        ),
      );

      expect(
        find.text('Perhatian preventif: estimasi risiko lebih tinggi terdeteksi'),
        findsOneWidget,
      );
      expect(
        find.textContaining('HELIORA adalah alat bantu gaya hidup preventif, bukan alat diagnosis medis.'),
        findsOneWidget,
      );
    });
  });

  group('RecommendationsSection Widget Tests', () {
    final mockRecommendations = [
      const RecommendationItem(
        id: 'rec-1',
        ruleId: 'REC-ACT-01',
        title: 'Tingkatkan Aktivitas Fisik',
        category: RecommendationItemCategory.activity,
        action: 'Capai minimal 150 menit latihan aerobik moderat setiap minggu.',
        source: 'WHO 2024 Guidelines',
        evidenceLevel: RecommendationItemEvidenceLevel.a,
      ),
      const RecommendationItem(
        id: 'rec-2',
        ruleId: 'REC-SLP-01',
        title: 'Stabilkan Jam Tidur',
        category: RecommendationItemCategory.sleep,
        action: 'Tidur 7-8 jam per malam untuk menjaga ritme sirkadian.',
        source: 'AASM 2024',
        evidenceLevel: RecommendationItemEvidenceLevel.b,
      ),
    ];

    testWidgets('renders actionable cards with test simulation trigger', (tester) async {
      String? testedFocus;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: RecommendationsSection(
                recommendations: mockRecommendations,
                onTestInSimulation: (focus) => testedFocus = focus,
              ),
            ),
          ),
        ),
      );

      expect(find.text('Rencana tindakan'), findsOneWidget);
      expect(find.textContaining('Tingkatkan Aktivitas Fisik'), findsOneWidget);
      expect(find.text('Bukti: tinggi'), findsOneWidget);
      expect(find.textContaining('Stabilkan Jam Tidur'), findsOneWidget);
      expect(find.text('Bukti: sedang'), findsOneWidget);

      final ctaButtons = find.text('Uji di Simulator');
      expect(ctaButtons, findsNWidgets(2));

      await tester.tap(ctaButtons.first);
      await tester.pumpAndSettle();

      expect(testedFocus, equals('activity'));
    });

    testWidgets('omits test in simulator CTA for unmapped or low-BMI rules', (tester) async {
      final unmappedRecommendations = [
        const RecommendationItem(
          id: 'rec-lowbmi',
          ruleId: 'REC-NUT-LOWBMI-01',
          title: 'Konsultasi Nutrisi & IMT',
          category: RecommendationItemCategory.nutrition,
          action: 'Konsultasikan berat badan dengan ahli gizi klinis.',
          source: 'Kemenkes 2024',
          evidenceLevel: RecommendationItemEvidenceLevel.b,
        ),
        const RecommendationItem(
          id: 'rec-other',
          ruleId: 'REC-MED-CHECK-01',
          title: 'Pemeriksaan Rutin',
          category: RecommendationItemCategory.nutrition,
          action: 'Lakukan pemeriksaan kesehatan berkala.',
          source: 'Kemenkes 2024',
          evidenceLevel: RecommendationItemEvidenceLevel.c,
        ),
      ];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: RecommendationsSection(
                recommendations: unmappedRecommendations,
              ),
            ),
          ),
        ),
      );

      expect(find.text('Uji di Simulator'), findsNothing);
      expect(find.textContaining('Konsultasi Nutrisi & IMT'), findsOneWidget);
      expect(find.textContaining('Pemeriksaan Rutin'), findsOneWidget);
    });
  });

  group('ContributingFactorsSection Widget Tests', () {
    final mockFactors = [
      const ContributingFactor(
        feature: 'physical_activity',
        label: 'Aktivitas Fisik',
        weightPercentage: 24.5,
        impact: ContributingFactorImpact.decrease,
        description: 'Aktivitas rutin berkontribusi menurunkan beban risiko.',
      ),
      const ContributingFactor(
        feature: 'blood_sugar',
        label: 'Glukosa Darah Puasa',
        weightPercentage: 18.0,
        impact: ContributingFactorImpact.increase,
        description: 'Indikator glikemik memerlukan pemantauan berkala.',
      ),
      const ContributingFactor(
        feature: 'age',
        label: 'Usia',
        weightPercentage: 35.0,
        impact: ContributingFactorImpact.increase,
        description: 'Faktor usia merupakan predisposisi biologis alami.',
      ),
    ];

    testWidgets('categorizes lifestyle vs clinical indicators vs biological factors',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: ContributingFactorsSection(topFactors: mockFactors),
            ),
          ),
        ),
      );

      expect(find.text('FAKTOR PENENTU RISIKO'), findsOneWidget);
      expect(find.text('Kebiasaan yang dapat diubah'), findsOneWidget);
      expect(find.text('Indikator klinis & biomarker'), findsOneWidget);
      expect(find.text('Faktor biologis (latar belakang)'), findsOneWidget);
      expect(find.text('Aktivitas Fisik'), findsOneWidget);
      expect(find.text('Glukosa Darah Puasa'), findsOneWidget);
      expect(find.text('Usia'), findsOneWidget);
      expect(find.text('↓ Menurunkan'), findsOneWidget);
      expect(find.text('↑ Menaikkan'), findsNWidgets(2));
    });
  });
}
