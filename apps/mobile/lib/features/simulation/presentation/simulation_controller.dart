import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/generated/export.dart';
import '../../../core/network/api_exception.dart';
import '../../assessment/data/health_profile_repository.dart';
import '../data/simulation_repository.dart';

enum SimulationStatus {
  initial,
  loading,
  success,
  failure,
}

class SimulationState {
  const SimulationState({
    this.status = SimulationStatus.initial,
    this.errorMessage,
    this.simulationResult,
    // Baseline values (from user's real health profile)
    this.baselineSleepDurationHours = 7.0,
    this.baselinePhysicalActivityMin = 150.0,
    this.baselineWeightKg = 65.0,
    this.baselineSmokingStatus = SmokingStatusEnum.never,
    // Active simulated values (what-if overrides)
    this.simulatedSleepDurationHours = 7.0,
    this.simulatedPhysicalActivityMin = 150.0,
    this.simulatedWeightKg = 65.0,
    this.simulatedSmokingStatus = SmokingStatusEnum.never,
    this.isProfileLoaded = false,
  });

  final SimulationStatus status;
  final String? errorMessage;
  final WhatIfSimulationResponse? simulationResult;

  final double baselineSleepDurationHours;
  final double baselinePhysicalActivityMin;
  final double baselineWeightKg;
  final SmokingStatusEnum baselineSmokingStatus;

  final double simulatedSleepDurationHours;
  final double simulatedPhysicalActivityMin;
  final double simulatedWeightKg;
  final SmokingStatusEnum simulatedSmokingStatus;
  final bool isProfileLoaded;

  SimulationState copyWith({
    SimulationStatus? status,
    String? errorMessage,
    WhatIfSimulationResponse? simulationResult,
    double? baselineSleepDurationHours,
    double? baselinePhysicalActivityMin,
    double? baselineWeightKg,
    SmokingStatusEnum? baselineSmokingStatus,
    double? simulatedSleepDurationHours,
    double? simulatedPhysicalActivityMin,
    double? simulatedWeightKg,
    SmokingStatusEnum? simulatedSmokingStatus,
    bool? isProfileLoaded,
  }) {
    return SimulationState(
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
      simulationResult: simulationResult ?? this.simulationResult,
      baselineSleepDurationHours: baselineSleepDurationHours ?? this.baselineSleepDurationHours,
      baselinePhysicalActivityMin: baselinePhysicalActivityMin ?? this.baselinePhysicalActivityMin,
      baselineWeightKg: baselineWeightKg ?? this.baselineWeightKg,
      baselineSmokingStatus: baselineSmokingStatus ?? this.baselineSmokingStatus,
      simulatedSleepDurationHours: simulatedSleepDurationHours ?? this.simulatedSleepDurationHours,
      simulatedPhysicalActivityMin: simulatedPhysicalActivityMin ?? this.simulatedPhysicalActivityMin,
      simulatedWeightKg: simulatedWeightKg ?? this.simulatedWeightKg,
      simulatedSmokingStatus: simulatedSmokingStatus ?? this.simulatedSmokingStatus,
      isProfileLoaded: isProfileLoaded ?? this.isProfileLoaded,
    );
  }
}

class SimulationController extends StateNotifier<SimulationState> {
  SimulationController({
    required SimulationRepository repository,
    required HealthProfileRepository healthProfileRepository,
  })  : _repository = repository,
        _healthProfileRepository = healthProfileRepository,
        super(const SimulationState());

  final SimulationRepository _repository;
  final HealthProfileRepository _healthProfileRepository;

  /// Loads the user's authentic health profile to set baseline markers without altering database.
  Future<void> loadProfileAndInitialize() async {
    try {
      final profile = await _healthProfileRepository.getHealthProfile();
      if (profile != null) {
        initializeFromProfile(profile);
      }
    } catch (_) {
      // Continue with sensible defaults if offline or mock
    }
  }

