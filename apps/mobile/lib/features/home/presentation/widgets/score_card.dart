import 'package:flutter/material.dart';

import '../../../../theme/tokens.dart';

/// Score card presenting Health Score or Lifestyle Score with plain-language clinical interpretation.
/// Adheres strictly to Figma Alur 3 node 79:637 and PRD BR-HOME-001 (never displays raw number in isolation).
class ScoreCard extends StatelessWidget {
  const ScoreCard({
    super.key,
    required this.title,
    required this.score,
    required this.isHealthScore,
    this.scale = 100,
  });

  /// Card title (e.g. "Health Score" or "Lifestyle Score").
  final String title;

  /// Numeric score value (0 - 100).
  final num score;

  /// Whether this card represents Health Score (true) or Lifestyle Score (false).
  final bool isHealthScore;

  /// Maximum scale denominator (default 100).
  final int scale;

  /// Retrieves the canonical score tier mapping (PRD §11.5.3).
  ScoreTier get tier => ScoreTier.fromScore(score);

  /// Derives descriptive, plain-language clinical interpretation (no raw numbers alone).
  String get interpretation => tier.interpretation(isHealthScore);

  /// Derives the canonical semantic accent color.
  Color get scoreColor => tier.color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: HelioraTokens.border, width: 1.0),
        borderRadius: BorderRadius.circular(16.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Title Label
          Text(
            title,
            style: HelioraTokens.labelDefault.copyWith(
              color: HelioraTokens.secondaryForeground,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 8),

          // Score Value & Scale Row
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '${score.round()}',
                style: const TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 34,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -1.0,
                  height: 1.0,
                  color: HelioraTokens.foreground,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                '/$scale',
                style: const TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: HelioraTokens.secondaryForeground,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Plain Language Interpretation (PRD BR-HOME-001)
          Text(
            interpretation,
            style: HelioraTokens.bodySmall.copyWith(
              color: scoreColor,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}

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
        color: HelioraTokens.teal700,
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

