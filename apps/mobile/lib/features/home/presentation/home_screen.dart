import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/generated/export.dart';
import '../../../theme/components.dart';
import '../../../theme/tokens.dart';
import '../../assessment/data/assessment_repository.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../consent/presentation/consent_controller.dart';
import 'widgets/bottom_nav_bar.dart';
import 'widgets/risk_card.dart';
import 'widgets/score_card.dart';
import 'widgets/simulation_banner.dart';
import 'widgets/statutory_disclaimer_card.dart';

/// Screen presenting the user's latest health assessment, risk estimation cards,
/// statutory disclaimer, empty state ("Mulai Asesmen"), and neutral state if consent was revoked.
/// Matches Figma Alur 3 nodes 79:629, 79:872, 79:964.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({
    super.key,
    this.onStartAssessment,
    this.onReconsent,
    this.onOpenSimulation,
    this.onOpenProfile,
  });

  /// Callback when user taps "Mulai Asesmen" in empty state.
  final VoidCallback? onStartAssessment;

  /// Callback when user taps "Beri Persetujuan Kembali" in neutral revoked state.
  final VoidCallback? onReconsent;

  /// Callback when user opens simulation tab.
  final VoidCallback? onOpenSimulation;

  /// Callback when user opens profile tab.
  final VoidCallback? onOpenProfile;

  String _formatDate(String isoString) {
    final parsed = DateTime.tryParse(isoString);
    if (parsed == null) return isoString;

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    return '${parsed.day} ${months[parsed.month - 1]} ${parsed.year}';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final consentStatusAsync = ref.watch(consentStatusProvider);
    final latestAssessmentAsync = ref.watch(latestAssessmentProvider);

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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const HelioraLogo(size: 28),
                      const SizedBox(width: 8),
                      Text(
                        'HELIORA',
                        style: HelioraTokens.mobileHeadline.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      IconButton(
                        tooltip: 'Muat ulang',
                        icon: const HelioraIcon(
                          HelioraIcons.activity,
                          size: 18,
                          color: HelioraTokens.secondaryForeground,
                        ),
                        onPressed: () {
                          ref.invalidate(latestAssessmentProvider);
                          ref.invalidate(consentStatusProvider);
                        },
                      ),
                      IconButton(
                        tooltip: 'Keluar',
                        icon: const HelioraIcon(
                          HelioraIcons.logOut,
                          size: 18,
                          color: HelioraTokens.secondaryForeground,
                        ),
                        onPressed: () {
                          ref.read(authControllerProvider.notifier).signOut();
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: SafeArea(
        child: consentStatusAsync.when(
          data: (consentStatus) {
            // State 3: Neutral state if consent is revoked (Figma node 79:964)
            if (!consentStatus.hasActiveConsent) {
              return _buildRevokedNeutralState(context);
            }

            return latestAssessmentAsync.when(
              data: (assessment) {
                // State 2: Empty state if no assessment exists yet (Figma node 79:872)
                if (assessment == null) {
                  return _buildEmptyAssessmentState(context);
                }

                // State 1: Normal state with full assessment data (Figma node 79:629)
                return _buildNormalAssessmentState(context, assessment);
              },
              loading: () => const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation(HelioraTokens.primary),
                ),
              ),
              error: (err, _) => _buildAssessmentErrorState(context, ref, err),
            );
          },
          loading: () => const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation(HelioraTokens.primary),
            ),
          ),
          error: (_, _) => _buildRevokedNeutralState(context),
        ),
      ),
      bottomNavigationBar: HelioraBottomNav(
        currentIndex: 0,
        onTap: (index) {
          if (index == 1) {
            onOpenSimulation?.call();
          } else if (index == 2) {
            onOpenProfile?.call();
          }
        },
      ),
    );
  }

  /// State 1: Normal assessment overview with scores, 3 risk cards, and simulation CTA.
  Widget _buildNormalAssessmentState(
    BuildContext context,
    AssessmentSummaryResponse assessment,
  ) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Last assessment date banner
              Text(
                'ASESMEN TERAKHIR: ${_formatDate(assessment.assessedAt).toUpperCase()}',
                style: HelioraTokens.monoEyebrow.copyWith(
                  fontSize: 11,
                  color: HelioraTokens.secondaryForeground,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 12),

              // Scores row: Health Score and Lifestyle Score side by side
              Row(
                children: [
                  Expanded(
                    child: ScoreCard(
                      title: 'Health Score',
                      score: assessment.healthScore,
                      isHealthScore: true,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ScoreCard(
                      title: 'Lifestyle Score',
                      score: assessment.lifestyleScore,
                      isHealthScore: false,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Section Eyebrow: Strictly pure editorial typography, NO PILL CHIPS!
              Text(
                'ESTIMASI RISIKO 10 TAHUN',
                style: HelioraTokens.monoEyebrow.copyWith(
                  fontSize: 11,
                  color: HelioraTokens.brand900.withValues(alpha: 0.7),
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 12),

              // 3 Chronic condition risk estimation cards
              if (assessment.risks.isNotEmpty) ...[
                for (final risk in assessment.risks) ...[
                  RiskCard(item: risk),
                  const SizedBox(height: 12),
                ],
              ] else ...[
                // Honest empty state when risks list is empty (strictly no fake scores)
                Container(
                  padding: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: HelioraTokens.border, width: 1.0),
                    borderRadius: BorderRadius.circular(16.0),
                  ),
                  child: const Text(
                    'Belum ada rincian kondisi risiko yang tercatat pada asesmen ini.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 13,
                      color: HelioraTokens.mutedForeground,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
              ],
              const SizedBox(height: 12),

              // What-if Simulation banner
              SimulationBanner(
                onTapSimulation: () {
                  onOpenSimulation?.call();
                },
              ),
              const SizedBox(height: 20),

              // Statutory disclaimer card
              const StatutoryDisclaimerCard(),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  /// State 2: Empty state for user with no prior assessment (Figma node 79:872).
  Widget _buildEmptyAssessmentState(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Mobile/StateBlock Tone=Neutral (Node 71:92)
              Container(
                padding: const EdgeInsets.all(24.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: HelioraTokens.border, width: 1.0),
                  borderRadius: BorderRadius.circular(16.0),
                ),
                child: Column(
                  children: [
                    // Icon Tile
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: HelioraTokens.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(16.0),
                      ),
                      child: const Center(
                        child: HelioraIcon(
                          HelioraIcons.clipboardList,
                          size: 30,
                          color: HelioraTokens.primary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Title
                    const Text(
                      'Belum Ada Asesmen',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.3,
                        color: HelioraTokens.foreground,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Body
                    const Text(
                      'Lengkapi profil gaya hidup dan kesehatan Anda untuk mendapatkan skor kesehatan dan estimasi risiko preventif.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        height: 1.5,
                        color: HelioraTokens.mutedForeground,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Action CTA Button
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: onStartAssessment,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: HelioraTokens.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          ),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('Mulai Asesmen', style: HelioraTokens.labelButton),
                            SizedBox(width: 8),
                            HelioraIcon(
                              HelioraIcons.arrowRight,
                              size: 18,
                              color: Colors.white,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Statutory disclaimer
              const StatutoryDisclaimerCard(),
            ],
          ),
        ),
      ),
    );
  }

  /// State 3: Neutral state when data consent is revoked (Figma node 79:964).
  Widget _buildRevokedNeutralState(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Mobile/StateBlock Tone=Neutral (Node 71:92)
              Container(
                padding: const EdgeInsets.all(24.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: HelioraTokens.border, width: 1.0),
                  borderRadius: BorderRadius.circular(16.0),
                ),
                child: Column(
                  children: [
                    // Icon Tile
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(16.0),
                      ),
                      child: const Center(
                        child: HelioraIcon(
                          HelioraIcons.shieldCheck,
                          size: 30,
                          color: HelioraTokens.secondaryForeground,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Title
                    const Text(
                      'Analisis Dihentikan',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.3,
                        color: HelioraTokens.foreground,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Body
                    const Text(
                      'Analisis dihentikan sesuai permintaanmu. Data Anda tidak lagi diproses untuk kalkulasi estimasi risiko preventif.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        height: 1.5,
                        color: HelioraTokens.mutedForeground,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Action CTA Button: Beri persetujuan kembali
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: onReconsent,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: HelioraTokens.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          ),
                        ),
                        child: const Text(
                          'Beri Persetujuan Kembali',
                          style: HelioraTokens.labelButton,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Statutory disclaimer
              const StatutoryDisclaimerCard(),
            ],
          ),
        ),
      ),
    );
  }

  /// State 4: Error state when assessment data cannot be loaded (PRD-Mobile.md MFR-007, MFR-011).
  Widget _buildAssessmentErrorState(
    BuildContext context,
    WidgetRef ref,
    Object error,
  ) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(24.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: HelioraTokens.border, width: 1.0),
                  borderRadius: BorderRadius.circular(16.0),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(16.0),
                      ),
                      child: const Center(
                        child: HelioraIcon(
                          HelioraIcons.triangleAlert,
                          size: 30,
                          color: HelioraTokens.rose700,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Analisis Sedang Tidak Tersedia',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.3,
                        color: HelioraTokens.foreground,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Analisis sedang tidak tersedia, coba lagi. Heliora tidak pernah menampilkan estimasi atau skor rekaan saat sistem sedang mengalami kendala.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        height: 1.5,
                        color: HelioraTokens.mutedForeground,
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () {
                          ref.invalidate(latestAssessmentProvider);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: HelioraTokens.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          ),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            HelioraIcon(
                              HelioraIcons.activity,
                              size: 18,
                              color: Colors.white,
                            ),
                            SizedBox(width: 8),
                            Text('Muat Ulang', style: HelioraTokens.labelButton),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const StatutoryDisclaimerCard(),
            ],
          ),
        ),
      ),
    );
  }
}
