import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/generated/export.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/providers/api_providers.dart';

/// Repository for running lifestyle what-if scenario simulations (PRD FR-008 / BR-SIM-001..007).
class SimulationRepository {
  const SimulationRepository(this._apiClient);

  final HelioraApiClient _apiClient;

  /// Runs What-If lifestyle scenario simulation without modifying baseline profile in database.
  Future<WhatIfSimulationResponse> runWhatIfSimulation(WhatIfSimulationRequest request) async {
    try {
      return await _apiClient.simulation.simulateWhatIfScenarioApiV1SimulationWhatIfPost(
        body: request,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Gagal menjalankan simulasi gaya hidup: $e');
    }
  }
}

/// Provides the SimulationRepository instance.
final simulationRepositoryProvider = Provider<SimulationRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return SimulationRepository(apiClient);
});
