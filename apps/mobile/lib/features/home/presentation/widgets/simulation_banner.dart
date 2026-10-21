import 'package:flutter/material.dart';

import '../../../../theme/components.dart';
import '../../../../theme/tokens.dart';

/// Hub banner encouraging user to run what-if lifestyle simulations (Figma node 79:643).
class SimulationBanner extends StatelessWidget {
  const SimulationBanner({
    super.key,
    required this.onTapSimulation,
  });

  final VoidCallback onTapSimulation;

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
        children: [
          Row(
            children: [
              const HelioraIcon(
                HelioraIcons.sparkles,
                size: 20,
                color: HelioraTokens.primary,
              ),
              const SizedBox(width: 8),
              Text(
                'Simulasi Kebiasaan',
                style: HelioraTokens.mobileHeadline.copyWith(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.3,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Lihat bagaimana perubahan durasi tidur, berat badan, atau aktivitas fisik memengaruhi estimasi risikomu di masa depan.',
            style: HelioraTokens.bodySmall.copyWith(
              color: HelioraTokens.mutedForeground,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: onTapSimulation,
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
                  Text('Buka Simulasi', style: HelioraTokens.labelButton),
                  SizedBox(width: 8),
                  HelioraIcon(
                    HelioraIcons.arrowRight,
                    size: 18,
                    color: Colors.white,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
