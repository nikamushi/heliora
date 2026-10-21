import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/generated/export.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/providers/api_providers.dart';

/// Repository for medical data consent and regulatory disclaimer (PRD BR-CONSENT-001/002).
class ConsentRepository {
  const ConsentRepository(this._apiClient);

  final HelioraApiClient _apiClient;

  /// Fetches the user's active consent status and disclaimer text.
  Future<ConsentStatusResponse> getConsentStatus() async {
    try {
      return await _apiClient.consent.getConsentStatusApiV1ConsentStatusGet();
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Gagal memeriksa status persetujuan data: $e');
    }
  }

  /// Records user consent agreement with statutory disclaimer acknowledgment.
  Future<ConsentResponse> recordConsent({
    String consentVersion = '1.0',
  }) async {
    try {
      final request = ConsentCreateRequest(
        agreed: true,
        consentVersion: consentVersion,
      );
      return await _apiClient.consent.recordConsentApiV1ConsentPost(body: request);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Gagal mencatat persetujuan data: $e');
    }
  }

  /// Revokes user consent.
  Future<ConsentResponse> revokeConsent() async {
    try {
      return await _apiClient.consent.revokeConsentApiV1ConsentRevokePost();
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Gagal mencabut persetujuan data: $e');
    }
  }
}

/// Provides the ConsentRepository instance.
final consentRepositoryProvider = Provider<ConsentRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ConsentRepository(apiClient);
});
