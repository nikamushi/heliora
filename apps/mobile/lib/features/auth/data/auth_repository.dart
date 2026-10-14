import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide UserResponse;

import '../../../core/api/generated/export.dart';
import '../../../core/network/api_exception.dart';

/// Repository handling authentication operations with Supabase Auth
/// and synchronizing verified user identity with the Heliora API.
class AuthRepository {
  AuthRepository({
    required SupabaseClient supabaseClient,
    required HelioraApiClient apiClient,
  })  : _supabase = supabaseClient,
        _apiClient = apiClient;

  final SupabaseClient _supabase;
  final HelioraApiClient _apiClient;

  /// Current Supabase session if authenticated.
  Session? get currentSession => _supabase.auth.currentSession;

  /// Current authenticated Supabase user.
  User? get currentUser => _supabase.auth.currentUser;

  /// Stream of authentication state changes (login, logout, token refresh).
  Stream<AuthState> get onAuthStateChange => _supabase.auth.onAuthStateChange;

  /// Authenticate with email and password via Supabase Auth.
  /// Throws user-friendly [ApiException] on invalid credentials without
  /// leaking whether the email exists (Design.md §5.3, MFR-002).
  Future<AuthResponse> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _supabase.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      return response;
    } on AuthException catch (e) {
      debugPrint('Supabase Auth error: ${e.message}');
      // PRD MFR-002: pesan generik agar status email tidak bocor
      throw const ApiException(
        message: 'Gagal masuk. Pastikan email dan kata sandi Anda benar.',
        statusCode: 400,
      );
    } catch (e) {
      if (e is ApiException) rethrow;
      throw const ApiException(
        message: 'Terjadi kendala saat menghubungkan ke server. Silakan coba lagi.',
      );
    }
  }

  /// Register a new user with Supabase Auth (MFR-001).
  /// Passes [fullName] in user metadata and verifies identity with backend.
  Future<AuthResponse> signUpWithEmail({
    required String email,
    required String password,
    required String fullName,
  }) async {
    try {
      final response = await _supabase.auth.signUp(
        email: email.trim(),
        password: password,
        data: {'full_name': fullName.trim()},
      );
      return response;
    } on AuthException catch (e) {
      debugPrint('Supabase Auth register error: ${e.message}');
      if (e.message.toLowerCase().contains('already registered') ||
          e.message.toLowerCase().contains('user already exists')) {
        throw const ApiException(
          message: 'Alamat email sudah terdaftar. Masuk dengan email ini atau gunakan email lain.',
          statusCode: 400,
        );
      }
      throw ApiException(
        message: e.message.isNotEmpty
            ? e.message
            : 'Gagal mendaftar akun. Silakan periksa kembali data Anda.',
        statusCode: 400,
      );
    } catch (e) {
      if (e is ApiException) rethrow;
      throw const ApiException(
        message: 'Terjadi kendala saat menghubungkan ke server. Silakan coba lagi.',
      );
    }
  }

  /// Launch Google OAuth sign-in flow (MFR-003).
  /// Redirects to system browser and returns via `id.heliora.app://login-callback`.
  Future<bool> signInWithGoogle({required String redirectUrl}) async {
    try {
      return await _supabase.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: redirectUrl,
        authScreenLaunchMode: LaunchMode.externalApplication,
      );
    } on AuthException catch (e) {
      debugPrint('Google OAuth error: ${e.message}');
      throw ApiException(
        message: 'Gagal melakukan autentikasi Google: ${e.message}',
        statusCode: 400,
      );
    } catch (e) {
      throw const ApiException(
        message: 'Tidak dapat membuka browser untuk autentikasi Google.',
      );
    }
  }

  /// Sign out current user and clear local session storage (MFR-004).
  Future<void> signOut() async {
    try {
      await _supabase.auth.signOut();
    } catch (e) {
      debugPrint('Sign-out error: $e');
    }
  }

  /// Fetch user profile from the backend to verify token verification via JWKS.
  Future<UserResponse> fetchCurrentUserProfile() async {
    try {
      return await _apiClient.auth.getMeApiV1AuthMeGet();
    } on Exception catch (e) {
      throw ApiException(
        message: 'Gagal memuat profil pengguna dari server: $e',
      );
    }
  }
}
