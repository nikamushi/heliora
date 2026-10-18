import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/generated/export.dart';
import '../../../theme/components.dart';
import '../../../theme/tokens.dart';
import '../../assessment/presentation/widgets/choice_option.dart';
import '../../home/presentation/widgets/bottom_nav_bar.dart';
import '../../home/presentation/widgets/statutory_disclaimer_card.dart';
import 'simulation_controller.dart';
import 'widgets/delta_row.dart';
import 'widgets/lifestyle_slider.dart';

/// Screen for interactive What-If lifestyle scenario simulation (Figma Alur 3 nodes 81:825 & 81:1038).
/// Allows exploring lifestyle adjustments without modifying baseline profile in the database (BR-SIM-007).
class SimulationScreen extends ConsumerWidget {
  const SimulationScreen({
    super.key,
    this.onNavigateHome,
    this.onNavigateProfile,
  });

  /// Navigation callback to Home (tab 0).
  final VoidCallback? onNavigateHome;

  /// Navigation callback to Profile (tab 2).
  final VoidCallback? onNavigateProfile;

  String _smokingLabel(SmokingStatusEnum status) {
    switch (status) {
      case SmokingStatusEnum.never:
        return 'Tidak pernah';
      case SmokingStatusEnum.former:
        return 'Mantan perokok';
      case SmokingStatusEnum.current:
        return 'Perokok aktif';
      case SmokingStatusEnum.$unknown:
        return 'Lainnya';
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(simulationControllerProvider);
    final controller = ref.read(simulationControllerProvider.notifier);
    final isLoading = state.status == SimulationStatus.loading;

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F8),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(56),
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(
              bottom: BorderSide(color: HelioraTokens.border, width: 1.0),
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: [
                  IconButton(
                    tooltip: 'Kembali',
                    icon: const HelioraIcon(
                      HelioraIcons.layoutDashboard,
                      size: 20,
                      color: HelioraTokens.secondaryForeground,
                    ),
                    onPressed: onNavigateHome,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Simulasi Gaya Hidup',
                    style: HelioraTokens.mobileHeadline.copyWith(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Intro Note (Node 81:831)
                  Text(
                    'Eksplorasi bagaimana perubahan kebiasaan sehari-hari memengaruhi arah estimasi risiko preventif Anda secara langsung, tanpa mengubah data profil medis asli.',
                    style: HelioraTokens.bodySmall.copyWith(
                      color: HelioraTokens.mutedForeground,
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Section 1: Ubah Kebiasaan Card (Node 81:832)
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
                        Text(
                          'UBAH KEBIASAAN',
                          style: HelioraTokens.monoEyebrow.copyWith(
                            fontSize: 11,
                            color: HelioraTokens.brand900.withValues(alpha: 0.7),
                            letterSpacing: 1.5,
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Slider 1: Durasi Tidur
                        LifestyleSlider(
                          label: 'Durasi tidur harian',
                          valueDisplay: '${state.simulatedSleepDurationHours.toStringAsFixed(1)} jam',
                          baselineText: 'Baseline: ${state.baselineSleepDurationHours.toStringAsFixed(1)} jam',
                          value: state.simulatedSleepDurationHours,
                          min: 4.0,
                          max: 12.0,
                          divisions: 16,
                          unit: 'j',
                          onChanged: controller.setSleepDuration,
                        ),
                        const SizedBox(height: 12),

                        // Slider 2: Aktivitas Fisik
                        LifestyleSlider(
                          label: 'Aktivitas fisik mingguan',
                          valueDisplay: '${state.simulatedPhysicalActivityMin.toInt()} mnt/mg',
                          baselineText: 'Baseline: ${state.baselinePhysicalActivityMin.toInt()} mnt',
                          value: state.simulatedPhysicalActivityMin,
                          min: 0.0,
                          max: 600.0,
                          divisions: 60,
                          unit: 'm',
                          onChanged: controller.setPhysicalActivity,
                        ),
                        const SizedBox(height: 12),

                        // Slider 3: Berat Badan
                        LifestyleSlider(
                          label: 'Berat badan',
                          valueDisplay: '${state.simulatedWeightKg.toStringAsFixed(1)} kg',
                          baselineText: 'Baseline: ${state.baselineWeightKg.toStringAsFixed(1)} kg',
                          value: state.simulatedWeightKg,
                          min: 40.0,
                          max: 150.0,
                          divisions: 110,
                          unit: 'kg',
                          onChanged: controller.setWeight,
                        ),
                        const SizedBox(height: 14),

                        // Choice Group: Status Merokok
                        Text(
                          'Status merokok',
                          style: HelioraTokens.labelDefault.copyWith(fontSize: 13),
                        ),
                        const SizedBox(height: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            ChoiceOption<SmokingStatusEnum>(
                              value: SmokingStatusEnum.never,
                              groupValue: state.simulatedSmokingStatus,
                              label: 'Tidak pernah merokok',
                              onChanged: controller.setSmokingStatus,
                            ),
                            const SizedBox(height: 8),
                            ChoiceOption<SmokingStatusEnum>(
                              value: SmokingStatusEnum.former,
                              groupValue: state.simulatedSmokingStatus,
                              label: 'Mantan perokok (sudah berhenti)',
                              onChanged: controller.setSmokingStatus,
                            ),
                            const SizedBox(height: 8),
                            ChoiceOption<SmokingStatusEnum>(
                              value: SmokingStatusEnum.current,
                              groupValue: state.simulatedSmokingStatus,
                              label: 'Perokok aktif saat ini',
                              onChanged: controller.setSmokingStatus,
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Baseline: ${_smokingLabel(state.baselineSmokingStatus)}',
                          style: HelioraTokens.caption.copyWith(
                            color: HelioraTokens.secondaryForeground,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Actions: Atur Ulang & Jalankan Simulasi
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: SizedBox(
                          height: 48,
                          child: OutlinedButton(
                            onPressed: isLoading ? null : controller.resetToBaseline,
                            style: OutlinedButton.styleFrom(
                              foregroundColor: HelioraTokens.foreground,
                              padding: const EdgeInsets.symmetric(horizontal: 12.0),
                              side: const BorderSide(color: HelioraTokens.border, width: 1.0),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                              ),
                            ),
                            child: const Text(
                              'Atur ulang',
                              maxLines: 1,
                              softWrap: false,
                              style: HelioraTokens.labelButtonSecondary,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 3,
                        child: SizedBox(
                          height: 48,
                          child: ElevatedButton(
                            onPressed: isLoading ? null : controller.runSimulation,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: HelioraTokens.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12.0),
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                              ),
                            ),
                            child: isLoading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation(Colors.white),
                                    ),
                                  )
                                : const Text(
                                    'Jalankan simulasi',
                                    maxLines: 1,
                                    softWrap: false,
                                    style: HelioraTokens.labelButton,
                                  ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Section 2: Hasil Proyeksi Simulasi Card (Node 81:837 / 81:1038)
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
                        Text(
                          'PROYEKSI ESTIMASI RISIKO',
                          style: HelioraTokens.monoEyebrow.copyWith(
                            fontSize: 11,
                            color: HelioraTokens.brand900.withValues(alpha: 0.7),
                            letterSpacing: 1.5,
                          ),
                        ),
                        const SizedBox(height: 12),

                        if (state.status == SimulationStatus.loading) ...[
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 24.0),
                            child: Center(
                              child: Column(
                                children: [
                                  CircularProgressIndicator(
                                    valueColor: AlwaysStoppedAnimation(HelioraTokens.primary),
                                  ),
                                  SizedBox(height: 12),
                                  Text(
                                    'Menghitung proyeksi risiko...',
                                    style: HelioraTokens.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ] else if (state.status == SimulationStatus.failure) ...[
                          // Error Alert box & Retry button (Figma node 81:1113)
                          InlineAlert(
                            message: state.errorMessage ?? 'Simulasi sedang tidak tersedia.',
                            type: InlineAlertType.error,
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            height: 44,
                            child: OutlinedButton(
                              onPressed: controller.runSimulation,
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: HelioraTokens.border, width: 1.0),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                                ),
                              ),
                              child: const Text('Coba lagi', style: HelioraTokens.labelButtonSecondary),
                            ),
                          ),
                        ] else if (state.status == SimulationStatus.success &&
                            state.simulationResult != null) ...[
                          // Comparative Score Deltas Summary
                          _buildScoreDeltaSummary(state.simulationResult!),
                          const SizedBox(height: 14),

                          // Condition Comparison Rows
                          if (state.simulationResult!.conditionComparisons.isNotEmpty) ...[
                            for (final comparison in state.simulationResult!.conditionComparisons)
                              DeltaRow(comparison: comparison),
                          ] else ...[
                            const Text(
                              'Tidak ada perubahan risiko terdeteksi pada skenario ini.',
                              style: HelioraTokens.bodySmall,
                            ),
                          ],
                          const SizedBox(height: 14),

                          // Model Note (Node 81:842)
                          Text(
                            'Hasil di atas adalah proyeksi berbasis model, bukan jaminan klinis.',
                            style: HelioraTokens.caption.copyWith(
                              color: HelioraTokens.secondaryForeground,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ] else ...[
                          // Initial state prompt
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 16.0),
                            child: Text(
                              'Sesuaikan slider kebiasaan di atas, lalu ketuk "Jalankan simulasi" untuk melihat perbandingan risiko.',
                              style: HelioraTokens.bodySmall.copyWith(
                                color: HelioraTokens.mutedForeground,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Statutory Disclaimer
                  const StatutoryDisclaimerCard(),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: HelioraBottomNav(
        currentIndex: 1,
        onTap: (index) {
          if (index == 0) {
            onNavigateHome?.call();
          } else if (index == 2) {
            onNavigateProfile?.call();
          }
        },
      ),
    );
  }

  Widget _buildScoreDeltaSummary(WhatIfSimulationResponse result) {
    return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAF9),
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: HelioraTokens.border, width: 1.0),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildScoreColumn(
            label: 'Health Score',
            simulated: result.simulatedHealthScore,
            delta: result.healthScoreDelta,
          ),
          Container(
            width: 1,
            height: 36,
            color: HelioraTokens.border,
          ),
          _buildScoreColumn(
            label: 'Lifestyle Score',
            simulated: result.simulatedLifestyleScore,
            delta: result.lifestyleScoreDelta,
          ),
        ],
      ),
    );
  }

  Widget _buildScoreColumn({
    required String label,
    required num simulated,
    required num delta,
  }) {
    final double deltaVal = (delta * 10).round() / 10;
    Color deltaColor = HelioraTokens.secondaryForeground;
    String deltaText = '0';
    if (deltaVal > 0) {
      deltaColor = HelioraTokens.primary;
      deltaText = '+${deltaVal % 1 == 0 ? deltaVal.toInt() : deltaVal.toStringAsFixed(1)}';
    } else if (deltaVal < 0) {
      deltaColor = HelioraTokens.rose700;
      deltaText = '${deltaVal % 1 == 0 ? deltaVal.toInt() : deltaVal.toStringAsFixed(1)}';
    }

    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: HelioraTokens.secondaryForeground,
          ),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(
              '${simulated.round()}',
              style: const TextStyle(
                fontFamily: 'JetBrains Mono',
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: HelioraTokens.foreground,
              ),
            ),
            const SizedBox(width: 4),
            Text(
              '($deltaText)',
              style: TextStyle(
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: deltaColor,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
