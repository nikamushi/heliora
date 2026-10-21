// coverage:ignore-file
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';

import '../models/health_profile_create_request.dart';
import '../models/health_profile_response.dart';
import '../models/health_profile_update_request.dart';

class HealthProfileClient {
  const HealthProfileClient(this._dio, {this.baseUrl});

  final Dio _dio;
  final String? baseUrl;

  String _resolvePath(String path) {
    if (baseUrl == null || baseUrl!.isEmpty) return path;
    final cleanBase = baseUrl!.endsWith('/')
        ? baseUrl!.substring(0, baseUrl!.length - 1)
        : baseUrl!;
    return '$cleanBase$path';
  }

  /// Get user health profile.
  Future<HealthProfileResponse> getHealthProfileApiV1HealthProfileGet() async {
    final response = await _dio.get<Map<String, dynamic>>(
      _resolvePath('/api/v1/health-profile'),
    );
    return HealthProfileResponse.fromJson(response.data!);
  }

  /// Update existing health profile.
  Future<HealthProfileResponse> updateHealthProfileApiV1HealthProfilePut({
    required HealthProfileUpdateRequest body,
  }) async {
    final response = await _dio.put<Map<String, dynamic>>(
      _resolvePath('/api/v1/health-profile'),
      data: body.toJson(),
    );
    return HealthProfileResponse.fromJson(response.data!);
  }

  /// Create or save user health profile.
  Future<HealthProfileResponse> createHealthProfileApiV1HealthProfilePost({
    required HealthProfileCreateRequest body,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      _resolvePath('/api/v1/health-profile'),
      data: body.toJson(),
    );
    return HealthProfileResponse.fromJson(response.data!);
  }
}
