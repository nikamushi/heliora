import 'package:flutter/material.dart';

import '../../../../core/api/generated/export.dart';
import '../../../../theme/components.dart';
import '../../../../theme/tokens.dart';

/// Section presenting prioritized clinical recommendations aligned with Web dashboard.
/// Strictly adheres to editorial typography standards (no pill chips, plain text metadata).
class RecommendationsSection extends StatelessWidget {
  const RecommendationsSection({
    super.key,
    required this.recommendations,
    this.onTestInSimulation,
  });

  final List<RecommendationItem> recommendations;
  final ValueChanged<String>? onTestInSimulation;

  String _evidenceText(RecommendationItemEvidenceLevel level) {
    switch (level) {
      case RecommendationItemEvidenceLevel.a:
        return 'Bukti: tinggi';
      case RecommendationItemEvidenceLevel.b:
        return 'Bukti: sedang';
      case RecommendationItemEvidenceLevel.c:
      case RecommendationItemEvidenceLevel.$unknown:
        return 'Bukti: terbatas';
    }
  }

  String _deriveSimulationFocus(String? ruleId) {
    if (ruleId == null) return 'sleep';
    final upper = ruleId.toUpperCase();
    if (upper.contains('SLP')) return 'sleep';
    if (upper.contains('ACT')) return 'activity';
    if (upper.contains('NUT') || upper.contains('BMI')) return 'weight';
    if (upper.contains('SMK')) return 'smoking';
    return 'sleep';
  }

  @override
  Widget build(BuildContext context) {
    final actionable = recommendations
        .where((r) => r.ruleId != 'REC-GEN-01')
        .take(3)
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                'Rencana tindakan',
                style: HelioraTokens.mobileHeadline.copyWith(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.3,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'Rekomendasi preventif',
              style: HelioraTokens.caption.copyWith(
                color: HelioraTokens.secondaryForeground,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (actionable.isNotEmpty) ...[
          for (int i = 0; i < actionable.length; i++) ...[
            _buildRecommendationCard(context, actionable[i], i + 1),
            if (i < actionable.length - 1) const SizedBox(height: 12),
          ],
        ] else ...[
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
                  'Kebiasaan Anda sudah sesuai pedoman',
                  style: HelioraTokens.bodyDefault.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Tidak ada prioritas perubahan saat ini. Pertahankan pola tidur, aktivitas fisik, '
                  'berat badan seimbang, dan tetap bebas asap rokok.',
                  style: HelioraTokens.bodySmall.copyWith(
                    color: HelioraTokens.mutedForeground,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildRecommendationCard(
    BuildContext context,
    RecommendationItem item,
    int index,
  ) {
    final focusParam = _deriveSimulationFocus(item.ruleId);
    final evidenceLabel = _evidenceText(item.evidenceLevel);

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
          // Header: Numbered Title + Plain Text Evidence Level
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  '$index. ${item.title}',
                  style: HelioraTokens.bodyDefault.copyWith(
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                    color: HelioraTokens.foreground,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                evidenceLabel,
                style: const TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: HelioraTokens.secondaryForeground,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Action text
          Text(
            item.action,
            style: HelioraTokens.bodySmall.copyWith(
              color: HelioraTokens.foreground,
              height: 1.45,
              fontSize: 13.5,
            ),
          ),
          const SizedBox(height: 12),

          // Footer: Source and Action Button to Simulator
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  item.source,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: HelioraTokens.caption.copyWith(
                    color: HelioraTokens.secondaryForeground,
                    fontSize: 11.5,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              InkWell(
                onTap: () => onTestInSimulation?.call(focusParam),
                borderRadius: BorderRadius.circular(HelioraTokens.radiusSm),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 4.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Uji di Simulator',
                        style: HelioraTokens.caption.copyWith(
                          color: HelioraTokens.primary,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const HelioraIcon(
                        HelioraIcons.arrowRight,
                        size: 13,
                        color: HelioraTokens.primary,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
