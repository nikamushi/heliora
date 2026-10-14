import 'package:flutter/material.dart';

import '../../../../core/api/generated/export.dart';
import '../../../../theme/components.dart';
import '../../../../theme/tokens.dart';

/// Row widget presenting baseline vs simulated comparison for a chronic disease (Figma node 81:839).
/// Strictly adheres to Heliora Editorial Design Standards (no pill chips, weighted typography + icons).
class DeltaRow extends StatelessWidget {
  const DeltaRow({
    super.key,
    required this.comparison,
  });

  final WhatIfConditionComparison comparison;

  String get conditionTitle {
    switch (comparison.condition) {
      case WhatIfConditionComparisonCondition.diabetes:
        return 'Diabetes Tipe 2';
      case WhatIfConditionComparisonCondition.hypertension:
        return 'Hipertensi';
      case WhatIfConditionComparisonCondition.cardiovascular:
        return 'Penyakit Kardiovaskular';
      case WhatIfConditionComparisonCondition.$unknown:
        return comparison.label.isNotEmpty ? comparison.label : 'Kondisi Kesehatan';
    }
  }

  String _formatPercent(num score, num probability) {
    final double raw = score > 0 ? score.toDouble() : (probability * 100).toDouble();
    final double rounded = (raw * 10).round() / 10;
    return rounded % 1 == 0 ? '${rounded.toInt()}%' : '${rounded.toStringAsFixed(1)}%';
  }

  (String label, Color color, String icon) get deltaMeta {
    final delta = comparison.deltaPercentage.toDouble();
    final double roundedDelta = (delta * 10).round() / 10;

    if (roundedDelta < 0 || comparison.trend == WhatIfConditionComparisonTrend.decreasing) {
      final text = roundedDelta % 1 == 0 ? '${roundedDelta.toInt()}%' : '${roundedDelta.toStringAsFixed(1)}%';
      return (text, HelioraTokens.primary, HelioraIcons.trendingDown);
    } else if (roundedDelta > 0 || comparison.trend == WhatIfConditionComparisonTrend.increasing) {
      final text = roundedDelta % 1 == 0 ? '+${roundedDelta.toInt()}%' : '+${roundedDelta.toStringAsFixed(1)}%';
      return (text, HelioraTokens.rose700, HelioraIcons.trendingUp);
    } else {
      return ('Tetap', HelioraTokens.secondaryForeground, HelioraIcons.minus);
    }
  }

  @override
  Widget build(BuildContext context) {
    final (deltaText, deltaColor, deltaIcon) = deltaMeta;
    final baselineStr = _formatPercent(comparison.baselineScore, comparison.baselineProbability);
    final simulatedStr = _formatPercent(comparison.simulatedScore, comparison.simulatedProbability);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Color(0xFFF1F5F9), width: 1.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Condition title
          Expanded(
            flex: 4,
            child: Text(
              conditionTitle,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: HelioraTokens.foreground,
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Comparative values: Baseline -> Result
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                baselineStr,
                style: const TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: HelioraTokens.secondaryForeground,
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 6.0),
                child: HelioraIcon(
                  HelioraIcons.arrowRight,
                  size: 14,
                  color: HelioraTokens.secondaryForeground,
                ),
              ),
              Text(
                simulatedStr,
                style: const TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: HelioraTokens.foreground,
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),

          // Delta direction (Strictly no pill chips!)
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              HelioraIcon(deltaIcon, size: 14, color: deltaColor),
              const SizedBox(width: 3),
              Text(
                deltaText,
                style: TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: deltaColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
