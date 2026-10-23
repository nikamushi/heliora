import 'package:flutter/material.dart';

import '../../../../core/api/generated/export.dart';
import '../../../../theme/components.dart';
import '../../../../theme/tokens.dart';

/// Editorial modal bottom sheet presenting deep-dive clinical insights for a selected condition.
/// Strictly adheres to editorial typography standards without pill chips or oval badges.
class ConditionDetailBottomSheet extends StatelessWidget {
  const ConditionDetailBottomSheet({
    super.key,
    required this.item,
    this.onOpenSimulation,
  });

  final RiskAssessmentItem item;
  final ValueChanged<String>? onOpenSimulation;

  String get conditionTitle {
    switch (item.condition) {
      case RiskAssessmentItemCondition.diabetes:
        return 'Diabetes Tipe 2';
      case RiskAssessmentItemCondition.hypertension:
        return 'Hipertensi';
      case RiskAssessmentItemCondition.cardiovascular:
        return 'Penyakit Kardiovaskular';
      case RiskAssessmentItemCondition.$unknown:
        return item.label.isNotEmpty ? item.label : 'Kondisi Kesehatan';
    }
  }

  String get conditionDescription {
    switch (item.condition) {
      case RiskAssessmentItemCondition.diabetes:
        return 'Diabetes tipe 2 adalah gangguan metabolik kronis yang ditandai dengan resistensi insulin '
            'dan peningkatan kadar gula darah. Faktor gaya hidup seperti durasi tidur cukup, '
            'aktivitas fisik teratur, dan berat badan sehat terbukti menurunkan risiko secara signifikan.';
      case RiskAssessmentItemCondition.hypertension:
        return 'Hipertensi adalah kondisi tekanan darah di atas batas normal secara berkelanjutan '
            'yang membebani kerja jantung dan pembuluh darah. Manajemen stres, aktivitas fisik aerobik, '
            'dan pembatasan natrium berperan penting dalam pencegahan primer.';
      case RiskAssessmentItemCondition.cardiovascular:
        return 'Penyakit kardiovaskular mencakup gangguan pada jantung dan pembuluh darah arteri. '
            'Konsistensi olahraga teratur, berat badan seimbang, dan bebas dari paparan rokok '
            'merupakan pilar utama pencegahan jangka panjang.';
      case RiskAssessmentItemCondition.$unknown:
        return 'Estimasi risiko penyakit kronis berbasis pola kebiasaan harian dan data kesehatan Anda.';
    }
  }

  String get simulationFocus {
    switch (item.condition) {
      case RiskAssessmentItemCondition.diabetes:
        return 'activity';
      case RiskAssessmentItemCondition.hypertension:
        return 'sleep';
      case RiskAssessmentItemCondition.cardiovascular:
        return 'smoking';
      case RiskAssessmentItemCondition.$unknown:
        return 'activity';
    }
  }

  (String label, Color color, String icon) get statusMeta {
    switch (item.riskLabel) {
      case RiskAssessmentItemRiskLabel.lower:
        return ('Risiko Rendah', HelioraTokens.primary, HelioraIcons.shieldCheck);
      case RiskAssessmentItemRiskLabel.moderate:
        return ('Risiko Sedang', HelioraTokens.amber700, HelioraIcons.minus);
      case RiskAssessmentItemRiskLabel.higher:
        return ('Risiko Tinggi', HelioraTokens.rose700, HelioraIcons.triangleAlert);
      case RiskAssessmentItemRiskLabel.$unknown:
        if (item.riskLevel == RiskAssessmentItemRiskLevel.low) {
          return ('Risiko Rendah', HelioraTokens.primary, HelioraIcons.shieldCheck);
        } else if (item.riskLevel == RiskAssessmentItemRiskLevel.high) {
          return ('Risiko Tinggi', HelioraTokens.rose700, HelioraIcons.triangleAlert);
        }
        return ('Risiko Sedang', HelioraTokens.amber700, HelioraIcons.minus);
    }
  }

  @override
  Widget build(BuildContext context) {
    final (statusLabel, statusColor, statusIcon) = statusMeta;

    final double rawPercent = item.probability > 0
        ? (item.probability * 100).toDouble()
        : item.estimatedRiskScore.toDouble();
    final double roundedPercent = (rawPercent * 10).round() / 10;
    final String displayPercent = roundedPercent % 1 == 0
        ? '${roundedPercent.toInt()}%'
        : '${roundedPercent.toStringAsFixed(1)}%';
    final double progressFraction = (rawPercent / 100.0).clamp(0.0, 1.0);

    return Container(
      padding: const EdgeInsets.fromLTRB(20.0, 12.0, 20.0, 24.0),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: HelioraTokens.border,
                    borderRadius: BorderRadius.circular(2.0),
                  ),
                ),
              ),

              // Header: Title & Editorial Status (Strictly no pill chips!)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      conditionTitle,
                      style: HelioraTokens.mobileHeadline.copyWith(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      HelioraIcon(statusIcon, size: 16, color: statusColor),
                      const SizedBox(width: 4),
                      Text(
                        statusLabel,
                        style: TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: statusColor,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Metric Box
              Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAF9),
                  borderRadius: BorderRadius.circular(12.0),
                  border: Border.all(color: HelioraTokens.border, width: 1.0),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          displayPercent,
                          style: const TextStyle(
                            fontFamily: 'JetBrains Mono',
                            fontSize: 36,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -1.0,
                            height: 1.0,
                            color: HelioraTokens.foreground,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'estimasi risiko 10 tahun',
                          style: TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: HelioraTokens.secondaryForeground,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4.0),
                      child: LinearProgressIndicator(
                        value: progressFraction,
                        minHeight: 6.0,
                        backgroundColor: const Color(0xFFE2E8F0),
                        valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Description
              Text(
                'Tinjauan Klinis',
                style: HelioraTokens.labelDefault.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                conditionDescription,
                style: HelioraTokens.bodySmall.copyWith(
                  color: HelioraTokens.foreground,
                  height: 1.5,
                  fontSize: 13.5,
                ),
              ),
              const SizedBox(height: 20),

              // Action buttons
              SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    onOpenSimulation?.call(simulationFocus);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: HelioraTokens.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                    ),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      HelioraIcon(
                        HelioraIcons.sparkles,
                        size: 18,
                        color: Colors.white,
                      ),
                      SizedBox(width: 8),
                      Text(
                        'Uji Skenario di Simulasi',
                        style: HelioraTokens.labelButton,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 44,
                child: OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: HelioraTokens.foreground,
                    side: const BorderSide(color: HelioraTokens.border, width: 1.0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                    ),
                  ),
                  child: const Text(
                    'Tutup',
                    style: HelioraTokens.labelButtonSecondary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
