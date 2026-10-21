import 'package:flutter/material.dart';

import '../../../../theme/components.dart';
import '../../../../theme/tokens.dart';

/// Mandatory statutory medical disclaimer card rendered verbatim on solid surface (Design.md §2.6, Figma node 79:647).
class StatutoryDisclaimerCard extends StatelessWidget {
  const StatutoryDisclaimerCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAF9),
        border: Border.all(color: HelioraTokens.border, width: 1.0),
        borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const HelioraIcon(
            HelioraIcons.info,
            size: 20,
            color: HelioraTokens.primary,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. '
              'Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data '
              'dan model yang digunakan, bukan diagnosis medis dan bukan pengganti '
              'konsultasi tenaga kesehatan.',
              style: HelioraTokens.caption.copyWith(
                color: HelioraTokens.mutedForeground,
                fontSize: 12.5,
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
