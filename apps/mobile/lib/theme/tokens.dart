import 'package:flutter/material.dart';

/// Design tokens extracted directly from Figma Alur 1 & Design System.
/// Defines colors, radii, spacing, and typography (Plus Jakarta Sans & JetBrains Mono).
abstract class HelioraTokens {
  // Brand & Semantic Colors
  static const Color primary = Color(0xFF0F7A4E);
  static const Color primaryForeground = Color(0xFFFFFFFF);
  static const Color brand900 = Color(0xFF0D5F3F);
  static const Color foreground = Color(0xFF14201A);
  static const Color muted = Color(0xFFF7F9F8);
  static const Color mutedForeground = Color(0xFF3A423D);
  static const Color secondaryForeground = Color(0xFF64748B);
  static const Color card = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFDEE5E1);
  static const Color neutral200 = Color(0xFFDEE5E1);

  // Status Colors
  static const Color emerald700 = Color(0xFF047857);
  static const Color rose700 = Color(0xFFBE123C);
  static const Color amber700 = Color(0xFFB45309);
  static const Color inputErrorBorder = Color(0xFFBE123C);

  // Corner Radii (Design.md §15.1: 12px corners, strictly no pill chips)
  static const double radiusXl = 12.0;
  static const double radiusSm = 6.0;

  // Typography Styles
  static const TextStyle mobileTitle = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 24,
    fontWeight: FontWeight.w700,
    height: 32 / 24,
    letterSpacing: -1.0,
    color: foreground,
  );

  static const TextStyle mobileHeadline = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 28 / 20,
    letterSpacing: -0.5,
    color: foreground,
  );

  static const TextStyle bodyDefault = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 24 / 16,
    color: foreground,
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 20 / 14,
    color: mutedForeground,
  );

  static const TextStyle labelDefault = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 20 / 14,
    color: foreground,
  );

  static const TextStyle labelButton = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: FontWeight.w600,
    height: 24 / 16,
    color: primaryForeground,
  );

  static const TextStyle labelButtonSecondary = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: FontWeight.w600,
    height: 24 / 16,
    color: foreground,
  );

  static const TextStyle caption = TextStyle(
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 16 / 12,
    color: mutedForeground,
  );

  static const TextStyle monoEyebrow = TextStyle(
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    fontWeight: FontWeight.w700,
    height: 16 / 12,
    letterSpacing: 2.0,
    color: brand900,
  );

  static const TextStyle monoData = TextStyle(
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 20 / 14,
    color: foreground,
  );
}
