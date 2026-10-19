import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/generated/export.dart';
import '../../../theme/components.dart';
import '../../../theme/tokens.dart';
import 'assessment_controller.dart';
import 'widgets/bmi_indicator.dart';
import 'widgets/choice_option.dart';
import 'widgets/step_bar.dart';

/// Multi-step assessment screen matching Figma Alur 2 (Nodes 77:530 - 77:840).
class AssessmentFlowScreen extends ConsumerStatefulWidget {
  const AssessmentFlowScreen({
    super.key,
    this.initialProfile,
    this.onAssessmentCompleted,
    this.onBack,
  });

  final HealthProfileResponse? initialProfile;
  final VoidCallback? onAssessmentCompleted;
  final VoidCallback? onBack;

  @override
  ConsumerState<AssessmentFlowScreen> createState() => _AssessmentFlowScreenState();
}

class _AssessmentFlowScreenState extends ConsumerState<AssessmentFlowScreen> {
  final _ageController = TextEditingController();
  final _heightController = TextEditingController();
  final _weightController = TextEditingController();
  final _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.initialProfile != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        ref.read(assessmentControllerProvider.notifier).prefillFromProfile(widget.initialProfile!);
        _syncControllersFromProfile(widget.initialProfile!);
      });
    }
  }

  void _syncControllersFromProfile(HealthProfileResponse profile) {
    _ageController.text = profile.age.toString();
    _heightController.text = profile.heightCm.toStringAsFixed(profile.heightCm % 1 == 0 ? 0 : 1);
    _weightController.text = profile.weightKg.toStringAsFixed(profile.weightKg % 1 == 0 ? 0 : 1);
    final details = profile.familyHistoryDetails;
    if (details != null && details.contains('Catatan: ')) {
      final idx = details.indexOf('Catatan: ');
      _notesController.text = details.substring(idx + 9).trim();
    }
  }

  @override
  void dispose() {
    _ageController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(assessmentControllerProvider);
    final controller = ref.read(assessmentControllerProvider.notifier);

    // Trigger completion callback on success
    ref.listen<AssessmentFlowState>(assessmentControllerProvider, (prev, next) {
      if (next.status == AssessmentFlowStatus.success) {
        widget.onAssessmentCompleted?.call();
      }
    });

    if (state.status == AssessmentFlowStatus.submittingProfile ||
        state.status == AssessmentFlowStatus.runningAI) {
      return _ProcessingAssessmentView(status: state.status);
    }

    if (state.status == AssessmentFlowStatus.failure) {
      return _AssessmentFailureView(
        errorMessage: state.errorMessage,
        onRetry: () => controller.retry(),
        onBackToForm: () => controller.backToForm(),
      );
    }

    return Scaffold(
      backgroundColor: HelioraTokens.muted,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Eyebrow Monospace (Figma node 77:536)
                  Text(
                    'LANGKAH 02 / 02 · PROFIL KESEHATAN',
                    style: TextStyle(
                      fontFamily: 'JetBrains Mono',
                      fontSize: 12.0,
                      fontWeight: FontWeight.w700,
                      height: 16.0 / 12.0,
                      letterSpacing: 1.2,
                      color: HelioraTokens.brand900,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // StepBar (Figma node 70:395)
                  StepBar(currentStep: state.currentStep, totalSteps: 3),
                  const SizedBox(height: 12),

                  // Caption: Tahap X dari 3
                  Text(
                    'Tahap ${state.currentStep} dari 3',
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 12.0,
                      fontWeight: FontWeight.w400,
                      height: 16.0 / 12.0,
                      color: HelioraTokens.mutedForeground,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Title: Data dasar / Pola gaya hidup / Riwayat keluarga
                  Text(
                    _stepTitle(state.currentStep),
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 24.0,
                      fontWeight: FontWeight.w700,
                      height: 32.0 / 24.0,
                      letterSpacing: -0.24,
                      color: HelioraTokens.foreground,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Screen Content based on current step
                  if (state.currentStep == 1)
                    _buildStep1(state, controller)
                  else if (state.currentStep == 2)
                    _buildStep2(state, controller)
                  else
                    _buildStep3(state, controller),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _stepTitle(int step) {
    switch (step) {
      case 1:
        return 'Data dasar';
      case 2:
        return 'Pola gaya hidup';
      case 3:
        return 'Riwayat keluarga';
      default:
        return '';
    }
  }

  // ==========================================
  // STEP 1: DATA FISIK (Figma node 77:530)
  // ==========================================
  Widget _buildStep1(AssessmentFlowState state, AssessmentController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Usia (tahun)
        const Text(
          'Usia (tahun)',
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 14.0,
            fontWeight: FontWeight.w500,
            height: 20.0 / 14.0,
            color: HelioraTokens.foreground,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _ageController,
          keyboardType: TextInputType.number,
          style: const TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 16.0,
            fontWeight: FontWeight.w400,
            color: HelioraTokens.foreground,
          ),
          decoration: _inputDecoration(hintText: 'Contoh: 29'),
          onChanged: (val) {
            final parsed = int.tryParse(val.trim());
            controller.setAge(parsed);
          },
        ),
        const SizedBox(height: 16),

        // Jenis Kelamin (Figma node 77:563)
        const Text(
          'Jenis kelamin',
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 14.0,
            fontWeight: FontWeight.w500,
            height: 20.0 / 14.0,
            color: HelioraTokens.foreground,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: ChoiceOption<GenderEnum>(
                value: GenderEnum.male,
                groupValue: state.gender,
                label: 'Pria',
                onChanged: (val) => controller.setGender(val),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ChoiceOption<GenderEnum>(
                value: GenderEnum.female,
                groupValue: state.gender,
                label: 'Wanita',
                onChanged: (val) => controller.setGender(val),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Tinggi Badan & Berat Badan (Figma node 77:572)
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Tinggi badan (cm)',
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 14.0,
                      fontWeight: FontWeight.w500,
                      height: 20.0 / 14.0,
                      color: HelioraTokens.foreground,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _heightController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 16.0,
                      fontWeight: FontWeight.w400,
                      color: HelioraTokens.foreground,
                    ),
                    decoration: _inputDecoration(hintText: '160'),
                    onChanged: (val) {
                      final parsed = double.tryParse(val.trim().replaceAll(',', '.'));
                      controller.setHeight(parsed);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Berat badan (kg)',
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 14.0,
                      fontWeight: FontWeight.w500,
                      height: 20.0 / 14.0,
                      color: HelioraTokens.foreground,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _weightController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 16.0,
                      fontWeight: FontWeight.w400,
                      color: HelioraTokens.foreground,
                    ),
                    decoration: _inputDecoration(hintText: '74'),
                    onChanged: (val) {
                      final parsed = double.tryParse(val.trim().replaceAll(',', '.'));
                      controller.setWeight(parsed);
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Realtime BMI Indicator (Figma node 71:200 / 71:153)
        BmiIndicator(
          heightCm: state.heightCm,
          weightKg: state.weightKg,
        ),
        const SizedBox(height: 24),

        // Action Button: Lanjut (Figma node 77:606)
        SizedBox(
          height: 48,
          child: ElevatedButton(
            onPressed: state.isStep1Valid ? () => controller.goToNextStep() : null,
            style: _primaryButtonStyle(),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Lanjut', style: HelioraTokens.labelButton),
                SizedBox(width: 8),
                HelioraIcon(HelioraIcons.arrowRight, size: 20, color: Colors.white),
              ],
            ),
          ),
        ),
        if (widget.onBack != null) ...[
          const SizedBox(height: 12),
          SizedBox(
            height: 48,
            child: OutlinedButton(
              onPressed: widget.onBack,
              style: OutlinedButton.styleFrom(
                foregroundColor: HelioraTokens.foreground,
                side: const BorderSide(color: HelioraTokens.border, width: 1.0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                ),
              ),
              child: const Text('Batal & Kembali ke Profil', style: HelioraTokens.labelButtonSecondary),
            ),
          ),
        ],
      ],
    );
  }

  // ==========================================
  // STEP 2: GAYA HIDUP (Figma node 77:618)
  // ==========================================
  Widget _buildStep2(AssessmentFlowState state, AssessmentController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Card: Aktivitas dan tidur (Figma node 77:632)
        Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: HelioraTokens.border, width: 1.0),
            borderRadius: BorderRadius.circular(16.0),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Aktivitas Fisik Slider (Figma node 45:176)
              _buildSliderSection(
                label: 'Aktivitas fisik',
                valueDisplay: '${state.physicalActivityMinPerWeek.toInt()} menit/minggu',
                currentValue: state.physicalActivityMinPerWeek,
                min: 0,
                max: 360,
                divisions: 24,
                minLabel: '0',
                baselineLabel: 'Anjuran umum: 150 menit',
                maxLabel: '360',
                onChanged: (val) => controller.setPhysicalActivity(val),
              ),
              const SizedBox(height: 24),

              // Durasi Tidur Slider
              _buildSliderSection(
                label: 'Durasi tidur',
                valueDisplay:
                    '${state.sleepDurationHours.toStringAsFixed(1).replaceAll('.', ',')} jam',
                currentValue: state.sleepDurationHours,
                min: 4,
                max: 12,
                divisions: 16,
                minLabel: '4 jam',
                baselineLabel: 'Anjuran dewasa: 7 jam atau lebih',
                maxLabel: '12 jam',
                onChanged: (val) => controller.setSleepDuration(val),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Status Merokok (Figma node 77:657)
        const Text(
          'Status merokok',
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 14.0,
            fontWeight: FontWeight.w500,
            height: 20.0 / 14.0,
            color: HelioraTokens.foreground,
          ),
        ),
        const SizedBox(height: 8),
        Column(
          children: [
            SizedBox(
              width: double.infinity,
              child: ChoiceOption<SmokingStatusEnum>(
                value: SmokingStatusEnum.never,
                groupValue: state.smokingStatus,
                label: 'Tidak pernah',
                onChanged: (val) => controller.setSmokingStatus(val),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ChoiceOption<SmokingStatusEnum>(
                value: SmokingStatusEnum.former,
                groupValue: state.smokingStatus,
                label: 'Mantan perokok',
                onChanged: (val) => controller.setSmokingStatus(val),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ChoiceOption<SmokingStatusEnum>(
                value: SmokingStatusEnum.current,
                groupValue: state.smokingStatus,
                label: 'Perokok aktif',
                onChanged: (val) => controller.setSmokingStatus(val),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Action Buttons: Lanjut & Kembali (Figma node 77:668)
        SizedBox(
          height: 48,
          child: ElevatedButton(
            onPressed: () => controller.goToNextStep(),
            style: _primaryButtonStyle(),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Lanjut', style: HelioraTokens.labelButton),
                SizedBox(width: 8),
                HelioraIcon(HelioraIcons.arrowRight, size: 20, color: Colors.white),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 48,
          child: OutlinedButton(
            onPressed: () => controller.goToPreviousStep(),
            style: _secondaryButtonStyle(),
            child: const Text('Kembali', style: HelioraTokens.labelButtonSecondary),
          ),
        ),
      ],
    );
  }

  // ==========================================
  // STEP 3: RIWAYAT KELUARGA & STRES (Figma node 77:692)
  // ==========================================
  Widget _buildStep3(AssessmentFlowState state, AssessmentController controller) {
    final hasNoFamily = !state.hasAnyFamilyHistory;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Riwayat Penyakit Keluarga (Figma node 77:706)
        const Text(
          'Riwayat penyakit keluarga',
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 14.0,
            fontWeight: FontWeight.w500,
            height: 20.0 / 14.0,
            color: HelioraTokens.foreground,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: HelioraTokens.border, width: 1.0),
            borderRadius: BorderRadius.circular(16.0),
          ),
          child: Column(
            children: [
              _buildFigmaCheckbox(
                label: 'Tidak ada',
                isChecked: hasNoFamily,
                onChanged: (checked) {
                  if (checked) {
                    controller.setDiabetesFamily(false);
                    controller.setHypertensionFamily(false);
                    controller.setCvdFamily(false);
                    controller.setOtherFamily(false);
                  }
                },
              ),
              const SizedBox(height: 12),
              _buildFigmaCheckbox(
                label: 'Diabetes',
                isChecked: state.hasDiabetesFamily,
                onChanged: (checked) => controller.setDiabetesFamily(checked),
              ),
              const SizedBox(height: 12),
              _buildFigmaCheckbox(
                label: 'Hipertensi',
                isChecked: state.hasHypertensionFamily,
                onChanged: (checked) => controller.setHypertensionFamily(checked),
              ),
              const SizedBox(height: 12),
              _buildFigmaCheckbox(
                label: 'Penyakit jantung',
                isChecked: state.hasCvdFamily,
                onChanged: (checked) => controller.setCvdFamily(checked),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Detail Riwayat Textarea (Figma node 77:723)
        const Text(
          'Detail riwayat keluarga (opsional)',
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 14.0,
            fontWeight: FontWeight.w500,
            height: 20.0 / 14.0,
            color: HelioraTokens.foreground,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _notesController,
          maxLines: 3,
          minLines: 3,
          style: const TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 14.0,
            color: HelioraTokens.foreground,
          ),
          decoration: _inputDecoration(
            hintText: 'Contoh: ayah terdiagnosis diabetes tipe 2 pada usia 50 tahun.',
          ).copyWith(
            hintStyle: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 14.0,
              color: HelioraTokens.slate400,
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
          onChanged: (val) => controller.setFamilyNotes(val),
        ),
        const SizedBox(height: 16),

        // Stres Card (Figma node 77:727)
        Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: HelioraTokens.border, width: 1.0),
            borderRadius: BorderRadius.circular(16.0),
          ),
          child: _buildSliderSection(
            label: 'Tingkat stres harian (opsional)',
            valueDisplay: '${state.stressLevel} dari 10',
            currentValue: state.stressLevel.toDouble(),
            min: 1,
            max: 10,
            divisions: 9,
            minLabel: '1',
            baselineLabel: 'Perkiraan Anda sendiri',
            maxLabel: '10',
            onChanged: (val) => controller.setStressLevel(val.toInt()),
          ),
        ),
        const SizedBox(height: 24),

        // Action Buttons: Simpan & Kembali (Figma node 77:740)
        SizedBox(
          height: 48,
          child: ElevatedButton(
            onPressed: () => controller.submitAndRunAssessment(),
            style: _primaryButtonStyle(),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  child: Text(
                    'Simpan dan jalankan asesmen',
                    style: HelioraTokens.labelButton,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                SizedBox(width: 8),
                HelioraIcon(HelioraIcons.arrowRight, size: 20, color: Colors.white),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 48,
          child: OutlinedButton(
            onPressed: () => controller.goToPreviousStep(),
            style: _secondaryButtonStyle(),
            child: const Text('Kembali', style: HelioraTokens.labelButtonSecondary),
          ),
        ),
      ],
    );
  }

  // ==========================================
  // HELPER WIDGETS
  // ==========================================
  Widget _buildSliderSection({
    required String label,
    required String valueDisplay,
    required double currentValue,
    required double min,
    required double max,
    required int divisions,
    required String minLabel,
    required String baselineLabel,
    required String maxLabel,
    required ValueChanged<double> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 14.0,
                  fontWeight: FontWeight.w500,
                  height: 20.0 / 14.0,
                  color: HelioraTokens.foreground,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              valueDisplay,
              style: const TextStyle(
                fontFamily: 'JetBrains Mono',
                fontSize: 14.0,
                fontWeight: FontWeight.w500,
                height: 20.0 / 14.0,
                color: HelioraTokens.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: HelioraTokens.primary,
            inactiveTrackColor: HelioraTokens.border,
            thumbColor: HelioraTokens.primary,
            overlayColor: HelioraTokens.primary.withValues(alpha: 0.12),
            trackHeight: 6.0,
            thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10.0),
          ),
          child: Slider(
            value: currentValue.clamp(min, max),
            min: min,
            max: max,
            divisions: divisions,
            onChanged: onChanged,
          ),
        ),
        const SizedBox(height: 2),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              minLabel,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 12.0,
                fontWeight: FontWeight.w400,
                color: HelioraTokens.mutedForeground,
              ),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: Text(
                baselineLabel,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 12.0,
                  fontWeight: FontWeight.w400,
                  color: HelioraTokens.mutedForeground,
                ),
              ),
            ),
            const SizedBox(width: 4),
            Text(
              maxLabel,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 12.0,
                fontWeight: FontWeight.w400,
                color: HelioraTokens.mutedForeground,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFigmaCheckbox({
    required String label,
    required bool isChecked,
    required ValueChanged<bool> onChanged,
  }) {
    return InkWell(
      onTap: () => onChanged(!isChecked),
      borderRadius: BorderRadius.circular(6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: isChecked ? HelioraTokens.primary : Colors.white,
              border: Border.all(
                color: isChecked ? HelioraTokens.primary : HelioraTokens.border,
                width: 1.5,
              ),
              borderRadius: BorderRadius.circular(6.0),
            ),
            child: isChecked
                ? const Center(
                    child: HelioraIcon(
                      HelioraIcons.check,
                      size: 14,
                      color: Colors.white,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 14.0,
                fontWeight: FontWeight.w400,
                height: 20.0 / 14.0,
                color: HelioraTokens.foreground,
              ),
            ),
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDecoration({required String hintText}) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: const TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 16.0,
        color: HelioraTokens.slate400,
      ),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.0),
        borderSide: const BorderSide(color: HelioraTokens.border, width: 1.0),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.0),
        borderSide: const BorderSide(color: HelioraTokens.border, width: 1.0),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.0),
        borderSide: const BorderSide(color: HelioraTokens.primary, width: 2.0),
      ),
    );
  }

  ButtonStyle _primaryButtonStyle() {
    return ElevatedButton.styleFrom(
      backgroundColor: HelioraTokens.primary,
      foregroundColor: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
      disabledBackgroundColor: HelioraTokens.primary.withValues(alpha: 0.5),
      disabledForegroundColor: Colors.white.withValues(alpha: 0.8),
    );
  }

  ButtonStyle _secondaryButtonStyle() {
    return OutlinedButton.styleFrom(
      backgroundColor: Colors.white,
      foregroundColor: HelioraTokens.foreground,
      elevation: 0,
      side: const BorderSide(color: HelioraTokens.border, width: 1.0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
    );
  }
}

