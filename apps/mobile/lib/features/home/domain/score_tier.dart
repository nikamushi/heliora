import 'package:flutter/material.dart';

import '../../../../theme/tokens.dart';

/// Canonical score tier model consolidating thresholds, colors, and interpretation (PRD §11.5.3).
class ScoreTier {
  const ScoreTier({
    required this.healthInterpretation,
    required this.lifestyleInterpretation,
    required this.color,
  });

  final String healthInterpretation;
  final String lifestyleInterpretation;
  final Color color;

  String interpretation(bool isHealthScore) =>
      isHealthScore ? healthInterpretation : lifestyleInterpretation;

  static ScoreTier fromScore(num score) {
    final value = score.toDouble();
    if (value >= 80) {
      return const ScoreTier(
        healthInterpretation: 'Kondisi Optimal',
        lifestyleInterpretation: 'Gaya Hidup Baik',
        color: HelioraTokens.primary,
      );
    }
    if (value >= 60) {
      return const ScoreTier(
        healthInterpretation: 'Kondisi Baik',
        lifestyleInterpretation: 'Cukup Seimbang',
        color: HelioraTokens.emerald700,
      );
    }
    if (value >= 40) {
      return const ScoreTier(
        healthInterpretation: 'Perlu Perhatian',
        lifestyleInterpretation: 'Perlu Ditingkatkan',
        color: HelioraTokens.amber700,
      );
    }
    return const ScoreTier(
      healthInterpretation: 'Perlu Tindakan',
      lifestyleInterpretation: 'Kurang Seimbang',
      color: HelioraTokens.rose700,
    );
  }
}
