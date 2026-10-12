import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'icons.dart';
import 'svg_data.dart';
import 'tokens.dart';

export 'icons.dart';

/// Available visual variants for the official HELIORA brand mark (Figma "Logo Exploration").
enum HelioraLogoVariant {
  /// Green rounded tile with white helix mark (matches Figma mobile app header and app icon).
  tile,

  /// Standalone 2-color brand mark (#0F7A4E & #22B573) without background.
  mark,

  /// Standalone white mark for dark or saturated surfaces.
  white,

  /// Monochrome mark.
  mono,
}

/// Reusable brand logo matching Figma "Logo Exploration" (Node 92:2) and mobile headers.
class HelioraLogo extends StatelessWidget {
  const HelioraLogo({
    super.key,
    this.size = 48.0,
    this.variant = HelioraLogoVariant.tile,
  });

  final double size;
  final HelioraLogoVariant variant;

  @override
  Widget build(BuildContext context) {
    switch (variant) {
      case HelioraLogoVariant.tile:
        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: HelioraTokens.primary,
            borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          ),
          alignment: Alignment.center,
          child: SvgPicture.string(
            HelioraSvgData.logoMarkWhite,
            width: size * 0.58,
            height: size * 0.58,
            fit: BoxFit.contain,
          ),
        );
      case HelioraLogoVariant.mark:
        return SvgPicture.string(
          HelioraSvgData.logoMark,
          width: size,
          height: size,
          fit: BoxFit.contain,
        );
      case HelioraLogoVariant.white:
        return SvgPicture.string(
          HelioraSvgData.logoMarkWhite,
          width: size,
          height: size,
          fit: BoxFit.contain,
        );
      case HelioraLogoVariant.mono:
        return SvgPicture.string(
          HelioraSvgData.logoMarkMono,
          width: size,
          height: size,
          fit: BoxFit.contain,
        );
    }
  }
}

/// Google 4-color 'G' icon sourced directly from Figma "Icons" (Node 7:106).
class GoogleLogoIcon extends StatelessWidget {
  const GoogleLogoIcon({super.key, this.size = 20.0});

  final double size;

  @override
  Widget build(BuildContext context) {
    return HelioraIcon(
      HelioraIcons.google,
      size: size,
      preserveOriginalColors: true,
    );
  }
}

/// Inline Alert box matching Figma node 74:257 / 74:646 / 74:344.
enum InlineAlertType { error, warning, info }

class InlineAlert extends StatelessWidget {
  const InlineAlert({
    super.key,
    required this.message,
    this.type = InlineAlertType.error,
  });

  final String message;
  final InlineAlertType type;

  @override
  Widget build(BuildContext context) {
    Color borderColor;
    Color iconColor;
    String iconAsset;

    switch (type) {
      case InlineAlertType.error:
        borderColor = HelioraTokens.rose700;
        iconColor = HelioraTokens.rose700;
        iconAsset = HelioraIcons.circleAlert;
        break;
      case InlineAlertType.warning:
        borderColor = HelioraTokens.amber700;
        iconColor = HelioraTokens.amber700;
        iconAsset = HelioraIcons.triangleAlert;
        break;
      case InlineAlertType.info:
        borderColor = HelioraTokens.border;
        iconColor = HelioraTokens.foreground;
        iconAsset = HelioraIcons.info;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: borderColor, width: 1.2),
        borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          HelioraIcon(iconAsset, color: iconColor, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: HelioraTokens.bodySmall.copyWith(
                color: HelioraTokens.foreground,
                fontWeight: FontWeight.w400,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

