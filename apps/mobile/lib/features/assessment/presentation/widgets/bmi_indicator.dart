import 'package:flutter/material.dart';
import '../../../../theme/icons.dart';
import '../../../../theme/tokens.dart';

/// BMI classification categories according to Indonesian clinical guidelines.
enum BmiCategory {
  underweight('BERAT KURANG', Color(0xFF0284C7), HelioraIcons.circleAlert),
  normal('NORMAL', Color(0xFF047857), HelioraIcons.circleCheck),
  overweight('KELEBIHAN BERAT', Color(0xFFB45309), HelioraIcons.circleAlert),
  obesity('OBESITAS', Color(0xFFB45309), HelioraIcons.circleAlert);

  const BmiCategory(this.label, this.color, this.icon);

  final String label;
  final Color color;
  final String icon;

  static BmiCategory fromBmi(double bmi) {
    if (bmi < 18.5) return BmiCategory.underweight;
    if (bmi < 25.0) return BmiCategory.normal;
    if (bmi < 30.0) return BmiCategory.overweight;
    return BmiCategory.obesity;
  }
}

/// Dynamic BMI indicator card matching Figma node 71:200 / 71:153 / 71:176 (Mobile/BmiIndicator).
/// Strictly adheres to editorial typography without pill chips or oval badges (Design.md §15.1).
class BmiIndicator extends StatelessWidget {
  const BmiIndicator({
    super.key,
    required this.heightCm,
    required this.weightKg,
  });

  final double? heightCm;
  final double? weightKg;

  double? get bmi {
    if (heightCm == null || weightKg == null) return null;
    if (heightCm! <= 50 || heightCm! > 250) return null;
    if (weightKg! <= 20 || weightKg! > 300) return null;
    final heightM = heightCm! / 100.0;
    return weightKg! / (heightM * heightM);
  }

  @override
  Widget build(BuildContext context) {
    final currentBmi = bmi;
    final hasData = currentBmi != null;
    final category = hasData ? BmiCategory.fromBmi(currentBmi) : null;
    final bmiString = hasData
        ? currentBmi.toStringAsFixed(1).replaceAll('.', ',')
        : '--';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F9F8),
        border: Border.all(color: const Color(0xFFDEE5E1), width: 1.0),
        borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Left Column: Nilai IMT (Figma node 71:154)
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'IMT',
                style: TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 12.0,
                  fontWeight: FontWeight.w700,
                  height: 16.0 / 12.0,
                  letterSpacing: 1.2,
                  color: const Color(0xFF0D5F3F),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                bmiString,
                style: TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 32.0,
                  fontWeight: FontWeight.w700,
                  height: 36.0 / 32.0,
                  letterSpacing: -0.32,
                  color: hasData
                      ? HelioraTokens.foreground
                      : HelioraTokens.mutedForeground,
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),

          // Right Column: Kategori & Status (Figma node 71:157)
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    HelioraIcon(
                      category?.icon ?? HelioraIcons.info,
                      size: 16.0,
                      color: category?.color ?? HelioraTokens.mutedForeground,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      category?.label ?? 'MENUNGGU DATA',
                      style: TextStyle(
                        fontFamily: 'JetBrains Mono',
                        fontSize: 12.0,
                        fontWeight: FontWeight.w700,
                        height: 16.0 / 12.0,
                        letterSpacing: 0.6,
                        color: category?.color ?? HelioraTokens.mutedForeground,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  hasData
                      ? 'Indikator pendukung, bukan diagnosis medis.'
                      : 'Masukkan tinggi dan berat untuk estimasi IMT.',
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 12.0,
                    fontWeight: FontWeight.w400,
                    height: 16.0 / 12.0,
                    color: Color(0xFF3A423D),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
