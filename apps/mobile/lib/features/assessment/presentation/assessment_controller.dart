import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/generated/export.dart';
import '../../../core/network/api_exception.dart';
import '../data/assessment_repository.dart';
import '../data/health_profile_repository.dart';

/// Lifecycle statuses for the assessment flow.
enum AssessmentFlowStatus {
  initial,
  submittingProfile,
  runningAI,
  success,
  failure,
}

/// Immutable state holding all 3-step assessment parameters and submission progress.
class AssessmentFlowState {
  const AssessmentFlowState({
    this.currentStep = 1,
    this.status = AssessmentFlowStatus.initial,
    this.errorMessage,
    this.result,
    // Step 1: Data fisik
    this.age,
    this.gender = GenderEnum.male,
    this.heightCm,
    this.weightKg,
    // Step 2: Gaya hidup
    this.physicalActivityMinPerWeek = 150.0,
    this.sleepDurationHours = 7.0,
    this.smokingStatus = SmokingStatusEnum.never,
    // Step 3: Riwayat & stres
    this.hasDiabetesFamily = false,
    this.hasHypertensionFamily = false,
    this.hasCvdFamily = false,
    this.hasOtherFamily = false,
    this.familyHistoryNotes,
    this.stressLevel = 5,
  });

  final int currentStep;
  final AssessmentFlowStatus status;
  final String? errorMessage;
  final AssessmentSummaryResponse? result;

  // Step 1: Physical Data
  final int? age;
  final GenderEnum gender;
  final double? heightCm;
  final double? weightKg;

  // Step 2: Lifestyle Data
  final double physicalActivityMinPerWeek;
  final double sleepDurationHours;
  final SmokingStatusEnum smokingStatus;

  // Step 3: Family history & Stress
  final bool hasDiabetesFamily;
  final bool hasHypertensionFamily;
  final bool hasCvdFamily;
  final bool hasOtherFamily;
  final String? familyHistoryNotes;
  final int stressLevel;

  bool get hasAnyFamilyHistory =>
      hasDiabetesFamily || hasHypertensionFamily || hasCvdFamily || hasOtherFamily;

  double? get calculatedBmi {
    if (heightCm == null || weightKg == null) return null;
    if (heightCm! <= 50 || weightKg! <= 20) return null;
    final m = heightCm! / 100.0;
    return weightKg! / (m * m);
  }

  bool get isStep1Valid {
    return age != null &&
        age! >= 18 &&
        age! <= 120 &&
        heightCm != null &&
        heightCm! >= 100 &&
        heightCm! <= 250 &&
        weightKg != null &&
        weightKg! >= 30 &&
        weightKg! <= 250;
  }

  bool get isStep2Valid {
    return physicalActivityMinPerWeek >= 0 &&
        sleepDurationHours >= 3 &&
        sleepDurationHours <= 16;
  }

  bool get isStep3Valid {
    return stressLevel >= 1 && stressLevel <= 10;
  }

  AssessmentFlowState copyWith({
    int? currentStep,
    AssessmentFlowStatus? status,
    String? errorMessage,
    AssessmentSummaryResponse? result,
    int? age,
    GenderEnum? gender,
    double? heightCm,
    double? weightKg,
    double? physicalActivityMinPerWeek,
    double? sleepDurationHours,
    SmokingStatusEnum? smokingStatus,
    bool? hasDiabetesFamily,
    bool? hasHypertensionFamily,
    bool? hasCvdFamily,
    bool? hasOtherFamily,
    String? familyHistoryNotes,
    int? stressLevel,
  }) {
    return AssessmentFlowState(
      currentStep: currentStep ?? this.currentStep,
      status: status ?? this.status,
      errorMessage: errorMessage,
      result: result ?? this.result,
      age: age ?? this.age,
      gender: gender ?? this.gender,
      heightCm: heightCm ?? this.heightCm,
      weightKg: weightKg ?? this.weightKg,
      physicalActivityMinPerWeek: physicalActivityMinPerWeek ?? this.physicalActivityMinPerWeek,
      sleepDurationHours: sleepDurationHours ?? this.sleepDurationHours,
      smokingStatus: smokingStatus ?? this.smokingStatus,
      hasDiabetesFamily: hasDiabetesFamily ?? this.hasDiabetesFamily,
      hasHypertensionFamily: hasHypertensionFamily ?? this.hasHypertensionFamily,
      hasCvdFamily: hasCvdFamily ?? this.hasCvdFamily,
      hasOtherFamily: hasOtherFamily ?? this.hasOtherFamily,
      familyHistoryNotes: familyHistoryNotes ?? this.familyHistoryNotes,
      stressLevel: stressLevel ?? this.stressLevel,
    );
  }
}

