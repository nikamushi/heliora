import 'package:flutter/material.dart';

import '../../../../core/api/generated/export.dart';
import '../../../../theme/tokens.dart';

/// Section visualizing Explainable AI (SHAP) contributing factors aligned with Web dashboard.
/// Strictly adheres to editorial typography standards without pill chips or oval badges.
class ContributingFactorsSection extends StatelessWidget {
  const ContributingFactorsSection({
    super.key,
    required this.topFactors,
  });

  final List<ContributingFactor> topFactors;

  static const _biologicalFeatures = {'age', 'family_history'};

  @override
  Widget build(BuildContext context) {
    if (topFactors.isEmpty) {
      return const SizedBox.shrink();
    }

    final lifestyle = <ContributingFactor>[];
    final biological = <ContributingFactor>[];

    for (final factor in topFactors) {
      if (_biologicalFeatures.contains(factor.feature)) {
        biological.add(factor);
      } else {
        lifestyle.add(factor);
      }
    }

    num maxWeight = 1.0;
    for (final f in topFactors) {
      if (f.weightPercentage > maxWeight) {
        maxWeight = f.weightPercentage;
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Section Header
        Text(
          'FAKTOR PENENTU RISIKO',
          style: HelioraTokens.monoEyebrow.copyWith(
            fontSize: 11,
            color: HelioraTokens.brand900.withValues(alpha: 0.7),
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Pengaruh relatif terhadap estimasi risiko menurut model AI.',
          style: HelioraTokens.bodySmall.copyWith(
            color: HelioraTokens.mutedForeground,
            height: 1.4,
          ),
        ),
        const SizedBox(height: 12),

        // Group 1: Dapat diubah (Lifestyle)
        if (lifestyle.isNotEmpty) ...[
          Container(
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: HelioraTokens.border, width: 1.0),
              borderRadius: BorderRadius.circular(16.0),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Kebiasaan yang dapat diubah',
                  style: HelioraTokens.labelDefault.copyWith(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    color: HelioraTokens.secondaryForeground,
                  ),
                ),
                const SizedBox(height: 8),
                for (int i = 0; i < lifestyle.length; i++) ...[
                  _buildFactorRow(lifestyle[i], maxWeight),
                  if (i < lifestyle.length - 1)
                    const Divider(color: Color(0xFFF1F5F9), height: 16),
                ],
              ],
            ),
          ),
        ],

        // Group 2: Biologis
        if (biological.isNotEmpty) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: HelioraTokens.border, width: 1.0),
              borderRadius: BorderRadius.circular(16.0),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Faktor biologis (latar belakang)',
                  style: HelioraTokens.labelDefault.copyWith(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    color: HelioraTokens.secondaryForeground,
                  ),
                ),
                const SizedBox(height: 8),
                for (int i = 0; i < biological.length; i++) ...[
                  _buildFactorRow(biological[i], maxWeight),
                  if (i < biological.length - 1)
                    const Divider(color: Color(0xFFF1F5F9), height: 16),
                ],
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildFactorRow(ContributingFactor factor, num maxWeight) {
    final isDecrease = factor.impact == ContributingFactorImpact.decrease;
    final directionLabel = isDecrease ? '↓ Menurunkan' : '↑ Menaikkan';
    final directionColor = isDecrease ? HelioraTokens.primary : HelioraTokens.amber700;

    final progressRatio = (factor.weightPercentage / maxWeight).clamp(0.08, 1.0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                factor.label,
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: HelioraTokens.foreground,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              directionLabel,
              style: TextStyle(
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: directionColor,
              ),
            ),
          ],
        ),
        if (factor.description.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text(
            factor.description,
            style: HelioraTokens.caption.copyWith(
              color: HelioraTokens.mutedForeground,
              height: 1.35,
            ),
          ),
        ],
        const SizedBox(height: 6),
        // Proportional Bar
        ClipRRect(
          borderRadius: BorderRadius.circular(3.0),
          child: LinearProgressIndicator(
            value: progressRatio.toDouble(),
            minHeight: 4.0,
            backgroundColor: const Color(0xFFF1F5F9),
            valueColor: AlwaysStoppedAnimation<Color>(
              directionColor.withValues(alpha: 0.8),
            ),
          ),
        ),
      ],
    );
  }
}