  /// Sets baseline and active values from user profile (PRD BR-SIM-001).
  void initializeFromProfile(HealthProfileResponse profile) {
    final sleep = profile.sleepDurationHours.toDouble().clamp(3.0, 14.0);
    final activity = profile.physicalActivityMinPerWeek.toDouble().clamp(0.0, 600.0);
    final weight = profile.weightKg.toDouble().clamp(30.0, 200.0);

    SmokingStatusEnum smoking = SmokingStatusEnum.never;
    if (profile.smokingStatus == 'former') {
      smoking = SmokingStatusEnum.former;
    } else if (profile.smokingStatus == 'current') {
      smoking = SmokingStatusEnum.current;
    }

    state = state.copyWith(
      baselineSleepDurationHours: sleep,
      baselinePhysicalActivityMin: activity,
      baselineWeightKg: weight,
      baselineSmokingStatus: smoking,
      simulatedSleepDurationHours: sleep,
      simulatedPhysicalActivityMin: activity,
      simulatedWeightKg: weight,
      simulatedSmokingStatus: smoking,
      isProfileLoaded: true,
    );
  }

  void setSleepDuration(double hours) {
    state = state.copyWith(simulatedSleepDurationHours: hours);
  }

  void setPhysicalActivity(double min) {
    state = state.copyWith(simulatedPhysicalActivityMin: min);
  }

  void setWeight(double kg) {
    state = state.copyWith(simulatedWeightKg: kg);
  }

  void setSmokingStatus(SmokingStatusEnum status) {
    state = state.copyWith(simulatedSmokingStatus: status);
  }

  /// Instantly resets all simulated sliders back to original baseline (PRD BR-SIM-007).
  void resetToBaseline() {
    state = state.copyWith(
      simulatedSleepDurationHours: state.baselineSleepDurationHours,
      simulatedPhysicalActivityMin: state.baselinePhysicalActivityMin,
      simulatedWeightKg: state.baselineWeightKg,
      simulatedSmokingStatus: state.baselineSmokingStatus,
    );
  }

  /// Executes What-If scenario against AI simulation endpoint POST /simulation/what-if.
  Future<void> runSimulation() async {
    state = state.copyWith(status: SimulationStatus.loading, errorMessage: null);

    WhatIfSimulationRequestSmokingStatus? smokingStatus;
    switch (state.simulatedSmokingStatus) {
      case SmokingStatusEnum.never:
        smokingStatus = WhatIfSimulationRequestSmokingStatus.never;
        break;
      case SmokingStatusEnum.former:
        smokingStatus = WhatIfSimulationRequestSmokingStatus.former;
        break;
      case SmokingStatusEnum.current:
        smokingStatus = WhatIfSimulationRequestSmokingStatus.current;
        break;
      case SmokingStatusEnum.$unknown:
        smokingStatus = null;
        break;
    }

    final request = WhatIfSimulationRequest(
      sleepDurationHours: state.simulatedSleepDurationHours,
      physicalActivityMinPerWeek: state.simulatedPhysicalActivityMin,
      weightKg: state.simulatedWeightKg,
      smokingStatus: smokingStatus,
    );

    try {
      final response = await _repository.runWhatIfSimulation(request);
      state = state.copyWith(
        status: SimulationStatus.success,
        simulationResult: response,
      );
    } on ApiException catch (e) {
      state = state.copyWith(
        status: SimulationStatus.failure,
        errorMessage: e.message,
      );
    } catch (e) {
      state = state.copyWith(
        status: SimulationStatus.failure,
        errorMessage: 'Gagal menjalankan kalkulasi simulasi gaya hidup: $e',
      );
    }
  }
}

final simulationControllerProvider =
    StateNotifierProvider<SimulationController, SimulationState>((ref) {
  final repository = ref.watch(simulationRepositoryProvider);
  final healthProfileRepository = ref.watch(healthProfileRepositoryProvider);
  final controller = SimulationController(
    repository: repository,
    healthProfileRepository: healthProfileRepository,
  );
  // Auto-load profile baseline
  controller.loadProfileAndInitialize();
  return controller;
});