/// StateNotifier orchestrating the 3-step assessment and submission process.
class AssessmentController extends StateNotifier<AssessmentFlowState> {
  AssessmentController({
    required HealthProfileRepository healthProfileRepository,
    required AssessmentRepository assessmentRepository,
  })  : _healthProfileRepository = healthProfileRepository,
        _assessmentRepository = assessmentRepository,
        super(const AssessmentFlowState());

  final HealthProfileRepository _healthProfileRepository;
  final AssessmentRepository _assessmentRepository;

  /// Pre-populates all assessment form fields from an existing health profile (MFR-010).
  void prefillFromProfile(HealthProfileResponse profile) {
    bool hasDiabetes = false;
    bool hasHypertension = false;
    bool hasCvd = false;
    bool hasOther = false;
    String? notes;

    final details = profile.familyHistoryDetails;
    if (details != null && details.isNotEmpty) {
      final parts = details.split(', ');
      for (final part in parts) {
        if (part == 'Diabetes') {
          hasDiabetes = true;
        } else if (part == 'Hipertensi') {
          hasHypertension = true;
        } else if (part == 'Kardiovaskular') {
          hasCvd = true;
        } else if (part == 'Penyakit kronis lainnya') {
          hasOther = true;
        } else if (part.startsWith('Catatan: ')) {
          notes = part.substring(9);
        }
      }
    } else if (profile.familyHistory == true) {
      hasOther = true;
    }

    final gender = GenderEnum.fromJson(profile.gender);
    final smoking = SmokingStatusEnum.fromJson(profile.smokingStatus);

    state = state.copyWith(
      currentStep: 1,
      status: AssessmentFlowStatus.initial,
      age: profile.age,
      gender: gender != GenderEnum.$unknown ? gender : GenderEnum.male,
      heightCm: profile.heightCm.toDouble(),
      weightKg: profile.weightKg.toDouble(),
      physicalActivityMinPerWeek: profile.physicalActivityMinPerWeek.toDouble(),
      sleepDurationHours: profile.sleepDurationHours.toDouble(),
      smokingStatus: smoking != SmokingStatusEnum.$unknown ? smoking : SmokingStatusEnum.never,
      hasDiabetesFamily: hasDiabetes,
      hasHypertensionFamily: hasHypertension,
      hasCvdFamily: hasCvd,
      hasOtherFamily: hasOther,
      familyHistoryNotes: notes,
      stressLevel: profile.stressLevel ?? 5,
    );
  }

  void setAge(int? age) => state = state.copyWith(age: age);
  void setGender(GenderEnum gender) => state = state.copyWith(gender: gender);
  void setHeight(double? h) => state = state.copyWith(heightCm: h);
  void setWeight(double? w) => state = state.copyWith(weightKg: w);

  void setPhysicalActivity(double min) => state = state.copyWith(physicalActivityMinPerWeek: min);
  void setSleepDuration(double hours) => state = state.copyWith(sleepDurationHours: hours);
  void setSmokingStatus(SmokingStatusEnum status) => state = state.copyWith(smokingStatus: status);

