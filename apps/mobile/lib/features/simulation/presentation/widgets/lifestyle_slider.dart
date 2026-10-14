import 'package:flutter/material.dart';

import '../../../../theme/tokens.dart';

/// Reusable interactive slider for modifiable lifestyle parameters (Figma node 81:834).
/// Shows parameter label, active simulated value, baseline marker text, and min/max bounds.
class LifestyleSlider extends StatelessWidget {
  const LifestyleSlider({
    super.key,
    required this.label,
    required this.valueDisplay,
    required this.baselineText,
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
    this.divisions,
    this.unit,
  });

  /// The parameter title (e.g. "Durasi tidur").
  final String label;

  /// Human-readable active value string (e.g. "8.0 jam").
  final String valueDisplay;

  /// Baseline marker string (e.g. "Baseline: 7 jam").
  final String baselineText;

  /// Current slider value.
  final double value;

  /// Minimum value bound.
  final double min;

  /// Maximum value bound.
  final double max;

  /// Slider divisions count.
  final int? divisions;

  /// Unit suffix.
  final String? unit;

  /// Callback when slider value updates.
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: HelioraTokens.border, width: 1.0),
        borderRadius: BorderRadius.circular(16.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Label & Active Value
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label,
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
                valueDisplay,
                style: const TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: HelioraTokens.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),

          // Slider
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: HelioraTokens.primary,
              inactiveTrackColor: const Color(0xFFE2E8F0),
              thumbColor: HelioraTokens.primary,
              overlayColor: HelioraTokens.primary.withValues(alpha: 0.12),
              trackHeight: 4.0,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 9.0),
            ),
            child: Slider(
              value: value.clamp(min, max),
              min: min,
              max: max,
              divisions: divisions,
              onChanged: onChanged,
            ),
          ),

          // Footer: Min bound, Baseline marker, Max bound
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${min.toInt()}${unit ?? ''}',
                style: const TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                  color: HelioraTokens.secondaryForeground,
                ),
              ),
              Flexible(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4.0),
                  child: Text(
                    baselineText,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: HelioraTokens.secondaryForeground,
                    ),
                  ),
                ),
              ),
              Text(
                '${max.toInt()}${unit ?? ''}',
                style: const TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                  color: HelioraTokens.secondaryForeground,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
