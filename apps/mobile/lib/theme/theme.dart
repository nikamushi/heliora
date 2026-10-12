import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'tokens.dart';

/// App theme configurations matching Figma Mobile (MVP) Light & Dark specifications.
class HelioraTheme {
  const HelioraTheme._();

  /// Light mode theme (default for HELIORA mobile app).
  static ThemeData get lightTheme {
    final baseTextTheme = ThemeData.light().textTheme;
    final textTheme = GoogleFonts.plusJakartaSansTextTheme(baseTextTheme).copyWith(
      headlineLarge: HelioraTokens.mobileTitle,
      headlineMedium: HelioraTokens.mobileHeadline,
      bodyLarge: HelioraTokens.bodyDefault,
      bodyMedium: HelioraTokens.bodySmall,
      labelLarge: HelioraTokens.labelButton,
      bodySmall: HelioraTokens.caption,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: HelioraTokens.primary,
      scaffoldBackgroundColor: const Color(0xFFF7F9F8),
      colorScheme: const ColorScheme.light(
        primary: HelioraTokens.primary,
        onPrimary: HelioraTokens.primaryForeground,
        secondary: Color(0xFF22B573),
        onSecondary: Colors.white,
        surface: Colors.white,
        onSurface: HelioraTokens.foreground,
        error: HelioraTokens.rose700,
        onError: Colors.white,
      ),
      textTheme: textTheme,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: HelioraTokens.foreground,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: HelioraTokens.foreground,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.0),
          side: const BorderSide(color: HelioraTokens.border, width: 1.0),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: HelioraTokens.primary,
          foregroundColor: HelioraTokens.primaryForeground,
          elevation: 0,
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          ),
          textStyle: HelioraTokens.labelButton,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: HelioraTokens.foreground,
          elevation: 0,
          minimumSize: const Size(double.infinity, 48),
          side: const BorderSide(color: HelioraTokens.border, width: 1.0),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          ),
          textStyle: HelioraTokens.labelButtonSecondary,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          borderSide: const BorderSide(color: HelioraTokens.border, width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          borderSide: const BorderSide(color: HelioraTokens.border, width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          borderSide: const BorderSide(color: HelioraTokens.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          borderSide: const BorderSide(color: HelioraTokens.inputErrorBorder, width: 1.0),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          borderSide: const BorderSide(color: HelioraTokens.inputErrorBorder, width: 1.5),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: HelioraTokens.border,
        thickness: 1.0,
        space: 1.0,
      ),
    );
  }

  /// Dark mode theme (Figma Mobile MVP specifications).
  static ThemeData get darkTheme {
    const darkBackground = Color(0xFF0F1713);
    const darkSurface = Color(0xFF14201A);
    const darkBorder = Color(0xFF1E2D26);
    const darkForeground = Color(0xFFF1F5F9);

    final baseTextTheme = ThemeData.dark().textTheme;
    final textTheme = GoogleFonts.plusJakartaSansTextTheme(baseTextTheme).apply(
      bodyColor: darkForeground,
      displayColor: darkForeground,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: const Color(0xFF22B573),
      scaffoldBackgroundColor: darkBackground,
      colorScheme: const ColorScheme.dark(
        primary: Color(0xFF22B573),
        onPrimary: Color(0xFF052B19),
        secondary: Color(0xFF10B981),
        onSecondary: Colors.white,
        surface: darkSurface,
        onSurface: darkForeground,
        error: Color(0xFFF87171),
        onError: Colors.black,
      ),
      textTheme: textTheme,
      appBarTheme: const AppBarTheme(
        backgroundColor: darkSurface,
        foregroundColor: darkForeground,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: darkForeground,
        ),
      ),
      cardTheme: CardThemeData(
        color: darkSurface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.0),
          side: const BorderSide(color: darkBorder, width: 1.0),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF22B573),
          foregroundColor: const Color(0xFF052B19),
          elevation: 0,
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          ),
          textStyle: const TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: darkForeground,
          elevation: 0,
          minimumSize: const Size(double.infinity, 48),
          side: const BorderSide(color: darkBorder, width: 1.0),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          ),
          textStyle: const TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: darkSurface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          borderSide: const BorderSide(color: darkBorder, width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          borderSide: const BorderSide(color: darkBorder, width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          borderSide: const BorderSide(color: Color(0xFF22B573), width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          borderSide: const BorderSide(color: Color(0xFFF87171), width: 1.0),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
          borderSide: const BorderSide(color: Color(0xFFF87171), width: 1.5),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: darkBorder,
        thickness: 1.0,
        space: 1.0,
      ),
    );
  }
}
