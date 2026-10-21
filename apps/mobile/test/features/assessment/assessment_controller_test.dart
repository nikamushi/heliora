import 'package:flutter_test/flutter_test.dart';
import 'package:heliora_mobile/core/api/generated/export.dart';
import 'package:heliora_mobile/core/network/api_exception.dart';
import 'package:heliora_mobile/features/assessment/data/assessment_repository.dart';
import 'package:heliora_mobile/features/assessment/data/health_profile_repository.dart';
import 'package:heliora_mobile/features/assessment/presentation/assessment_controller.dart';
import 'package:heliora_mobile/features/consent/data/consent_repository.dart';

class FakeConsentRepository implements ConsentRepository {
  bool hasConsent = true;

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<ConsentStatusResponse> getConsentStatus() async {
    return ConsentStatusResponse(hasActiveConsent: hasConsent);
  }
}

class FakeHealthProfileRepository implements HealthProfileRepository {
  bool shouldFail = false;
  HealthProfileCreateRequest? lastSaveRequest;

  @override
  Future<HealthProfileResponse?> getHealthProfile() async => null;

  @override
  Future<HealthProfileResponse> createHealthProfile(HealthProfileCreateRequest request) async {
    return saveHealthProfile(request);
  }

  @override
  Future<HealthProfileResponse> updateHealthProfile(HealthProfileUpdateRequest request) async {
    throw UnimplementedError();
  }

  @override
  Future<HealthProfileResponse> saveHealthProfile(HealthProfileCreateRequest request) async {
    lastSaveRequest = request;
    if (shouldFail) {
      throw const ApiException(message: 'Database error saving health profile');
    }
    return HealthProfileResponse(
      id: 'profile-123',
      userId: 'user-abc',
      age: request.age,
      gender: request.gender.json ?? 'male',
      heightCm: request.heightCm,
      weightKg: request.weightKg,
      physicalActivityMinPerWeek: request.physicalActivityMinPerWeek,
      sleepDurationHours: request.sleepDurationHours,
      smokingStatus: request.smokingStatus.json ?? 'never',
      familyHistory: request.familyHistory,
    );
  }
}

class FakeAssessmentRepository implements AssessmentRepository {
  bool shouldFail = false;
  int runCallCount = 0;

  @override
  Future<AssessmentSummaryResponse> runAssessment() async {
    runCallCount++;
    if (shouldFail) {
      throw const ApiException(message: 'AI calculation service timeout');
    }
    return const AssessmentSummaryResponse(
      id: 'assessment-xyz',
      healthScore: 84,
      lifestyleScore: 79,
      risks: [],
      topFactors: [],
      recommendations: [],
      assessedAt: '2026-10-12T12:00:00Z',
    );
  }

  @override
  Future<AssessmentSummaryResponse?> getLatestAssessment() async => null;

  @override
  Future<AssessmentSummaryResponse> getAssessmentById(String assessmentId) async {
    throw UnimplementedError();
  }
}

