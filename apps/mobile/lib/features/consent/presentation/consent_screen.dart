import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../theme/components.dart';
import '../../../theme/tokens.dart';
import '../../home/presentation/widgets/statutory_disclaimer_card.dart';
import 'consent_controller.dart';

/// Screen presenting statutory medical disclaimer and mandatory data consent (Figma Alur 2 node 77:357).
/// Adheres strictly to Heliora Editorial & Minimalist standards (Design.md §2.6, §15.1, no pill chips).
class ConsentScreen extends ConsumerStatefulWidget {
  const ConsentScreen({
    super.key,
    this.onConsentGranted,
  });

  /// Callback invoked after consent is successfully recorded.
  final VoidCallback? onConsentGranted;

  @override
  ConsumerState<ConsentScreen> createState() => _ConsentScreenState();
}

class _ConsentScreenState extends ConsumerState<ConsentScreen> {
  bool _agreed = false;
  String? _errorMessage;

  Future<void> _handleSubmitConsent() async {
    if (!_agreed) return;

    setState(() => _errorMessage = null);

    final success = await ref
        .read(consentControllerProvider.notifier)
        .submitConsent(consentVersion: '1.0');

    if (success && mounted) {
      widget.onConsentGranted?.call();
    } else if (mounted) {
      final state = ref.read(consentControllerProvider);
      state.whenOrNull(
        error: (error, _) {
          setState(() {
            if (error is ApiException) {
              _errorMessage = error.message;
            } else {
              _errorMessage = 'Gagal menyimpan persetujuan data. Silakan coba lagi.';
            }
          });
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final consentSubmissionState = ref.watch(consentControllerProvider);
    final isLoading = consentSubmissionState.isLoading;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Brand Header with horizontal logo
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const HelioraLogo(size: 36),
                      const SizedBox(width: 10),
                      Text(
                        'HELIORA',
                        style: HelioraTokens.mobileHeadline.copyWith(
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Eyebrow Monospace (Strictly no pill chips standard)
                  Text(
                    'LANGKAH 01 / 02 · PERSETUJUAN DATA',
                    textAlign: TextAlign.center,
                    style: HelioraTokens.monoEyebrow.copyWith(
                      fontSize: 11,
                      color: HelioraTokens.primary,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Main Title
                  const Text(
                    'Sebelum memulai asesmen',
                    textAlign: TextAlign.center,
                    style: HelioraTokens.mobileTitle,
                  ),
                  const SizedBox(height: 8),

                  // Subtitle
                  Text(
                    'HELIORA memakai data gaya hidup Anda untuk empat hal berikut.',
                    textAlign: TextAlign.center,
                    style: HelioraTokens.bodySmall.copyWith(
                      color: HelioraTokens.mutedForeground,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Inline Error Alert (if submission fails)
                  if (_errorMessage != null) ...[
                    InlineAlert(
                      message: _errorMessage!,
                      type: InlineAlertType.error,
                    ),
                    const SizedBox(height: 16),
                  ],

                  // 4 Benefit Tiles (Figma node 77:372)
                  const _BenefitTile(
                    iconAsset: HelioraIcons.shieldCheck,
                    title: 'Estimasi risiko',
                    description:
                        'Estimasi risiko diabetes, hipertensi, dan kardiovaskular dari gaya hidup Anda.',
                  ),
                  const SizedBox(height: 12),
                  const _BenefitTile(
                    iconAsset: HelioraIcons.trendingUp,
                    title: 'Health & Lifestyle Score',
                    description:
                        'Skor ringkas kualitas gaya hidup, dijelaskan dengan bahasa awam.',
                  ),
                  const SizedBox(height: 12),
                  const _BenefitTile(
                    iconAsset: HelioraIcons.sparkles,
                    title: 'Simulasi',
                    description:
                        'Coba ubah kebiasaan dan lihat arah estimasi risikonya.',
                  ),
                  const SizedBox(height: 12),
                  const _BenefitTile(
                    iconAsset: HelioraIcons.heartPulse,
                    title: 'Rekomendasi preventif',
                    description:
                        'Saran pencegahan yang merujuk pada pedoman klinis.',
                  ),
                  const SizedBox(height: 20),

                  // Medical Disclaimer Banner (Design.md §2.6 verbatim, Figma node 77:416)
                  const StatutoryDisclaimerCard(),
                  const SizedBox(height: 16),

                  // Mandatory Consent Agreement Checkbox Container (Figma node 77:425)
                  Container(
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(
                        color: _agreed ? HelioraTokens.primary : HelioraTokens.border,
                        width: 1.2,
                      ),
                      borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                    ),
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _agreed = !_agreed);
                      },
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 20,
                            height: 20,
                            margin: const EdgeInsets.only(top: 2),
                            decoration: BoxDecoration(
                              color: _agreed ? HelioraTokens.primary : Colors.white,
                              border: Border.all(
                                color: _agreed ? HelioraTokens.primary : const Color(0xFFCBD5E1),
                                width: 1.5,
                              ),
                              borderRadius: BorderRadius.circular(HelioraTokens.radiusSm),
                            ),
                            child: _agreed
                                ? const HelioraIcon(
                                    HelioraIcons.check,
                                    size: 14,
                                    color: Colors.white,
                                  )
                                : null,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Saya memahami dan menyetujui pemrosesan data gaya hidup saya '
                              'untuk tujuan estimasi risiko preventif.',
                              style: HelioraTokens.bodySmall.copyWith(
                                color: HelioraTokens.foreground,
                                fontWeight: FontWeight.w500,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Action Button: Lanjut ke profil kesehatan (Figma node 77:429)
                  SizedBox(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: (_agreed && !isLoading) ? _handleSubmitConsent : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: HelioraTokens.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                        ),
                        disabledBackgroundColor: const Color(0xFF80BCA4),
                        disabledForegroundColor: Colors.white.withValues(alpha: 0.8),
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
                          : const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Flexible(
                                  child: Text(
                                    'Lanjut ke profil kesehatan',
                                    style: HelioraTokens.labelButton,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
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
                  const SizedBox(height: 16),

                  // Bottom Note (Figma node 77:441)
                  Text(
                    'Anda bisa mencabut persetujuan kapan saja di halaman Profil.',
                    textAlign: TextAlign.center,
                    style: HelioraTokens.caption.copyWith(
                      color: HelioraTokens.mutedForeground,
                      height: 1.4,
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

/// Benefit tile with solid light background and icon badge.
class _BenefitTile extends StatelessWidget {
  const _BenefitTile({
    required this.iconAsset,
    required this.title,
    required this.description,
  });

  final String iconAsset;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F8F6),
        border: Border.all(color: const Color(0xFFE2EFE9), width: 1.0),
        borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: HelioraIcon(
                iconAsset,
                size: 20,
                color: HelioraTokens.primary,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: HelioraTokens.bodyDefault.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: HelioraTokens.foreground,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: HelioraTokens.bodySmall.copyWith(
                    fontSize: 13,
                    color: HelioraTokens.mutedForeground,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
