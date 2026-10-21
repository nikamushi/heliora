import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/generated/export.dart';
import '../../../core/providers/api_providers.dart';
import '../data/auth_repository.dart';

/// Provides the [AuthRepository] instance.
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final supabase = ref.watch(supabaseClientProvider);
  final apiClient = ref.watch(apiClientProvider);
  return AuthRepository(
    supabaseClient: supabase,
    apiClient: apiClient,
  );
});

/// Provides boolean flag indicating whether a user is currently authenticated.
final isAuthenticatedProvider = Provider<bool>((ref) {
  final authState = ref.watch(authStateChangesProvider);
  return authState.maybeWhen(
    data: (data) => data.session != null,
    orElse: () => ref.read(authRepositoryProvider).currentSession != null,
  );
});

/// Provides the verified user profile fetched from backend `/api/v1/auth/me`.
final currentUserProfileProvider = FutureProvider<UserResponse?>((ref) async {
  final isAuth = ref.watch(isAuthenticatedProvider);
  if (!isAuth) return null;
  final authRepo = ref.watch(authRepositoryProvider);
  return authRepo.fetchCurrentUserProfile();
});

/// Controller managing login actions and transient state (loading / errors).
class AuthController extends StateNotifier<AsyncValue<void>> {
  AuthController(this._repository, this._ref) : super(const AsyncData(null));

  final AuthRepository _repository;
  final Ref _ref;

  /// Sign in with email and password.
  Future<bool> signInWithEmail({
    required String email,
    required String password,
  }) async {
    state = const AsyncLoading();
    try {
      await _repository.signInWithEmail(email: email, password: password);
      state = const AsyncData(null);
      // Invalidate profile cache so fresh profile is fetched
      _ref.invalidate(currentUserProfileProvider);
      return true;
    } catch (e, st) {
      state = AsyncError(e, st);
      return false;
    }
  }

  /// Register a new user with email, password, and full name (MFR-001).
  Future<bool> signUpWithEmail({
    required String email,
    required String password,
    required String fullName,
  }) async {
    state = const AsyncLoading();
    try {
      await _repository.signUpWithEmail(
        email: email,
        password: password,
        fullName: fullName,
      );
      state = const AsyncData(null);
      _ref.invalidate(currentUserProfileProvider);
      return true;
    } catch (e, st) {
      state = AsyncError(e, st);
      return false;
    }
  }

  /// Launch Google OAuth sign-in.
  Future<bool> signInWithGoogle({required String redirectUrl}) async {
    state = const AsyncLoading();
    try {
      final launched = await _repository.signInWithGoogle(redirectUrl: redirectUrl);
      state = const AsyncData(null);
      return launched;
    } catch (e, st) {
      state = AsyncError(e, st);
      return false;
    }
  }

  /// Sign out current session.
  Future<void> signOut() async {
    state = const AsyncLoading();
    try {
      await _repository.signOut();
      _ref.invalidate(currentUserProfileProvider);
      state = const AsyncData(null);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }
}

/// Provides the [AuthController] for UI consumers.
final authControllerProvider =
    StateNotifierProvider<AuthController, AsyncValue<void>>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return AuthController(repository, ref);
});