void main() {
  group('AssessmentController', () {
    late FakeHealthProfileRepository fakeHealthProfileRepo;
    late FakeAssessmentRepository fakeAssessmentRepo;
    late AssessmentController controller;

    setUp(() {
      fakeHealthProfileRepo = FakeHealthProfileRepository();
      fakeAssessmentRepo = FakeAssessmentRepository();
      controller = AssessmentController(
        healthProfileRepository: fakeHealthProfileRepo,
        assessmentRepository: fakeAssessmentRepo,
      );
    });

    test('initial state defaults to Step 1 with default lifestyle values', () {
      final state = controller.state;
      expect(state.currentStep, 1);
      expect(state.status, AssessmentFlowStatus.initial);
      expect(state.gender, GenderEnum.male);
      expect(state.physicalActivityMinPerWeek, 150.0);
      expect(state.sleepDurationHours, 7.0);
      expect(state.smokingStatus, SmokingStatusEnum.never);
      expect(state.stressLevel, 5);
      expect(state.isStep1Valid, isFalse);
    });

    test('step 1 validation verifies age, height, and weight boundaries', () {
      expect(controller.state.isStep1Valid, isFalse);

      controller.setAge(17); // Under 18
      controller.setHeight(170);
      controller.setWeight(65);
      expect(controller.state.isStep1Valid, isFalse);

      controller.setAge(29);
      expect(controller.state.isStep1Valid, isTrue);

      controller.setHeight(90); // Under 100 cm
      expect(controller.state.isStep1Valid, isFalse);

      controller.setHeight(165);
      controller.setWeight(25); // Under 30 kg
      expect(controller.state.isStep1Valid, isFalse);

      controller.setWeight(62);
      expect(controller.state.isStep1Valid, isTrue);
    });

    test('step navigation moves through 1 -> 2 -> 3 and back', () {
      controller.setAge(29);
      controller.setHeight(170);
      controller.setWeight(65);
      expect(controller.state.currentStep, 1);

      controller.goToNextStep();
      expect(controller.state.currentStep, 2);

      controller.goToNextStep();
      expect(controller.state.currentStep, 3);

      controller.goToPreviousStep();
      expect(controller.state.currentStep, 2);

      controller.goToPreviousStep();
      expect(controller.state.currentStep, 1);
    });

    test('BMI is calculated dynamically from height and weight', () {
      controller.setHeight(160);
      controller.setWeight(64);
      // BMI = 64 / (1.6 * 1.6) = 25.0
      expect(controller.state.calculatedBmi, closeTo(25.0, 0.01));
    });

    test('successful flow saves profile, runs AI calculation, and sets success state', () async {
      controller.setAge(29);
      controller.setGender(GenderEnum.female);
      controller.setHeight(160);
      controller.setWeight(55);
      controller.setPhysicalActivity(180);
      controller.setSleepDuration(8);
      controller.setSmokingStatus(SmokingStatusEnum.never);
      controller.setDiabetesFamily(true);
      controller.setFamilyNotes('Ibu diabetes tipe 2');
      controller.setStressLevel(4);

      await controller.submitAndRunAssessment();

      expect(controller.state.status, AssessmentFlowStatus.success);
      expect(controller.state.result, isNotNull);
      expect(controller.state.result!.id, 'assessment-xyz');
      expect(fakeHealthProfileRepo.lastSaveRequest, isNotNull);
      expect(fakeHealthProfileRepo.lastSaveRequest!.age, 29);
      expect(fakeHealthProfileRepo.lastSaveRequest!.gender, GenderEnum.female);
      expect(fakeAssessmentRepo.runCallCount, 1);
    });

    test('failure handling sets honest failure message without false scores, and allows retry', () async {
      controller.setAge(29);
      controller.setHeight(160);
      controller.setWeight(55);

      fakeAssessmentRepo.shouldFail = true;
      await controller.submitAndRunAssessment();

      expect(controller.state.status, AssessmentFlowStatus.failure);
      expect(controller.state.result, isNull);
      expect(controller.state.errorMessage, contains('Analisis sedang tidak tersedia'));

      // Retry when service recovers
      fakeAssessmentRepo.shouldFail = false;
      await controller.retry();

      expect(controller.state.status, AssessmentFlowStatus.success);
      expect(controller.state.result, isNotNull);
    });

    test('prefillFromProfile pre-populates all state properties correctly', () {
      const profile = HealthProfileResponse(
        id: 'prof-test',
        userId: 'usr-1',
        age: 38,
        gender: 'female',
        heightCm: 162.0,
        weightKg: 58.0,
        physicalActivityMinPerWeek: 210.0,
        sleepDurationHours: 7.5,
        smokingStatus: 'former',
        familyHistory: true,
        familyHistoryDetails: 'Diabetes, Kardiovaskular, Catatan: Ayah jantung',
        stressLevel: 3,
      );

      controller.prefillFromProfile(profile);

      final state = controller.state;
      expect(state.currentStep, 1);
      expect(state.age, 38);
      expect(state.gender, GenderEnum.female);
      expect(state.heightCm, 162.0);
      expect(state.weightKg, 58.0);
      expect(state.physicalActivityMinPerWeek, 210.0);
      expect(state.sleepDurationHours, 7.5);
      expect(state.smokingStatus, SmokingStatusEnum.former);
      expect(state.hasDiabetesFamily, isTrue);
      expect(state.hasCvdFamily, isTrue);
      expect(state.hasHypertensionFamily, isFalse);
      expect(state.familyHistoryNotes, 'Ayah jantung');
      expect(state.stressLevel, 3);
      expect(state.isStep1Valid, isTrue);
    });

    test('submitAndRunAssessment halts with failure message when active consent is revoked', () async {
      final fakeConsent = FakeConsentRepository()..hasConsent = false;
      final guardedController = AssessmentController(
        healthProfileRepository: fakeHealthProfileRepo,
        assessmentRepository: fakeAssessmentRepo,
        consentRepository: fakeConsent,
      );

      await guardedController.submitAndRunAssessment();

      expect(guardedController.state.status, AssessmentFlowStatus.failure);
      expect(
        guardedController.state.errorMessage,
        contains('Persetujuan pemrosesan data kesehatan diperlukan'),
      );
      expect(fakeHealthProfileRepo.lastSaveRequest, isNull);
      expect(fakeAssessmentRepo.runCallCount, 0);
    });
  });
}

