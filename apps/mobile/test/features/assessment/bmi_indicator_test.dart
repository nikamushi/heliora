import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:heliora_mobile/features/assessment/presentation/widgets/bmi_indicator.dart';

void main() {
  group('BmiIndicator', () {
    testWidgets('shows placeholder when height and weight are not provided', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: BmiIndicator(heightCm: null, weightKg: null),
          ),
        ),
      );

      expect(find.text('IMT'), findsOneWidget);
      expect(find.text('--'), findsOneWidget);
      expect(find.text('MENUNGGU DATA'), findsOneWidget);
      expect(find.text('Masukkan tinggi dan berat untuk estimasi IMT.'), findsOneWidget);
    });

    testWidgets('calculates and displays Normal BMI correctly (160 cm, 55 kg -> 21.5)', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: BmiIndicator(heightCm: 160, weightKg: 55),
          ),
        ),
      );

      expect(find.text('IMT'), findsOneWidget);
      expect(find.text('21,5'), findsOneWidget);
      expect(find.text('NORMAL'), findsOneWidget);
      expect(find.text('Indikator pendukung, bukan diagnosis medis.'), findsOneWidget);
    });

    testWidgets('calculates and displays Overweight BMI correctly (160 cm, 74 kg -> 28.9)', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: BmiIndicator(heightCm: 160, weightKg: 74),
          ),
        ),
      );

      expect(find.text('IMT'), findsOneWidget);
      expect(find.text('28,9'), findsOneWidget);
      expect(find.text('KELEBIHAN BERAT'), findsOneWidget);
    });

    testWidgets('calculates and displays Underweight BMI correctly (170 cm, 45 kg -> 15.6)', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: BmiIndicator(heightCm: 170, weightKg: 45),
          ),
        ),
      );

      expect(find.text('IMT'), findsOneWidget);
      expect(find.text('15,6'), findsOneWidget);
      expect(find.text('BERAT KURANG'), findsOneWidget);
    });

    testWidgets('calculates and displays Obesity BMI correctly (170 cm, 95 kg -> 32.9)', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: BmiIndicator(heightCm: 170, weightKg: 95),
          ),
        ),
      );

      expect(find.text('IMT'), findsOneWidget);
      expect(find.text('32,9'), findsOneWidget);
      expect(find.text('OBESITAS'), findsOneWidget);
    });

    test('BmiCategory classification thresholds', () {
      expect(BmiCategory.fromBmi(17.0), BmiCategory.underweight);
      expect(BmiCategory.fromBmi(18.5), BmiCategory.normal);
      expect(BmiCategory.fromBmi(24.9), BmiCategory.normal);
      expect(BmiCategory.fromBmi(25.0), BmiCategory.overweight);
      expect(BmiCategory.fromBmi(29.9), BmiCategory.overweight);
      expect(BmiCategory.fromBmi(30.0), BmiCategory.obesity);
      expect(BmiCategory.fromBmi(35.0), BmiCategory.obesity);
    });
  });
}
