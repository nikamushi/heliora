import 'package:flutter/material.dart';

import '../../../../core/api/generated/export.dart';
import '../../../../theme/components.dart';
import '../../../../theme/tokens.dart';

/// Card widget presenting 10-year risk estimation for chronic conditions (Figma Alur 3 node 79:640).
/// Strictly complies with Heliora Editorial Design Standards (no pill chips, weighted text + icons).
class RiskCard extends StatelessWidget {
  const RiskCard({
    super.key,
    required this.item,
  });

  /// The risk assessment data model.
  final RiskAssessmentItem item;

  /// Returns localized condition title.
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

  /// Derives status text and color without pill chips.
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

  /// Derives trend metadata.
  (String label, String icon, Color color) get trendMeta {
    switch (item.trend) {
      case RiskAssessmentItemTrend.decreasing:
        return ('Tren menurun', HelioraIcons.trendingDown, HelioraTokens.primary);
      case RiskAssessmentItemTrend.increasing:
        return ('Tren meningkat', HelioraIcons.trendingUp, HelioraTokens.rose700);
      case RiskAssessmentItemTrend.stable:
      case RiskAssessmentItemTrend.$unknown:
        return ('Tren stabil', HelioraIcons.minus, HelioraTokens.secondaryForeground);
    }
  }

  @override
  Widget build(BuildContext context) {
    final (statusLabel, statusColor, statusIcon) = statusMeta;
    final (trendLabel, trendIcon, trendColor) = trendMeta;

    // Convert probability (0.0 - 1.0) or estimatedRiskScore to percentage
    final double rawPercent = item.probability > 0
        ? (item.probability * 100).toDouble()
        : item.estimatedRiskScore.toDouble();
    final double roundedPercent = (rawPercent * 10).round() / 10;
    final String displayPercent = roundedPercent % 1 == 0
        ? '${roundedPercent.toInt()}%'
        : '${roundedPercent.toStringAsFixed(1)}%';
    final double progressFraction = (rawPercent / 100.0).clamp(0.0, 1.0);

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: HelioraTokens.border, width: 1.0),
        borderRadius: BorderRadius.circular(16.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Title & Editorial Status (Strictly no pill chips!)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  conditionTitle,
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.3,
                    color: HelioraTokens.foreground,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Plain text status with icon
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
                      fontWeight: FontWeight.w600,
                      color: statusColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Estimate Row: Big Percentage + Unit Label
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                displayPercent,
                style: const TextStyle(

                  fontFamily: 'JetBrains Mono',
                  fontSize: 34,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -1.0,
                  height: 1.0,
                  color: HelioraTokens.foreground,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'estimasi 10 tahun',
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

          // Proportional Bar (Height 8, radius 4)
          ClipRRect(
            borderRadius: BorderRadius.circular(4.0),
            child: LinearProgressIndicator(
              value: progressFraction,
              minHeight: 8.0,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(statusColor),
            ),
          ),
          const SizedBox(height: 14),

          // Footer: Trend indicator
          Row(
            children: [
              HelioraIcon(trendIcon, size: 16, color: trendColor),
              const SizedBox(width: 6),
              Text(
                trendLabel,
                style: TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: trendColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
