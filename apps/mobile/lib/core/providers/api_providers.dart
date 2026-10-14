import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:dio/dio.dart';

import '../api/generated/export.dart';
import '../config/app_config.dart';
import '../network/consent_interceptor.dart';
import '../network/dio_client.dart';
import '../storage/secure_storage_service.dart';

/// Provides application compile-time and runtime configuration.
final appConfigProvider = Provider<AppConfig>((ref) {
  return AppConfig.fromEnvironment();
});

/// Provides hardware-backed secure storage.
final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

/// Provides the shared Dio HTTP client with Supabase Bearer token injection.
final dioProvider = Provider<Dio>((ref) {
  final config = ref.watch(appConfigProvider);
  return createDioClient(
    config: config,
    additionalInterceptors: [
      ConsentInterceptor(
        onConsentRequired: () {
          ref.read(consentTriggerProvider.notifier).state++;
        },
      ),
    ],
  );
});

/// Provides the generated Heliora API client with typed endpoint modules.
final apiClientProvider = Provider<HelioraApiClient>((ref) {
  final dio = ref.watch(dioProvider);
  final config = ref.watch(appConfigProvider);
  return HelioraApiClient(dio, baseUrl: config.apiBaseUrl);
});

/// Provides the initialized Supabase client instance, with fallback for hermetic test environments.
final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  try {
    return Supabase.instance.client;
  } catch (_) {
    return SupabaseClient(
      'https://mock.supabase.co',
      'mock-anon-key',
      authOptions: const AuthClientOptions(autoRefreshToken: false),
    );
  }
});

/// Provides a stream of Supabase authentication state changes, with fallback for test environments.
final authStateChangesProvider = StreamProvider<AuthState>((ref) {
  try {
    return Supabase.instance.client.auth.onAuthStateChange;
  } catch (_) {
    return const Stream.empty();
  }
});
