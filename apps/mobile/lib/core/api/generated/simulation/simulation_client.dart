// coverage:ignore-file
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';

import '../models/future_simulation_request.dart';
import '../models/future_simulation_response.dart';
import '../models/what_if_simulation_request.dart';
import '../models/what_if_simulation_response.dart';

class SimulationClient {
  const SimulationClient(this._dio, {this.baseUrl});

  final Dio _dio;
  final String? baseUrl;

  String _resolvePath(String path) {
    if (baseUrl == null || baseUrl!.isEmpty) return path;
    final cleanBase = baseUrl!.endsWith('/')
        ? baseUrl!.substring(0, baseUrl!.length - 1)
        : baseUrl!;
    return '$cleanBase$path';
  }

  /// Run future health trajectory simulation.
  Future<FutureSimulationResponse> simulateFutureHealthApiV1SimulationFuturePost({
    required FutureSimulationRequest body,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      _resolvePath('/api/v1/simulation/future'),
      data: body.toJson(),
    );
    return FutureSimulationResponse.fromJson(response.data!);
  }

  /// Run what-if scenario simulation.
  Future<WhatIfSimulationResponse> simulateWhatIfScenarioApiV1SimulationWhatIfPost({
    required WhatIfSimulationRequest body,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      _resolvePath('/api/v1/simulation/what-if'),
      data: body.toJson(),
    );
    return WhatIfSimulationResponse.fromJson(response.data!);
  }
}
