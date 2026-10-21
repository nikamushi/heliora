import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/providers/api_providers.dart';
import '../../../theme/components.dart';
import '../../../theme/tokens.dart';
import 'auth_controller.dart';

/// Screen for authenticating users via Email/Password or Google OAuth.
/// Matches Figma Alur 1 node 74:139 (Mobile / Login) and Design System.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({
    super.key,
    this.onNavigateToRegister,
  });

  /// Optional callback invoked when user taps the link to navigate to registration.
  final VoidCallback? onNavigateToRegister;

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  String? _errorMessage;
  bool _isSessionExpired = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleEmailLogin() async {
    setState(() {
      _errorMessage = null;
      _isSessionExpired = false;
    });

    if (!_formKey.currentState!.validate()) {
      return;
    }

    final success = await ref.read(authControllerProvider.notifier).signInWithEmail(
          email: _emailController.text,
          password: _passwordController.text,
        );

    if (!success && mounted) {
      final state = ref.read(authControllerProvider);
      state.whenOrNull(
        error: (error, _) {
          setState(() {
            if (error is ApiException) {
              if (error.statusCode == 401 &&
                  error.message.toLowerCase().contains('session')) {
                _isSessionExpired = true;
                _errorMessage = 'Sesi Anda berakhir. Masuk lagi untuk melanjutkan.';
              } else {
                _errorMessage = error.message;
              }
            } else {
              _errorMessage = 'Gagal masuk. Pastikan email dan kata sandi Anda benar.';
            }
          });
        },
      );
    }
  }

  Future<void> _handleGoogleLogin() async {
    setState(() {
      _errorMessage = null;
      _isSessionExpired = false;
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
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 8),

                    // Centered Brand Logo (Figma node 74:145)
                    const Center(
                      child: HelioraLogo(size: 48),
                    ),
                    const SizedBox(height: 24),

                    // Centered Title & Subtitle (Figma node 74:144)
                    const Text(
                      'Masuk ke HELIORA',
                      textAlign: TextAlign.center,
                      style: HelioraTokens.mobileTitle,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Lanjutkan asesmen gaya hidup Anda.',
                      textAlign: TextAlign.center,
                      style: HelioraTokens.bodySmall,
                    ),
                    const SizedBox(height: 24),

                    // Inline Error/Session Expired Alert (Figma node 74:257 / 74:344)
                    if (_errorMessage != null) ...[
                      InlineAlert(
                        message: _errorMessage!,
                        type: _isSessionExpired
                            ? InlineAlertType.info
                            : InlineAlertType.error,
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Email Field (Figma node 74:156)
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
                        hintText: 'nama@email.com',
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
                        if (value == null || value.trim().isEmpty) {
                          return 'Alamat email wajib diisi';
                        }
                        if (!value.contains('@') || !value.contains('.')) {
                          return 'Format email tidak valid';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Password Field (Figma node 74:175)
                    const Text(
                      'Kata sandi',
                      style: HelioraTokens.labelDefault,
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _handleEmailLogin(),
                      style: HelioraTokens.bodyDefault.copyWith(fontSize: 15),
                      decoration: InputDecoration(
                        hintText: 'Masukkan kata sandi',
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
                        if (value == null || value.isEmpty) {
                          return 'Kata sandi wajib diisi';
                        }
                        if (value.length < 8) {
                          return 'Kata sandi minimal 8 karakter';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),

                    // Primary Button: Masuk (Figma node 74:203)
                    SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        onPressed: isLoading ? null : _handleEmailLogin,
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
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation(Colors.white),
                                ),
                              )
                            : const Text(
                                'Masuk',
                                style: HelioraTokens.labelButton,
                              ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Divider: atau (Figma node 74:215)
                    Row(
                      children: [
                        const Expanded(
                          child: Divider(color: HelioraTokens.border, thickness: 1),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            'atau',
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

                    // Secondary Button: Lanjutkan dengan Google (Figma node 74:219)
                    SizedBox(
                      height: 48,
                      child: OutlinedButton(
                        onPressed: isLoading ? null : _handleGoogleLogin,
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
                              'Lanjutkan dengan Google',
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
                    const SizedBox(height: 24),

                    // Footer Link: Belum punya akun? Daftar (Figma node 74:235)
                    Wrap(
                      alignment: WrapAlignment.center,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(
                          'Belum punya akun? ',
                          style: HelioraTokens.bodySmall.copyWith(
                            color: HelioraTokens.mutedForeground,
                          ),
                        ),
                        GestureDetector(
                          onTap: widget.onNavigateToRegister,
                          child: Text(
                            'Daftar',
                            style: HelioraTokens.bodySmall.copyWith(
                              color: HelioraTokens.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 64),

                    // Legal Disclaimer Note (Figma node 74:239)
                    Text(
                      'Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi.',
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
      ),
    );
  }
}
