import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/generated/export.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/providers/api_providers.dart';

/// Repository for managing user health profiles (PRD FR-006 / FR-007).
class HealthProfileRepository {
  const HealthProfileRepository(this._apiClient);

  final HelioraApiClient _apiClient;

  /// Fetches the user's current health profile, or null if 404 (not yet created).
  Future<HealthProfileResponse?> getHealthProfile() async {
    try {
      return await _apiClient.healthProfile.getHealthProfileApiV1HealthProfileGet();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return null;
      }
      throw ApiException.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Gagal mengambil data profil kesehatan: $e');
    }
  }

  /// Creates a new health profile for the user.
  Future<HealthProfileResponse> createHealthProfile(HealthProfileCreateRequest request) async {
    try {
      return await _apiClient.healthProfile.createHealthProfileApiV1HealthProfilePost(body: request);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Gagal menyimpan profil kesehatan: $e');
    }
  }

  /// Updates an existing health profile for the user.
  Future<HealthProfileResponse> updateHealthProfile(HealthProfileUpdateRequest request) async {
    try {
      return await _apiClient.healthProfile.updateHealthProfileApiV1HealthProfilePut(body: request);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Gagal memperbarui profil kesehatan: $e');
    }
  }

  /// Saves health profile by creating if not existing, or updating if existing.
  Future<HealthProfileResponse> saveHealthProfile(HealthProfileCreateRequest request) async {
    try {
      return await _apiClient.healthProfile.createHealthProfileApiV1HealthProfilePost(body: request);
    } on DioException catch (e) {
      if (e.response?.statusCode == 409 || e.response?.statusCode == 400) {
        // Fallback to update if profile already exists
        final updateReq = HealthProfileUpdateRequest(
          age: request.age,
          gender: request.gender,
          heightCm: request.heightCm,
          weightKg: request.weightKg,
          physicalActivityMinPerWeek: request.physicalActivityMinPerWeek,
          sleepDurationHours: request.sleepDurationHours,
          smokingStatus: request.smokingStatus,
          familyHistory: request.familyHistory,
          familyHistoryDetails: request.familyHistoryDetails,
          stressLevel: request.stressLevel,
          bmi: request.bmi,
          waistCircumferenceCm: request.waistCircumferenceCm,
          bloodPressure: request.bloodPressure,
          bloodSugarMgDl: request.bloodSugarMgDl,
          cholesterolMgDl: request.cholesterolMgDl,
        );
        return await updateHealthProfile(updateReq);
      }
      throw ApiException.fromDioException(e);
    }
  }
}

/// Provides the HealthProfileRepository instance.
final healthProfileRepositoryProvider = Provider<HealthProfileRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return HealthProfileRepository(apiClient);
});

/// Provides the current user's saved health profile from GET /health-profile.
final healthProfileProvider = FutureProvider<HealthProfileResponse?>((ref) async {
  final repository = ref.watch(healthProfileRepositoryProvider);
  return repository.getHealthProfile();
});
