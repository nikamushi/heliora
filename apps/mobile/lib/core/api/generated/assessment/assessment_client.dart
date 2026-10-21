// coverage:ignore-file
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';

import '../models/assessment_summary_response.dart';

class AssessmentClient {
  const AssessmentClient(this._dio, {this.baseUrl});

  final Dio _dio;
  final String? baseUrl;

  String _resolvePath(String path) {
    if (baseUrl == null || baseUrl!.isEmpty) return path;
    final cleanBase = baseUrl!.endsWith('/')
        ? baseUrl!.substring(0, baseUrl!.length - 1)
        : baseUrl!;
    return '$cleanBase$path';
  }

  /// Trigger and run new health assessment.
  Future<AssessmentSummaryResponse> createAssessmentApiV1AssessmentPost() async {
    final response = await _dio.post<Map<String, dynamic>>(
      _resolvePath('/api/v1/assessment'),
    );
    return AssessmentSummaryResponse.fromJson(response.data!);
  }

  /// Get latest assessment summary.
  Future<AssessmentSummaryResponse> getLatestAssessmentApiV1AssessmentLatestGet() async {
    final response = await _dio.get<Map<String, dynamic>>(
      _resolvePath('/api/v1/assessment/latest'),
    );
    return AssessmentSummaryResponse.fromJson(response.data!);
  }

  /// Get assessment by ID.
  Future<AssessmentSummaryResponse> getAssessmentByIdApiV1AssessmentAssessmentIdGet({
    required String assessmentId,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      _resolvePath('/api/v1/assessment/$assessmentId'),
    );
    return AssessmentSummaryResponse.fromJson(response.data!);
  }
}
