import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'svg_data.dart';

/// SVG Icon asset catalog sourced directly from Figma "Icons" page (Node 7:2).
abstract final class HelioraIcons {
  static const String google = 'assets/icons/google.svg';
  static const String check = 'assets/icons/check.svg';
  static const String sparkles = 'assets/icons/sparkles.svg';
  static const String minus = 'assets/icons/minus.svg';
  static const String trendingDown = 'assets/icons/trending-down.svg';
  static const String shieldCheck = 'assets/icons/shield-check.svg';
  static const String menu = 'assets/icons/menu.svg';
  static const String logOut = 'assets/icons/log-out.svg';
  static const String settings = 'assets/icons/settings.svg';
  static const String user = 'assets/icons/user.svg';
  static const String trendingUp = 'assets/icons/trending-up.svg';
  static const String slidersHorizontal = 'assets/icons/sliders-horizontal.svg';
  static const String bookOpen = 'assets/icons/book-open.svg';
  static const String clipboardList = 'assets/icons/clipboard-list.svg';
  static const String activity = 'assets/icons/activity.svg';
  static const String layoutDashboard = 'assets/icons/layout-dashboard.svg';
  static const String info = 'assets/icons/info.svg';
  static const String chevronDown = 'assets/icons/chevron-down.svg';
  static const String arrowRight = 'assets/icons/arrow-right.svg';
  static const String heartPulse = 'assets/icons/heart-pulse.svg';
  static const String eyeOff = 'assets/icons/eye-off.svg';
  static const String eye = 'assets/icons/eye.svg';
  static const String triangleAlert = 'assets/icons/triangle-alert.svg';
  static const String circleAlert = 'assets/icons/circle-alert.svg';
  static const String circleCheck = 'assets/icons/circle-check.svg';
}

/// Standardized icon renderer for Figma SVG icons.
class HelioraIcon extends StatelessWidget {
  const HelioraIcon(
    this.assetPath, {
    super.key,
    this.size = 20.0,
    this.color,
    this.preserveOriginalColors = false,
  });

  /// The SVG asset path from [HelioraIcons].
  final String assetPath;

  /// Width and height of the square icon bounding box. Defaults to 20.0 dp.
  final double size;

  /// Optional color tint applied to monochrome icons.
  final Color? color;

  /// Set true for multi-color icons like [HelioraIcons.google] to prevent tinting.
  final bool preserveOriginalColors;

  @override
  Widget build(BuildContext context) {
    final effectiveColor = preserveOriginalColors
        ? null
        : (color ?? IconTheme.of(context).color ?? Colors.black);

    final inlinedSvg = HelioraSvgData.icons[assetPath];
    if (inlinedSvg != null) {
      return SvgPicture.string(
        inlinedSvg,
        width: size,
        height: size,
        fit: BoxFit.contain,
        colorFilter: effectiveColor != null
            ? ColorFilter.mode(effectiveColor, BlendMode.srcIn)
            : null,
      );
    }

    return SvgPicture.asset(
      assetPath,
      width: size,
      height: size,
      fit: BoxFit.contain,
      colorFilter: effectiveColor != null
          ? ColorFilter.mode(effectiveColor, BlendMode.srcIn)
          : null,
    );
  }
}
