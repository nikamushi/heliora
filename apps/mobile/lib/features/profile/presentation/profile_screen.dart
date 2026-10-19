import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/generated/export.dart';
import '../../../theme/icons.dart';
import '../../../theme/tokens.dart';
import '../../assessment/data/assessment_repository.dart';
import '../../assessment/data/health_profile_repository.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../consent/presentation/consent_controller.dart';
import '../../home/presentation/widgets/bottom_nav_bar.dart';
import '../../../theme/widgets/heliora_confirmation_dialog.dart';

/// Screen managing user profile, health profile summary, and privacy consent revocation (MFR-010, BR-CONSENT-003).
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({
    super.key,
    this.onNavigateHome,
    this.onNavigateSimulation,
    this.onEditHealthProfile,
    this.onConsentRevoked,
  });

  /// Navigation callbacks for 3-tab mobile shell.
  final VoidCallback? onNavigateHome;
  final VoidCallback? onNavigateSimulation;
  final VoidCallback? onEditHealthProfile;
  final VoidCallback? onConsentRevoked;

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isRevoking = false;

  String _formatDate(DateTime dt) {
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    final local = dt.toLocal();
    final hour = local.hour.toString().padLeft(2, '0');
    final minute = local.minute.toString().padLeft(2, '0');
    return '${local.day} ${months[local.month - 1]} ${local.year}, $hour:$minute WIB';
  }

  String _smokingLabel(String? status) {
    switch (status) {
      case 'never':
        return 'Tidak pernah merokok';
      case 'former':
        return 'Mantan perokok (sudah berhenti)';
      case 'current':
        return 'Perokok aktif saat ini';
      default:
        return 'Tidak ditentukan';
    }
  }

  String _bmiCategory(double bmi) {
    if (bmi < 18.5) return 'Berat Rendah';
    if (bmi < 25.0) return 'Normal / Sehat';
    if (bmi < 30.0) return 'Kelebihan Berat';
    return 'Obesitas';
  }

  void _showConsentRequiredForEditDialog() {
    showDialog<void>(
      context: context,
      builder: (dialogCtx) => HelioraConfirmationDialog(
        title: 'Persetujuan Diperlukan',
        content:
            'Persetujuan pemrosesan data kesehatan diperlukan untuk memperbarui profil dan menganalisis risiko kesehatan Anda. Silakan berikan persetujuan kembali melalui portal web HELIORA.',
        cancelLabel: 'Mengerti',
        onCancel: () => Navigator.of(dialogCtx).pop(),
      ),
    );
  }

  Future<void> _handleRevokeConsent() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogCtx) => HelioraConfirmationDialog(
        title: 'Cabut persetujuan?',
        content:
            'HELIORA akan berhenti memproses data kesehatan Anda. Hasil asesmen tidak tampil sampai Anda memberi persetujuan lagi. Anda bisa melakukannya kapan saja.',
        confirmLabel: 'Cabut persetujuan',
        cancelLabel: 'Batal',
        isDestructive: true,
        onConfirm: () => Navigator.of(dialogCtx).pop(true),
        onCancel: () => Navigator.of(dialogCtx).pop(false),
      ),
    );

    if (confirmed == true && mounted) {
      setState(() => _isRevoking = true);
      final success =
          await ref.read(consentControllerProvider.notifier).revokeConsent();

      // Clear cached risk assessment and health profile in memory
      ref.invalidate(latestAssessmentProvider);
      ref.invalidate(healthProfileProvider);

      if (!mounted) return;
      setState(() => _isRevoking = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Persetujuan data medis berhasil dicabut.'),
            backgroundColor: HelioraTokens.foreground,
          ),
        );
        widget.onConsentRevoked?.call();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Gagal mencabut persetujuan. Silakan coba lagi.'),
            backgroundColor: HelioraTokens.rose700,
          ),
        );
      }
    }
  }

  Future<void> _handleSignOut() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogCtx) => HelioraConfirmationDialog(
        title: 'Keluar dari Heliora?',
        content:
            'Seluruh sesi dan token pada perangkat ini akan dihapus dengan aman.',
        confirmLabel: 'Keluar',
        cancelLabel: 'Batal',
        isDestructive: true,
        onConfirm: () => Navigator.of(dialogCtx).pop(true),
        onCancel: () => Navigator.of(dialogCtx).pop(false),
      ),
    );

    if (confirmed == true && mounted) {
      await ref.read(authControllerProvider.notifier).signOut();
    }
  }

  @override
  Widget build(BuildContext context) {
    final userProfileAsync = ref.watch(currentUserProfileProvider);
    final healthProfileAsync = ref.watch(healthProfileProvider);
    final consentStatusAsync = ref.watch(consentStatusProvider);

    return Scaffold(
      backgroundColor: HelioraTokens.muted,
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
                    icon: const Icon(
                      Icons.arrow_back,
                      size: 20,
                      color: HelioraTokens.foreground,
                    ),
                    onPressed: widget.onNavigateHome,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Profil & Privasi',
                    style: HelioraTokens.mobileHeadline.copyWith(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
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
                  // Section 1: User Identity Card (GET /auth/me)
                  userProfileAsync.when(
                    data: (user) => _buildIdentityCard(user),
                    loading: () => _buildCardPlaceholder(height: 100),
                    error: (_, _) => _buildCardPlaceholder(height: 100),
                  ),
                  const SizedBox(height: 16),

                  // Section 2: Health Profile Summary Card (GET /health-profile)
                  healthProfileAsync.when(
                    data: (profile) => _buildHealthProfileSummaryCard(
                      profile,
                      hasActiveConsent:
                          consentStatusAsync.value?.hasActiveConsent ?? false,
                    ),
                    loading: () => _buildCardPlaceholder(height: 180),
                    error: (_, _) => _buildHealthProfileSummaryCard(
                      null,
                      hasActiveConsent:
                          consentStatusAsync.value?.hasActiveConsent ?? false,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Section 3: Privacy & Consent Revocation Card (GET /consent/status & POST /consent/revoke)
                  consentStatusAsync.when(
                    data: (consentStatus) =>
                        _buildPrivacyConsentCard(consentStatus),
                    loading: () => _buildCardPlaceholder(height: 160),
                    error: (_, _) => _buildPrivacyConsentCard(
                      const ConsentStatusResponse(hasActiveConsent: false),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Section 4: Account Actions / Logout
                  _buildAccountActionsCard(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: HelioraBottomNav(
        currentIndex: 2,
        onTap: (index) {
          if (index == 0) {
            widget.onNavigateHome?.call();
          } else if (index == 1) {
            widget.onNavigateSimulation?.call();
          }
        },
      ),
    );
  }

  Widget _buildCardPlaceholder({required double height}) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: HelioraTokens.border, width: 1.0),
      ),
      child: const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation(HelioraTokens.primary),
        ),
      ),
    );
  }

  Widget _buildIdentityCard(UserResponse? user) {
    final name = user?.fullName.isNotEmpty == true ? user!.fullName : 'Pengguna Heliora';
    final email = user?.email.isNotEmpty == true ? user!.email : '-';
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'H';

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: HelioraTokens.border, width: 1.0),
        borderRadius: BorderRadius.circular(16.0),
      ),
      child: Row(
        children: [
          // Circle Avatar with Initial
          Container(
            width: 52,
            height: 52,
            decoration: const BoxDecoration(
              color: HelioraTokens.brand900,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                initial,
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: HelioraTokens.foreground,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  email,
                  style: const TextStyle(
                    fontFamily: 'JetBrains Mono',
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: HelioraTokens.secondaryForeground,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHealthProfileSummaryCard(
    HealthProfileResponse? profile, {
    required bool hasActiveConsent,
  }) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: HelioraTokens.border, width: 1.0),
        borderRadius: BorderRadius.circular(16.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'RINGKASAN PROFIL KESEHATAN',
                style: HelioraTokens.monoEyebrow.copyWith(
                  fontSize: 11,
                  color: HelioraTokens.brand900.withValues(alpha: 0.7),
                  letterSpacing: 1.5,
                ),
              ),
              const HelioraIcon(
                HelioraIcons.clipboardList,
                size: 16,
                color: HelioraTokens.secondaryForeground,
              ),
            ],
          ),
          const SizedBox(height: 14),

          if (profile != null) ...[
            _buildProfileDataRow(
              label: 'Usia & Jenis kelamin',
              value:
                  '${profile.age} tahun • ${profile.gender == 'male' ? 'Laki-laki' : 'Perempuan'}',
            ),
            const Divider(color: HelioraTokens.border, height: 16),
            _buildProfileDataRow(
              label: 'Tinggi & Berat badan',
              value: '${profile.heightCm} cm • ${profile.weightKg.toStringAsFixed(1)} kg',
            ),
            const Divider(color: HelioraTokens.border, height: 16),
            _buildProfileDataRow(
              label: 'Indeks Massa Tubuh (IMT)',
              value: () {
                final hM = profile.heightCm / 100.0;
                final bmi = profile.weightKg / (hM * hM);
                return '${bmi.toStringAsFixed(1)} (${_bmiCategory(bmi)})';
              }(),
            ),
            const Divider(color: HelioraTokens.border, height: 16),
            _buildProfileDataRow(
              label: 'Durasi tidur harian',
              value: '${profile.sleepDurationHours.toStringAsFixed(1)} jam / hari',
            ),
            const Divider(color: HelioraTokens.border, height: 16),
            _buildProfileDataRow(
              label: 'Aktivitas fisik mingguan',
              value: '${profile.physicalActivityMinPerWeek} menit / minggu',
            ),
            const Divider(color: HelioraTokens.border, height: 16),
            _buildProfileDataRow(
              label: 'Status merokok',
              value: _smokingLabel(profile.smokingStatus),
            ),
            const Divider(color: HelioraTokens.border, height: 16),
            _buildProfileDataRow(
              label: 'Riwayat kardiometabolik keluarga',
              value: profile.familyHistory ? 'Ada riwayat keluarga' : 'Tidak ada riwayat',
            ),
          ] else ...[
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8.0),
              child: Text(
                'Data profil kesehatan belum dilengkapi. Lengkapi asesmen untuk melihat ringkasan.',
                style: HelioraTokens.bodySmall,
              ),
            ),
          ],
          const SizedBox(height: 16),

          // Edit Profile CTA Button
          SizedBox(
            width: double.infinity,
            height: 44,
            child: OutlinedButton(
              onPressed: () {
                if (!hasActiveConsent) {
                  _showConsentRequiredForEditDialog();
                } else {
                  widget.onEditHealthProfile?.call();
                }
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: HelioraTokens.primary,
                side: const BorderSide(color: HelioraTokens.border, width: 1.0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                ),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  HelioraIcon(
                    HelioraIcons.clipboardList,
                    size: 16,
                    color: HelioraTokens.primary,
                  ),
                  SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      'Perbarui profil kesehatan',
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: HelioraTokens.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileDataRow({required String label, required String value}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(
            label,
            style: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: HelioraTokens.secondaryForeground,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          textAlign: TextAlign.right,
          style: const TextStyle(
            fontFamily: 'JetBrains Mono',
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: HelioraTokens.foreground,
          ),
        ),
      ],
    );
  }

  Widget _buildPrivacyConsentCard(
    ConsentStatusResponse consentStatus,
  ) {
    final hasActiveConsent = consentStatus.hasActiveConsent;
    final acceptedAt = consentStatus.activeConsent?.acceptedAt;

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: HelioraTokens.border, width: 1.0),
        borderRadius: BorderRadius.circular(16.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'PERSETUJUAN & ETIKA DATA',
                style: HelioraTokens.monoEyebrow.copyWith(
                  fontSize: 11,
                  color: HelioraTokens.brand900.withValues(alpha: 0.7),
                  letterSpacing: 1.5,
                ),
              ),
              const HelioraIcon(
                HelioraIcons.shieldCheck,
                size: 16,
                color: HelioraTokens.secondaryForeground,
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Status persetujuan (STRICT: NO PILL CHIPS / OVAL BADGES!)
          Row(
            children: [
              HelioraIcon(
                hasActiveConsent ? HelioraIcons.check : HelioraIcons.triangleAlert,
                size: 16,
                color: hasActiveConsent ? HelioraTokens.primary : HelioraTokens.rose700,
              ),
              const SizedBox(width: 8),
              Text(
                hasActiveConsent ? 'Persetujuan Aktif' : 'Persetujuan Dicabut',
                style: TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: hasActiveConsent ? HelioraTokens.primary : HelioraTokens.rose700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          Text(
            hasActiveConsent && acceptedAt != null
                ? 'Diberikan pada ${_formatDate(acceptedAt)}'
                : 'Persetujuan saat ini tidak aktif. Data kesehatan preventif tidak lagi diproses.',
            style: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 13,
              fontWeight: FontWeight.w400,
              color: HelioraTokens.secondaryForeground,
            ),
          ),
          const SizedBox(height: 4),

          Text(
            'Versi ${consentStatus.termsVersion} (BR-CONSENT-001)',
            style: const TextStyle(
              fontFamily: 'JetBrains Mono',
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: HelioraTokens.mutedForeground,
            ),
          ),
          const SizedBox(height: 16),

          // Button: Cabut Persetujuan (BR-CONSENT-003)
          if (hasActiveConsent) ...[
            SizedBox(
              width: double.infinity,
              height: 44,
              child: OutlinedButton(
                onPressed: _isRevoking ? null : _handleRevokeConsent,
                style: OutlinedButton.styleFrom(
                  foregroundColor: HelioraTokens.rose700,
                  side: const BorderSide(color: HelioraTokens.rose300, width: 1.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                  ),
                ),
                child: _isRevoking
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(HelioraTokens.rose700),
                        ),
                      )
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          HelioraIcon(
                            HelioraIcons.shieldCheck,
                            size: 16,
                            color: HelioraTokens.rose700,
                          ),
                          SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              'Cabut persetujuan',
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontFamily: 'Plus Jakarta Sans',
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: HelioraTokens.rose700,
                              ),
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAccountActionsCard() {
    return Container(
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
            'AKUN & SESI',
            style: HelioraTokens.monoEyebrow.copyWith(
              fontSize: 11,
              color: HelioraTokens.brand900.withValues(alpha: 0.7),
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 14),

          SizedBox(
            width: double.infinity,
            height: 44,
            child: OutlinedButton(
              onPressed: _handleSignOut,
              style: OutlinedButton.styleFrom(
                foregroundColor: HelioraTokens.foreground,
                side: BorderSide(color: HelioraTokens.border, width: 1.0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                ),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  HelioraIcon(
                    HelioraIcons.logOut,
                    size: 16,
                    color: HelioraTokens.foreground,
                  ),
                  SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      'Keluar dari Akun',
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: HelioraTokens.foreground,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
