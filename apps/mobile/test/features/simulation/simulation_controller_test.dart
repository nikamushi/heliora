import 'package:flutter_test/flutter_test.dart';

import 'package:heliora_mobile/core/api/generated/export.dart';
import 'package:heliora_mobile/core/network/api_exception.dart';
import 'package:heliora_mobile/features/assessment/data/health_profile_repository.dart';
import 'package:heliora_mobile/features/simulation/data/simulation_repository.dart';
import 'package:heliora_mobile/features/simulation/presentation/simulation_controller.dart';

class MockSimulationRepository implements SimulationRepository {
  WhatIfSimulationRequest? lastRequest;
  WhatIfSimulationResponse? mockResponse;
  bool shouldThrow = false;

  @override
  Future<WhatIfSimulationResponse> runWhatIfSimulation(WhatIfSimulationRequest request) async {
    lastRequest = request;
    if (shouldThrow) {
      throw const ApiException(message: 'Simulasi gagal dijalankan');
    }
    return mockResponse ??
        const WhatIfSimulationResponse(
          appliedParameters: {},
          derivedBmi: 22.5,
          baselineHealthScore: 75,
          simulatedHealthScore: 80,
          healthScoreDelta: 5,
          baselineLifestyleScore: 70,
          simulatedLifestyleScore: 78,
          lifestyleScoreDelta: 8,
          conditionComparisons: [
            WhatIfConditionComparison(
              condition: WhatIfConditionComparisonCondition.diabetes,
              label: 'Diabetes Tipe 2',
              baselineProbability: 0.12,
              simulatedProbability: 0.10,
              baselineScore: 12,
              simulatedScore: 10,
              deltaPercentage: -2.0,
              riskLevel: WhatIfConditionComparisonRiskLevel.low,
              riskLabel: WhatIfConditionComparisonRiskLabel.lower,
              trend: WhatIfConditionComparisonTrend.decreasing,
              impactSummary: 'Penurunan risiko diabetes.',
            ),
          ],
        );
  }
}

class MockHealthProfileRepository implements HealthProfileRepository {
  HealthProfileResponse? profileToReturn;

  @override
  Future<HealthProfileResponse?> getHealthProfile() async => profileToReturn;

  @override
  Future<HealthProfileResponse> createHealthProfile(HealthProfileCreateRequest request) =>
      throw UnimplementedError();

  @override
  Future<HealthProfileResponse> updateHealthProfile(HealthProfileUpdateRequest request) =>
      throw UnimplementedError();

  @override
  Future<HealthProfileResponse> saveHealthProfile(HealthProfileCreateRequest request) =>
      throw UnimplementedError();
}

void main() {
  late MockSimulationRepository mockSimulationRepo;
  late MockHealthProfileRepository mockProfileRepo;
  late SimulationController controller;

  setUp(() {
    mockSimulationRepo = MockSimulationRepository();
    mockProfileRepo = MockHealthProfileRepository();
    controller = SimulationController(
      repository: mockSimulationRepo,
      healthProfileRepository: mockProfileRepo,
    );
  });

  group('SimulationController Unit Tests', () {
    test('initializes with default lifestyle values', () {
      expect(controller.state.status, SimulationStatus.initial);
      expect(controller.state.simulatedSleepDurationHours, 7.0);
      expect(controller.state.simulatedPhysicalActivityMin, 150.0);
      expect(controller.state.simulatedWeightKg, 65.0);
      expect(controller.state.simulatedSmokingStatus, SmokingStatusEnum.never);
    });

    test('initializes accurately from user authentic health profile (BR-SIM-001)', () {
      const sampleProfile = HealthProfileResponse(
        id: 'prof-123',
        userId: 'user-123',
        age: 32,
        gender: 'male',
        heightCm: 175,
        weightKg: 78.5,
        physicalActivityMinPerWeek: 210,
        sleepDurationHours: 6.5,
        smokingStatus: 'former',
        familyHistory: false,
      );

      controller.initializeFromProfile(sampleProfile);

      expect(controller.state.baselineSleepDurationHours, 6.5);
      expect(controller.state.baselinePhysicalActivityMin, 210.0);
      expect(controller.state.baselineWeightKg, 78.5);
      expect(controller.state.baselineSmokingStatus, SmokingStatusEnum.former);

      expect(controller.state.simulatedSleepDurationHours, 6.5);
      expect(controller.state.simulatedPhysicalActivityMin, 210.0);
      expect(controller.state.simulatedWeightKg, 78.5);
      expect(controller.state.simulatedSmokingStatus, SmokingStatusEnum.former);
      expect(controller.state.isProfileLoaded, isTrue);
    });

    test('resetToBaseline restores all modified values back to baseline instantly (BR-SIM-007)', () {
      const sampleProfile = HealthProfileResponse(
        id: 'prof-123',
        userId: 'user-123',
        age: 32,
        gender: 'male',
        heightCm: 175,
        weightKg: 80.0,
        physicalActivityMinPerWeek: 120,
        sleepDurationHours: 6.0,
        smokingStatus: 'never',
        familyHistory: false,
      );

      controller.initializeFromProfile(sampleProfile);

      // Modify values through what-if exploration
      controller.setSleepDuration(9.0);
      controller.setPhysicalActivity(300.0);
      controller.setWeight(72.0);
      controller.setSmokingStatus(SmokingStatusEnum.current);

      expect(controller.state.simulatedSleepDurationHours, 9.0);
      expect(controller.state.simulatedPhysicalActivityMin, 300.0);
      expect(controller.state.simulatedWeightKg, 72.0);
      expect(controller.state.simulatedSmokingStatus, SmokingStatusEnum.current);

      // Reset
      controller.resetToBaseline();

      expect(controller.state.simulatedSleepDurationHours, 6.0);
      expect(controller.state.simulatedPhysicalActivityMin, 120.0);
      expect(controller.state.simulatedWeightKg, 80.0);
      expect(controller.state.simulatedSmokingStatus, SmokingStatusEnum.never);
    });

    test('runSimulation executes scenario and updates state with delta outcomes', () async {
      controller.setSleepDuration(8.0);
      controller.setPhysicalActivity(200.0);
      controller.setWeight(68.0);
      controller.setSmokingStatus(SmokingStatusEnum.never);

      await controller.runSimulation();

      expect(controller.state.status, SimulationStatus.success);
      expect(controller.state.simulationResult, isNotNull);
      expect(controller.state.simulationResult?.simulatedHealthScore, 80);
      expect(controller.state.simulationResult?.healthScoreDelta, 5);

      final req = mockSimulationRepo.lastRequest;
      expect(req?.sleepDurationHours, 8.0);
      expect(req?.physicalActivityMinPerWeek, 200.0);
      expect(req?.weightKg, 68.0);
      expect(req?.smokingStatus, WhatIfSimulationRequestSmokingStatus.never);
    });

    test('runSimulation handles failure with honest error message', () async {
      mockSimulationRepo.shouldThrow = true;

      await controller.runSimulation();

      expect(controller.state.status, SimulationStatus.failure);
      expect(controller.state.errorMessage, 'Simulasi gagal dijalankan');
    });
  });
}
