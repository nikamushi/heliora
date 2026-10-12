import 'package:flutter/foundation.dart';

/// Application configuration loaded from environment variables and `--dart-define`.
class AppConfig {
  const AppConfig({
    required this.apiBaseUrl,
    required this.supabaseUrl,
    required this.supabaseAnonKey,
    required this.authCallbackScheme,
    required this.isProduction,
  });

  /// Base URL of the FastAPI backend.
  /// Defaults to Android emulator gateway `10.0.2.2` on Android,
  /// and `localhost` on Web or desktop platforms.
  final String apiBaseUrl;

  /// Supabase project URL (ADR-011 / ADR-012).
  final String supabaseUrl;

  /// Supabase public anonymous API key.
  final String supabaseAnonKey;

  /// Deep link scheme for OAuth callbacks (PRD-Mobile §11).
  final String authCallbackScheme;

  /// True if running in release / production mode.
  final bool isProduction;

  /// Default configuration resolved from compile-time environment flags.
  factory AppConfig.fromEnvironment() {
    // Default Supabase project URL from repository environment
    const defaultSupabaseUrl = 'https://vhrwtzenemkswivwhwmt.supabase.co';
    const defaultAnonKey =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocnd0emVuZW1rc3dpdndod210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTAzODcsImV4cCI6MjEwNDc4NjM4N30.r03LNmMnjL9X8prh93Suxzgr8KG0IGMCGjzeVWdv2T8';

    final String defaultApiUrl;
    if (kIsWeb) {
      defaultApiUrl = 'http://localhost:8000';
    } else {
      defaultApiUrl = defaultTargetPlatform == TargetPlatform.android
          ? 'http://10.0.2.2:8000'
          : 'http://localhost:8000';
    }

    final apiBaseUrl = const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: '',
    ).isNotEmpty
        ? const String.fromEnvironment('API_BASE_URL')
        : defaultApiUrl;

    final supabaseUrl = const String.fromEnvironment(
      'SUPABASE_URL',
      defaultValue: defaultSupabaseUrl,
    );

    final supabaseAnonKey = const String.fromEnvironment(
      'SUPABASE_ANON_KEY',
      defaultValue: defaultAnonKey,
    );

    const authCallbackScheme = 'id.heliora.app://login-callback';

    return AppConfig(
      apiBaseUrl: apiBaseUrl,
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey,
      authCallbackScheme: authCallbackScheme,
      isProduction: kReleaseMode,
    );
  }
}
