import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/providers/api_providers.dart';
import '../../../theme/components.dart';
import '../../../theme/tokens.dart';
import 'auth_controller.dart';

/// Screen for registering a new user account.
/// Matches Figma Alur 1 node 74:417 (Mobile / Register) and states 74:528, 85:1701, 85:1796.
class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({
    super.key,
    this.isFirstLaunch = false,
    this.onNavigateToLogin,
    this.onRegistrationSuccess,
    this.onOpenTerms,
    this.onOpenPrivacy,
  });

  /// When true, renders first-launch header without a back button and with "Masuk" action in top app bar.
  final bool isFirstLaunch;

  /// Callback to navigate to login screen.
  final VoidCallback? onNavigateToLogin;

  /// Callback invoked after successful registration and session creation.
  final VoidCallback? onRegistrationSuccess;

  /// Callback to open Terms of Service screen or modal.
  final VoidCallback? onOpenTerms;

  /// Callback to open Privacy Policy screen or modal.
  final VoidCallback? onOpenPrivacy;

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _agreedToTerms = false;
  bool _hasAttemptedSubmit = false;
  String? _errorMessage;
  bool _isEmailAlreadyRegistered = false;
  late final TapGestureRecognizer _termsRecognizer;
  late final TapGestureRecognizer _privacyRecognizer;
  late final TapGestureRecognizer _toggleAgreeRecognizer;

  @override
  void initState() {
    super.initState();
    _termsRecognizer = TapGestureRecognizer()
      ..onTap = () {
        if (widget.onOpenTerms != null) {
          widget.onOpenTerms!();
        } else {
          context.push('/terms');
        }
      };
    _privacyRecognizer = TapGestureRecognizer()
      ..onTap = () {
        if (widget.onOpenPrivacy != null) {
          widget.onOpenPrivacy!();
        } else {
          context.push('/privacy');
        }
      };
    _toggleAgreeRecognizer = TapGestureRecognizer()
      ..onTap = () {
        setState(() {
          _agreedToTerms = !_agreedToTerms;
        });
      };
    _passwordController.addListener(_onPasswordChanged);
  }

  void _onPasswordChanged() {
    setState(() {});
  }

  @override
  void dispose() {
    _termsRecognizer.dispose();
    _privacyRecognizer.dispose();
    _toggleAgreeRecognizer.dispose();
    _passwordController.removeListener(_onPasswordChanged);
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  /// Calculates password strength level (0 to 4) according to PRD MFR-001.
  int get _passwordStrengthLevel {
    final pass = _passwordController.text;
    if (pass.isEmpty) return 0;
    if (pass.length < 8) return 1;

    var score = 0;
    if (pass.contains(RegExp(r'[a-z]'))) score++;
    if (pass.contains(RegExp(r'[A-Z]'))) score++;
    if (pass.contains(RegExp(r'[0-9]'))) score++;
    if (pass.contains(RegExp(r'[^a-zA-Z0-9]'))) score++;

    if (score <= 1) return 1;
    if (score == 2) return 2;
    if (score == 3) return 3;
    return pass.length >= 10 ? 4 : 3;
  }

  String get _passwordStrengthLabel {
    switch (_passwordStrengthLevel) {
      case 1:
        return 'Kekuatan sandi: Lemah';
      case 2:
        return 'Kekuatan sandi: Cukup';
      case 3:
        return 'Kekuatan sandi: Kuat';
      case 4:
        return 'Kekuatan sandi: Sangat Kuat';
      default:
        return 'Kekuatan sandi: Belum diisi';
    }
  }

  Color get _strengthBarActiveColor {
    if (_passwordStrengthLevel == 1) {
      return HelioraTokens.rose700;
    }
    return HelioraTokens.emerald700;
  }

  Future<void> _handleRegister() async {
    setState(() {
      _hasAttemptedSubmit = true;
      _errorMessage = null;
      _isEmailAlreadyRegistered = false;
    });

    if (!_formKey.currentState!.validate() || !_agreedToTerms) {
      return;
    }

    final success = await ref.read(authControllerProvider.notifier).signUpWithEmail(
          email: _emailController.text,
          password: _passwordController.text,
          fullName: _nameController.text,
        );

    if (success && mounted) {
      widget.onRegistrationSuccess?.call();
    } else if (mounted) {
      final state = ref.read(authControllerProvider);
      state.whenOrNull(
        error: (error, _) {
          setState(() {
            if (error is ApiException) {
              if (error.statusCode == 409 ||
                  error.message.toLowerCase().contains('already registered') ||
                  error.message.toLowerCase().contains('terdaftar')) {
                _isEmailAlreadyRegistered = true;
                _errorMessage = 'Email ini sudah terdaftar.';
              } else {
                _errorMessage = error.message;
              }
            } else {
              _errorMessage = 'Gagal mendaftar akun. Silakan periksa koneksi dan coba lagi.';
            }
          });
        },
      );
    }
  }

  Future<void> _handleGoogleRegister() async {
    setState(() {
      _errorMessage = null;
      _isEmailAlreadyRegistered = false;
    });

    final config = ref.read(appConfigProvider);
    final launched = await ref.read(authControllerProvider.notifier).signInWithGoogle(
          redirectUrl: config.authCallbackScheme,
        );

    if (!launched && mounted) {
      setState(() {
        _errorMessage = 'Tidak dapat membuka autentikasi Google. Silakan coba lagi.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(56.0),
        child: Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: SafeArea(
            bottom: false,
            child: SizedBox(
              height: 56.0,
              child: Row(
                children: [
                  if (!widget.isFirstLaunch)
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: HelioraTokens.foreground),
                      onPressed: widget.onNavigateToLogin,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
                    ),
                  const Expanded(
                    child: Text(
                      'Daftar',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.5,
                        color: HelioraTokens.foreground,
                      ),
                    ),
                  ),
                  if (widget.isFirstLaunch)
                    InkWell(
                      onTap: widget.onNavigateToLogin,
                      borderRadius: BorderRadius.circular(HelioraTokens.radiusSm),
                      child: Container(
                        height: 48.0,
                        padding: const EdgeInsets.symmetric(horizontal: 12.0),
                        alignment: Alignment.center,
                        child: Text(
                          'Masuk',
                          style: HelioraTokens.labelDefault.copyWith(
                            color: HelioraTokens.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
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
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Intro (Figma node 74:430)
                    const Text(
                      'Buat akun HELIORA',
                      style: HelioraTokens.mobileTitle,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Satu akun berlaku di web dan aplikasi Android.',
                      style: HelioraTokens.bodySmall.copyWith(
                        color: HelioraTokens.mutedForeground,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Google OAuth Button (Figma node 85:1665)
                    SizedBox(
                      height: 48,
                      child: OutlinedButton(
                        onPressed: isLoading ? null : _handleGoogleRegister,
                        style: OutlinedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: HelioraTokens.foreground,
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          side: const BorderSide(color: HelioraTokens.border),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          ),
                          elevation: 0,
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            GoogleLogoIcon(size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Daftar dengan Google',
                              style: TextStyle(
                                fontFamily: 'Plus Jakarta Sans',
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: HelioraTokens.foreground,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Divider: atau daftar dengan email (Figma node 85:1681)
                    Row(
                      children: [
                        const Expanded(
                          child: Divider(color: HelioraTokens.border, thickness: 1),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            'atau daftar dengan email',
                            style: HelioraTokens.caption.copyWith(
                              color: HelioraTokens.mutedForeground,
                            ),
                          ),
                        ),
                        const Expanded(
                          child: Divider(color: HelioraTokens.border, thickness: 1),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Inline Error Alert (Figma node 74:646 / 85:1701)
                    if (_errorMessage != null && !_isEmailAlreadyRegistered) ...[
                      InlineAlert(
                        message: _errorMessage!,
                        type: InlineAlertType.error,
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Field 1: Nama Lengkap (Figma node 74:434)
                    const Text(
                      'Nama lengkap',
                      style: HelioraTokens.labelDefault,
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _nameController,
                      textInputAction: TextInputAction.next,
                      style: HelioraTokens.bodyDefault.copyWith(fontSize: 15),
                      decoration: InputDecoration(
                        hintText: 'Hana Lestari',
                        hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 14,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(color: HelioraTokens.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(color: HelioraTokens.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(
                            color: HelioraTokens.primary,
                            width: 1.5,
                          ),
                        ),
                        errorBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(color: HelioraTokens.rose700),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().length < 2) {
                          return 'Nama minimal 2 karakter.';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),

                    // Field 2: Email (Figma node 74:445)
                    const Text(
                      'Email',
                      style: HelioraTokens.labelDefault,
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      style: HelioraTokens.bodyDefault.copyWith(fontSize: 15),
                      decoration: InputDecoration(
                        hintText: 'hana@example.com',
                        hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 14,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(color: HelioraTokens.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(color: HelioraTokens.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(
                            color: HelioraTokens.primary,
                            width: 1.5,
                          ),
                        ),
                        errorBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(color: HelioraTokens.rose700),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty || !value.contains('@') || !value.contains('.')) {
                          return 'Format email belum valid.';
                        }
                        return null;
                      },
                    ),
                    if (_isEmailAlreadyRegistered) ...[
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.error_outline, color: HelioraTokens.rose700, size: 16),
                          const SizedBox(width: 6),
                          Text(
                            'Email ini sudah terdaftar.',
                            style: HelioraTokens.caption.copyWith(
                              color: HelioraTokens.rose700,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      GestureDetector(
                        onTap: widget.onNavigateToLogin,
                        child: Text(
                          'Masuk dengan email ini',
                          style: HelioraTokens.bodySmall.copyWith(
                            color: HelioraTokens.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 14),

                    // Field 3: Kata Sandi (Figma node 74:456)
                    const Text(
                      'Kata sandi',
                      style: HelioraTokens.labelDefault,
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      textInputAction: TextInputAction.next,
                      style: HelioraTokens.bodyDefault.copyWith(fontSize: 15),
                      decoration: InputDecoration(
                        hintText: '••••••••••',
                        hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 14,
                        ),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            color: const Color(0xFF64748B),
                            size: 20,
                          ),
                          onPressed: () {
                            setState(() => _obscurePassword = !_obscurePassword);
                          },
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(color: HelioraTokens.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(color: HelioraTokens.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(
                            color: HelioraTokens.primary,
                            width: 1.5,
                          ),
                        ),
                        errorBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(color: HelioraTokens.rose700),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.length < 8) {
                          return 'Kata sandi minimal 8 karakter';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 8),

                    // Password Strength Indicator (4-bars, Figma node 74:480)
                    Row(
                      children: List.generate(4, (index) {
                        final isActive = index < _passwordStrengthLevel;
                        return Expanded(
                          child: Container(
                            height: 4,
                            margin: EdgeInsets.only(right: index < 3 ? 4.0 : 0.0),
                            decoration: BoxDecoration(
                              color: isActive
                                  ? _strengthBarActiveColor
                                  : HelioraTokens.border,
                              borderRadius: BorderRadius.circular(2.0),
                            ),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _passwordStrengthLabel,
                      style: HelioraTokens.caption.copyWith(
                        color: HelioraTokens.mutedForeground,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Field 4: Konfirmasi Kata Sandi (Figma node 74:487)
                    const Text(
                      'Konfirmasi kata sandi',
                      style: HelioraTokens.labelDefault,
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _confirmPasswordController,
                      obscureText: _obscureConfirmPassword,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _handleRegister(),
                      style: HelioraTokens.bodyDefault.copyWith(fontSize: 15),
                      decoration: InputDecoration(
                        hintText: '••••••••••',
                        hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 14,
                        ),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureConfirmPassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            color: const Color(0xFF64748B),
                            size: 20,
                          ),
                          onPressed: () {
                            setState(() => _obscureConfirmPassword = !_obscureConfirmPassword);
                          },
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(color: HelioraTokens.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(color: HelioraTokens.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(
                            color: HelioraTokens.primary,
                            width: 1.5,
                          ),
                        ),
                        errorBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          borderSide: const BorderSide(color: HelioraTokens.rose700),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty || value != _passwordController.text) {
                          return 'Kata sandi tidak sama.';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Checkbox S&K (Figma node 74:510) with interactive legal links aligned with Web
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        GestureDetector(
                          key: const Key('register_agreement_checkbox'),
                          onTap: () {
                            setState(() => _agreedToTerms = !_agreedToTerms);
                          },
                          child: Container(
                            width: 20,
                            height: 20,
                            margin: const EdgeInsets.only(top: 2),
                            decoration: BoxDecoration(
                              color: _agreedToTerms ? HelioraTokens.primary : Colors.white,
                              border: Border.all(
                                color: _agreedToTerms
                                    ? HelioraTokens.primary
                                    : (_hasAttemptedSubmit && !_agreedToTerms
                                        ? HelioraTokens.rose700
                                        : HelioraTokens.border),
                                width: 1.5,
                              ),
                              borderRadius: BorderRadius.circular(HelioraTokens.radiusSm),
                            ),
                            child: _agreedToTerms
                                ? const Icon(
                                    Icons.check,
                                    size: 14,
                                    color: Colors.white,
                                  )
                                : null,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text.rich(
                            TextSpan(
                              style: HelioraTokens.bodySmall.copyWith(
                                color: HelioraTokens.foreground,
                                height: 1.45,
                                fontSize: 13,
                              ),
                              children: [
                                TextSpan(
                                  text: 'Saya menyetujui ',
                                  recognizer: _toggleAgreeRecognizer,
                                ),
                                TextSpan(
                                  text: 'Ketentuan Layanan',
                                  style: const TextStyle(
                                    color: HelioraTokens.primary,
                                    fontWeight: FontWeight.w600,
                                    decoration: TextDecoration.underline,
                                  ),
                                  recognizer: _termsRecognizer,
                                ),
                                TextSpan(
                                  text: ' dan ',
                                  recognizer: _toggleAgreeRecognizer,
                                ),
                                TextSpan(
                                  text: 'Kebijakan Privasi',
                                  style: const TextStyle(
                                    color: HelioraTokens.primary,
                                    fontWeight: FontWeight.w600,
                                    decoration: TextDecoration.underline,
                                  ),
                                  recognizer: _privacyRecognizer,
                                ),
                                const TextSpan(text: '.'),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (_hasAttemptedSubmit && !_agreedToTerms) ...[
                      const SizedBox(height: 12),
                      const InlineAlert(
                        message: 'Centang persetujuan untuk melanjutkan.',
                        type: InlineAlertType.warning,
                      ),
                    ],
                    const SizedBox(height: 20),

                    // Primary Button: Daftar (Figma node 74:513 & 85:1796 Mengirim)
                    SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        onPressed: isLoading ? null : _handleRegister,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: HelioraTokens.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                          ),
                          disabledBackgroundColor: const Color(0xFF80BCA4),
                        ),
                        child: isLoading
                            ? const Text(
                                'Membuat akun...',
                                style: HelioraTokens.labelButton,
                              )
                            : const Text(
                                'Daftar',
                                style: HelioraTokens.labelButton,
                              ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Privacy Note (Figma node 74:521)
                    Text(
                      'Data Anda hanya dipakai untuk estimasi risiko dan bisa dicabut kapan saja.',
                      textAlign: TextAlign.center,
                      style: HelioraTokens.caption.copyWith(
                        color: HelioraTokens.mutedForeground,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Bottom Link: Sudah punya akun? Masuk (Figma node 74:522)
                    Wrap(
                      alignment: WrapAlignment.center,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(
                          'Sudah punya akun? ',
                          style: HelioraTokens.bodySmall.copyWith(
                            color: HelioraTokens.mutedForeground,
                          ),
                        ),
                        GestureDetector(
                          onTap: widget.onNavigateToLogin,
                          child: Text(
                            'Masuk',
                            style: HelioraTokens.bodySmall.copyWith(
                              color: HelioraTokens.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