// ==========================================
// LOADING STATE: PROSES ASESMEN (Node 77:760)
// ==========================================
class _ProcessingAssessmentView extends StatelessWidget {
  const _ProcessingAssessmentView({required this.status});

  final AssessmentFlowStatus status;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HelioraTokens.muted,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo Emblem (Node 14:11)
                  const HelioraLogo(size: 48),
                  const SizedBox(height: 24),

                  // Title & Subtitle (Node 77:771)
                  const Text(
                    'Menghitung estimasi risiko Anda',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 24.0,
                      fontWeight: FontWeight.w700,
                      height: 32.0 / 24.0,
                      letterSpacing: -0.24,
                      color: HelioraTokens.foreground,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Biasanya selesai dalam beberapa detik. Tetap buka aplikasi.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 16.0,
                      fontWeight: FontWeight.w400,
                      height: 24.0 / 16.0,
                      color: HelioraTokens.mutedForeground,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Tahapan Card (Node 77:774)
                  Container(
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: HelioraTokens.border, width: 1.0),
                      borderRadius: BorderRadius.circular(16.0),
                    ),
                    child: Column(
                      children: [
                        // Milestone 1
                        _milestoneRow(
                          iconPath: HelioraIcons.circleCheck,
                          iconColor: HelioraTokens.primary,
                          label: 'Profil kesehatan tersimpan',
                          isBold: false,
                          textColor: HelioraTokens.foreground,
                        ),
                        const SizedBox(height: 16),

                        // Milestone 2
                        _milestoneRow(
                          iconPath: HelioraIcons.activity,
                          iconColor: HelioraTokens.primary,
                          label: 'Menghitung estimasi risiko',
                          isBold: true,
                          textColor: HelioraTokens.primary,
                        ),
                        const SizedBox(height: 16),

                        // Milestone 3
                        _milestoneRow(
                          iconPath: HelioraIcons.clipboardList,
                          iconColor: HelioraTokens.mutedForeground,
                          label: 'Menyiapkan hasil',
                          isBold: false,
                          textColor: HelioraTokens.mutedForeground,
                        ),
                        const SizedBox(height: 16),

                        // Progress Bar (Node 20:508)
                        Container(
                          height: 8.0,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: HelioraTokens.border,
                            borderRadius: BorderRadius.circular(9999.0),
                          ),
                          child: FractionallySizedBox(
                            alignment: Alignment.centerLeft,
                            widthFactor: 0.6,
                            child: Container(
                              decoration: BoxDecoration(
                                color: HelioraTokens.primary,
                                borderRadius: BorderRadius.circular(9999.0),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Footnote (Node 77:795)
                  const Text(
                    'Tidak ada skor yang tampil sebelum analisis selesai.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 12.0,
                      fontWeight: FontWeight.w400,
                      height: 16.0 / 12.0,
                      color: HelioraTokens.mutedForeground,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _milestoneRow({
    required String iconPath,
    required Color iconColor,
    required String label,
    required bool isBold,
    required Color textColor,
  }) {
    return Row(
      children: [
        HelioraIcon(iconPath, size: 20, color: iconColor),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: isBold ? 14.0 : 16.0,
              fontWeight: isBold ? FontWeight.w500 : FontWeight.w400,
              color: textColor,
            ),
          ),
        ),
      ],
    );
  }
}

// ==========================================
// FAILURE STATE: ANALISIS GAGAL (Node 77:799)
// ==========================================
class _AssessmentFailureView extends StatelessWidget {
  const _AssessmentFailureView({
    required this.errorMessage,
    required this.onRetry,
    required this.onBackToForm,
  });

  final String? errorMessage;
  final VoidCallback onRetry;
  final VoidCallback onBackToForm;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HelioraTokens.muted,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Icon Tile (Node 71:125)
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: HelioraTokens.rose50,
                      border: Border.all(color: HelioraTokens.rose700, width: 1.0),
                      borderRadius: BorderRadius.circular(16.0),
                    ),
                    child: const Center(
                      child: HelioraIcon(
                        HelioraIcons.triangleAlert,
                        size: 28,
                        color: HelioraTokens.rose700,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Headline (Node 71:130)
                  const Text(
                    'Analisis sedang tidak tersedia, coba lagi',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 20.0,
                      fontWeight: FontWeight.w600,
                      height: 28.0 / 20.0,
                      letterSpacing: -0.1,
                      color: HelioraTokens.foreground,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Subtext (Node 71:131)
                  const Text(
                    'Profil Anda sudah tersimpan. Skor tidak ditampilkan sampai analisis berhasil.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 16.0,
                      fontWeight: FontWeight.w400,
                      height: 24.0 / 16.0,
                      color: HelioraTokens.mutedForeground,
                    ),
                  ),
                  if (errorMessage != null &&
                      errorMessage!.isNotEmpty &&
                      errorMessage !=
                          'Profil Anda sudah tersimpan. Skor tidak ditampilkan sampai analisis berhasil.') ...[
                    const SizedBox(height: 8),
                    Text(
                      errorMessage!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 13.0,
                        fontWeight: FontWeight.w400,
                        color: HelioraTokens.secondaryForeground,
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),

                  // Actions: Coba lagi & Kembali ke profil (Node 71:132)
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: onRetry,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: HelioraTokens.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                      ),
                      child: const Text('Coba lagi', style: HelioraTokens.labelButton),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: OutlinedButton(
                      onPressed: onBackToForm,
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: HelioraTokens.foreground,
                        side: const BorderSide(color: HelioraTokens.border, width: 1.0),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                      ),
                      child: const Text(
                        'Kembali ke profil',
                        style: HelioraTokens.labelButtonSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
