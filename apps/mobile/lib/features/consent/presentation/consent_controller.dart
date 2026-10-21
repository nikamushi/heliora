import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/generated/models/consent_status_response.dart';
import '../../../core/network/consent_interceptor.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/consent_repository.dart';

/// Provides the active consent status from the backend.
final consentStatusProvider = FutureProvider<ConsentStatusResponse>((ref) async {
  // Automatically re-fetch when 403 consent trigger fires
  ref.watch(consentTriggerProvider);

  final isAuthenticated = ref.watch(isAuthenticatedProvider);
  if (!isAuthenticated) {
    return const ConsentStatusResponse(hasActiveConsent: false);
  }

  final repository = ref.watch(consentRepositoryProvider);
  return repository.getConsentStatus();
});

/// Convenience provider indicating whether user currently has active medical consent.
final hasActiveConsentProvider = Provider<bool>((ref) {
  final asyncStatus = ref.watch(consentStatusProvider);
  return asyncStatus.maybeWhen(
    data: (status) => status.hasActiveConsent,
    orElse: () => false,
  );
});

/// Controller handling consent submission and state lifecycle.
class ConsentController extends Notifier<AsyncValue<void>> {
  @override
  AsyncValue<void> build() {
    return const AsyncData(null);
  }

  /// Submits user consent agreement to POST /consent with version 1.0.
  Future<bool> submitConsent({String consentVersion = '1.0'}) async {
    state = const AsyncLoading();
    try {
      final repository = ref.read(consentRepositoryProvider);
      await repository.recordConsent(consentVersion: consentVersion);
      ref.invalidate(consentStatusProvider);
      state = const AsyncData(null);
      return true;
    } catch (e, st) {
      state = AsyncError(e, st);
      return false;
    }
  }

  /// Revokes user consent (POST /consent/revoke, BR-CONSENT-003).
  Future<bool> revokeConsent() async {
    state = const AsyncLoading();
    try {
      final repository = ref.read(consentRepositoryProvider);
      await repository.revokeConsent();
      ref.invalidate(consentStatusProvider);
      state = const AsyncData(null);
      return true;
    } catch (e, st) {
      state = AsyncError(e, st);
      return false;
    }
  }

  /// Refreshes the consent status (e.g. on app resume / foreground event).
  void refreshStatus() {
    ref.invalidate(consentStatusProvider);
  }
}

/// Provides the ConsentController notifier.
final consentControllerProvider =
    NotifierProvider<ConsentController, AsyncValue<void>>(ConsentController.new);
