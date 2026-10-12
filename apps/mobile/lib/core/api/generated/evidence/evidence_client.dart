// coverage:ignore-file
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';

import '../models/evidence_list_response.dart';

class EvidenceClient {
  const EvidenceClient(this._dio, {this.baseUrl});

  final Dio _dio;
  final String? baseUrl;

  String _resolvePath(String path) {
    if (baseUrl == null || baseUrl!.isEmpty) return path;
    final cleanBase = baseUrl!.endsWith('/')
        ? baseUrl!.substring(0, baseUrl!.length - 1)
        : baseUrl!;
    return '$cleanBase$path';
  }

  /// List clinical evidence entries.
  Future<EvidenceListResponse> getClinicalEvidenceApiV1EvidenceGet({
    String? category,
    String? ruleId,
    String? search,
  }) async {
    final queryParams = <String, dynamic>{};
    if (category != null) queryParams['category'] = category;
    if (ruleId != null) queryParams['rule_id'] = ruleId;
    if (search != null) queryParams['search'] = search;

    final response = await _dio.get<Map<String, dynamic>>(
      _resolvePath('/api/v1/evidence'),
      queryParameters: queryParams,
    );
    return EvidenceListResponse.fromJson(response.data!);
  }
}
