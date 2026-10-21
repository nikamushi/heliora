import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/generated/export.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/providers/api_providers.dart';

/// Repository for triggering AI risk assessments and fetching summaries (PRD FR-008 / BR-ASSESS-001..003).
class AssessmentRepository {
  const AssessmentRepository(this._apiClient);

  final HelioraApiClient _apiClient;

  /// Runs a new AI health risk assessment calculation.
  Future<AssessmentSummaryResponse> runAssessment() async {
    try {
      return await _apiClient.assessment.createAssessmentApiV1AssessmentPost();
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Gagal menjalankan asesmen risiko: $e');
    }
  }

  /// Fetches the user's latest assessment summary, or null if none exists.
  Future<AssessmentSummaryResponse?> getLatestAssessment() async {
    try {
      return await _apiClient.assessment.getLatestAssessmentApiV1AssessmentLatestGet();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return null;
      }
      throw ApiException.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Gagal mengambil ringkasan asesmen: $e');
    }
  }

  /// Fetches an assessment by its unique ID.
  Future<AssessmentSummaryResponse> getAssessmentById(String assessmentId) async {
    try {
      return await _apiClient.assessment.getAssessmentByIdApiV1AssessmentAssessmentIdGet(
        assessmentId: assessmentId,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Gagal mengambil detail asesmen: $e');
    }
  }
}

/// Provides the AssessmentRepository instance.
final assessmentRepositoryProvider = Provider<AssessmentRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AssessmentRepository(apiClient);
});

/// Fetches the user's latest assessment if available, or null if 404 / none.
final latestAssessmentProvider = FutureProvider.autoDispose<AssessmentSummaryResponse?>((ref) async {
  final repo = ref.watch(assessmentRepositoryProvider);
  return repo.getLatestAssessment();
});
