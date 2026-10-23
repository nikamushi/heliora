import 'package:flutter/material.dart';

import '../../../../theme/components.dart';
import '../../../../theme/tokens.dart';

/// Preventive safety guardrail alert card displayed when high chronic disease risk is detected.
/// Matches Web safety notice and Design.md §2.6 statutory medical guardrails.
class SafetyGuardrailCard extends StatelessWidget {
  const SafetyGuardrailCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: HelioraTokens.rose50,
        border: Border.all(color: HelioraTokens.rose300, width: 1.0),
        borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const HelioraIcon(
            HelioraIcons.triangleAlert,
            size: 20,
            color: HelioraTokens.rose700,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Perhatian preventif: estimasi risiko lebih tinggi terdeteksi',
                  style: HelioraTokens.bodyDefault.copyWith(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                    color: HelioraTokens.rose700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Satu atau lebih estimasi risiko Anda berada pada kategori lebih tinggi. '
                  'HELIORA adalah alat bantu gaya hidup preventif, bukan alat diagnosis medis. '
                  'Konsultasikan dengan dokter atau fasilitas kesehatan untuk evaluasi lebih lanjut.',
                  style: HelioraTokens.caption.copyWith(
                    color: const Color(0xFF991B1B),
                    height: 1.45,
                    fontSize: 12.5,
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
