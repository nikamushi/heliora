import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:heliora_mobile/core/api/generated/export.dart';
import 'package:heliora_mobile/features/home/presentation/widgets/condition_detail_bottom_sheet.dart';

void main() {
  group('ConditionDetailBottomSheet Widget Tests', () {
    const diabetesItem = RiskAssessmentItem(
      condition: RiskAssessmentItemCondition.diabetes,
      label: 'Diabetes Tipe 2',
      probability: 0.28,
      estimatedRiskScore: 28,
      riskLevel: RiskAssessmentItemRiskLevel.high,
      riskLabel: RiskAssessmentItemRiskLabel.higher,
      trend: RiskAssessmentItemTrend.increasing,
      description: 'Risiko meningkat berdasarkan resistensi insulin.',
    );

    testWidgets('renders clinical overview, risk score, and action button', (tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      String? simulationTarget;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => ElevatedButton(
                onPressed: () {
                  showModalBottomSheet<void>(
                    context: context,
                    isScrollControlled: true,
                    builder: (_) => ConditionDetailBottomSheet(
                      item: diabetesItem,
                      onOpenSimulation: (focus) => simulationTarget = focus,
                    ),
                  );
                },
                child: const Text('Open Sheet'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Open Sheet'));
      await tester.pumpAndSettle();

      expect(find.text('Diabetes Tipe 2'), findsOneWidget);
      expect(find.text('Risiko Tinggi'), findsOneWidget);
      expect(find.text('28%'), findsOneWidget);
      expect(find.text('estimasi risiko 10 tahun'), findsOneWidget);
      expect(find.text('Tinjauan Klinis'), findsOneWidget);
      expect(find.text('Uji Skenario di Simulasi'), findsOneWidget);

      await tester.ensureVisible(find.text('Uji Skenario di Simulasi'));
      await tester.tap(find.text('Uji Skenario di Simulasi'));
      await tester.pumpAndSettle();

      expect(simulationTarget, equals('activity'));
    });
  });
}
