// coverage:ignore-file
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';

import '../models/health_check_response.dart';

class SystemClient {
  const SystemClient(this._dio, {this.baseUrl});

  final Dio _dio;
  final String? baseUrl;

  String _resolvePath(String path) {
    if (baseUrl == null || baseUrl!.isEmpty) return path;
    final cleanBase = baseUrl!.endsWith('/')
        ? baseUrl!.substring(0, baseUrl!.length - 1)
        : baseUrl!;
    return '$cleanBase$path';
  }

  /// Health check.
  Future<HealthCheckResponse> healthCheckApiV1HealthGet() async {
    final response = await _dio.get<Map<String, dynamic>>(
      _resolvePath('/api/v1/health'),
    );
    return HealthCheckResponse.fromJson(response.data!);
  }
}