  void setDiabetesFamily(bool val) => state = state.copyWith(hasDiabetesFamily: val);
  void setHypertensionFamily(bool val) => state = state.copyWith(hasHypertensionFamily: val);
  void setCvdFamily(bool val) => state = state.copyWith(hasCvdFamily: val);
  void setOtherFamily(bool val) => state = state.copyWith(hasOtherFamily: val);
  void setFamilyNotes(String? notes) => state = state.copyWith(familyHistoryNotes: notes);
  void setStressLevel(int level) => state = state.copyWith(stressLevel: level);

  void goToNextStep() {
    if (state.currentStep == 1 && state.isStep1Valid) {
      state = state.copyWith(currentStep: 2);
    } else if (state.currentStep == 2 && state.isStep2Valid) {
      state = state.copyWith(currentStep: 3);
    }
  }

  void goToPreviousStep() {
    if (state.currentStep > 1) {
      state = state.copyWith(currentStep: state.currentStep - 1);
    }
  }

  /// Compiles family history string list for backend details.
  String _buildFamilyDetails() {
    final list = <String>[];
    if (state.hasDiabetesFamily) list.add('Diabetes');
    if (state.hasHypertensionFamily) list.add('Hipertensi');
    if (state.hasCvdFamily) list.add('Kardiovaskular');
    if (state.hasOtherFamily) list.add('Penyakit kronis lainnya');
    if (state.familyHistoryNotes != null && state.familyHistoryNotes!.trim().isNotEmpty) {
      list.add('Catatan: ${state.familyHistoryNotes!.trim()}');
    }
    return list.join(', ');
  }

  /// Submits the health profile and triggers AI risk calculation.
  Future<void> submitAndRunAssessment() async {
    state = state.copyWith(
      status: AssessmentFlowStatus.submittingProfile,
      errorMessage: null,
    );

    try {
      final familyDetails = _buildFamilyDetails();
      final profileReq = HealthProfileCreateRequest(
        age: state.age ?? 30,
        gender: state.gender,
        heightCm: state.heightCm ?? 170,
        weightKg: state.weightKg ?? 65,
        physicalActivityMinPerWeek: state.physicalActivityMinPerWeek,
        sleepDurationHours: state.sleepDurationHours,
        smokingStatus: state.smokingStatus,
        familyHistory: state.hasAnyFamilyHistory,
        familyHistoryDetails: familyDetails.isNotEmpty ? familyDetails : null,
        stressLevel: state.stressLevel,
        bmi: state.calculatedBmi,
      );

      // Step A: Save Profile
      await _healthProfileRepository.saveHealthProfile(profileReq);

      // Step B: Trigger AI Assessment
      state = state.copyWith(status: AssessmentFlowStatus.runningAI);
      final assessmentResult = await _assessmentRepository.runAssessment();

      state = state.copyWith(
        status: AssessmentFlowStatus.success,
        result: assessmentResult,
      );
    } on ApiException catch (e) {
      state = state.copyWith(
        status: AssessmentFlowStatus.failure,
        errorMessage: 'Analisis sedang tidak tersedia, coba lagi: ${e.message}',
      );
    } catch (_) {
      // Statutory non-slop failure message (PRD BR-ASSESS-003: no fake scores ever)
      state = state.copyWith(
        status: AssessmentFlowStatus.failure,
        errorMessage: 'Analisis sedang tidak tersedia, coba lagi.',
      );
    }
  }

  /// Retry calculation from failure state.
  Future<void> retry() async {
    await submitAndRunAssessment();
  }

  /// Reset back to editing form.
  void backToForm() {
    state = state.copyWith(status: AssessmentFlowStatus.initial);
  }
}

/// Provider for the assessment controller and state.
final assessmentControllerProvider =
    StateNotifierProvider<AssessmentController, AssessmentFlowState>((ref) {
  final healthRepo = ref.watch(healthProfileRepositoryProvider);
  final assessmentRepo = ref.watch(assessmentRepositoryProvider);
  return AssessmentController(
    healthProfileRepository: healthRepo,
    assessmentRepository: assessmentRepo,
  );
});
