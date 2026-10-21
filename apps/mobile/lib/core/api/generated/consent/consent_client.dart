// coverage:ignore-file
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';

import '../models/consent_create_request.dart';
import '../models/consent_response.dart';
import '../models/consent_status_response.dart';

class ConsentClient {
  const ConsentClient(this._dio, {this.baseUrl});

  final Dio _dio;
  final String? baseUrl;

  String _resolvePath(String path) {
    if (baseUrl == null || baseUrl!.isEmpty) return path;
    final cleanBase = baseUrl!.endsWith('/')
        ? baseUrl!.substring(0, baseUrl!.length - 1)
        : baseUrl!;
    return '$cleanBase$path';
  }

  /// Record user consent.
  Future<ConsentResponse> recordConsentApiV1ConsentPost({
    required ConsentCreateRequest body,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      _resolvePath('/api/v1/consent'),
      data: body.toJson(),
    );
    return ConsentResponse.fromJson(response.data!);
  }

  /// Get user consent status.
  Future<ConsentStatusResponse> getConsentStatusApiV1ConsentStatusGet() async {
    final response = await _dio.get<Map<String, dynamic>>(
      _resolvePath('/api/v1/consent/status'),
    );
    return ConsentStatusResponse.fromJson(response.data!);
  }

  /// Revoke user consent.
  Future<ConsentResponse> revokeConsentApiV1ConsentRevokePost() async {
    final response = await _dio.post<Map<String, dynamic>>(
      _resolvePath('/api/v1/consent/revoke'),
    );
    return ConsentResponse.fromJson(response.data!);
  }
}
