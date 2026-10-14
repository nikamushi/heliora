import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../../core/storage/preferences_service.dart';
import '../../../theme/svg_data.dart';
import '../../../theme/tokens.dart';
import '../../assessment/data/assessment_repository.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../consent/presentation/consent_controller.dart';

/// Animated cold-start splash screen meeting MFR-012 specifications.
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({
    super.key,
    required this.onSplashComplete,
    this.initializationAction,
    this.animationDuration = const Duration(milliseconds: 1000),
    this.timeoutDuration = const Duration(milliseconds: 3000),
  });

  /// Callback fired when the splash sequence finishes and destination screen is ready.
  final VoidCallback onSplashComplete;

  /// Optional injected initialization future for testing.
  final Future<void> Function()? initializationAction;

  /// Duration of the logo intro animation (~1.0s).
  final Duration animationDuration;

  /// Timeout threshold for slow connection before showing retry (~3.0s).
  final Duration timeoutDuration;

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _introController;
  late final AnimationController _pulseController;

  late final Animation<double> _backStrandFade;
  late final Animation<Offset> _backStrandSlide;
  late final Animation<double> _frontStrandFade;
  late final Animation<Offset> _frontStrandSlide;
  late final Animation<double> _wordmarkFade;

  bool _isInitFinished = false;
  bool _isAnimationFinished = false;
  bool _showRetry = false;
  bool _hasAnnouncedSemantics = false;
  Timer? _timeoutTimer;

  @override
  void initState() {
    super.initState();

    _introController = AnimationController(
      vsync: this,
      duration: widget.animationDuration,
    );

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    // Kaki belakang: slides up from bottom and fades in (0.0 -> 0.55)
    _backStrandFade = CurvedAnimation(
      parent: _introController,
      curve: const Interval(0.0, 0.55, curve: Curves.easeOut),
    );
    _backStrandSlide = Tween<Offset>(
      begin: const Offset(0.0, 0.25),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _introController,
        curve: const Interval(0.0, 0.55, curve: Curves.easeOutCubic),
      ),
    );

    // Kaki depan: overlays on top with gap (0.30 -> 0.80)
    _frontStrandFade = CurvedAnimation(
      parent: _introController,
      curve: const Interval(0.30, 0.80, curve: Curves.easeOut),
    );
    _frontStrandSlide = Tween<Offset>(
      begin: const Offset(0.0, -0.15),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _introController,
        curve: const Interval(0.30, 0.80, curve: Curves.easeOutCubic),
      ),
    );

    // Wordmark HELIORA fades in (0.60 -> 1.0)
    _wordmarkFade = CurvedAnimation(
      parent: _introController,
      curve: const Interval(0.60, 1.0, curve: Curves.easeOut),
    );

    _introController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _onAnimationCompleted();
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startSplashFlow();
    });
  }

  void _startSplashFlow() {
    if (!mounted) return;

    if (!_hasAnnouncedSemantics) {
      _hasAnnouncedSemantics = true;
      try {
        SemanticsService.sendAnnouncement(
          View.of(context),
          'HELIORA',
          TextDirection.ltr,
        );
      } catch (_) {}
    }

    final reduceMotion = MediaQuery.of(context).disableAnimations;

    // Start network/storage initialization in parallel
    _runInitialization();

    // Setup slow network tolerance timer (3 seconds)
    _timeoutTimer?.cancel();
    _timeoutTimer = Timer(widget.timeoutDuration, _onTimeoutReached);

    if (reduceMotion) {
      _introController.value = 1.0;
      _onAnimationCompleted();
    } else {
      _introController.forward();
    }
  }

  Future<void> _runInitialization() async {
    try {
      if (widget.initializationAction != null) {
        await widget.initializationAction!();
      } else {
        // Production initialization:
        // 1. Session check
        final isAuthenticated = ref.read(isAuthenticatedProvider);
        if (isAuthenticated) {
          // Preload consent status and latest assessment
          await Future.wait([
            ref.read(consentStatusProvider.future),
            ref.read(latestAssessmentProvider.future),
          ]).timeout(
            const Duration(milliseconds: 2800),
            onTimeout: () => [],
          );
        } else {
          // Unauthenticated: check first launch marker
          try {
            ref.read(isFirstLaunchProvider);
          } catch (_) {}
        }
      }
    } catch (e) {
      debugPrint('Splash init error handled: $e');
    }

    if (!mounted) return;
    _isInitFinished = true;

    // If intro animation is already finished, complete immediately (no artificial delay)
    if (_isAnimationFinished) {
      _finishAndNavigate();
    }
  }

  void _onAnimationCompleted() {
    _isAnimationFinished = true;

    if (_isInitFinished) {
      _finishAndNavigate();
    } else {
      // Data not ready after 1.0s: pulse logo (opacity 100% to 70%, 900ms)
      final reduceMotion = MediaQuery.of(context).disableAnimations;
      if (!reduceMotion && !_showRetry) {
        _pulseController.repeat(reverse: true);
      }
    }
  }

  void _onTimeoutReached() {
    if (!mounted || _isInitFinished) return;

    // Over 3 seconds: stop pulse and display connection message + retry button (MFR-011)
    _pulseController.stop();
    setState(() {
      _showRetry = true;
    });
  }

  void _finishAndNavigate() {
    _timeoutTimer?.cancel();
    _pulseController.stop();
    widget.onSplashComplete();
  }

  void _retry() {
    setState(() {
      _showRetry = false;
      _isInitFinished = false;
    });

    final reduceMotion = MediaQuery.of(context).disableAnimations;
    if (!reduceMotion) {
      _pulseController.repeat(reverse: true);
    }

    _timeoutTimer?.cancel();
    _timeoutTimer = Timer(widget.timeoutDuration, _onTimeoutReached);
    _runInitialization();
  }

  @override
  void dispose() {
    _timeoutTimer?.cancel();
    _introController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion = MediaQuery.of(context).disableAnimations;

    return Semantics(
      label: 'HELIORA',
      header: true,
      child: Scaffold(
        backgroundColor: HelioraTokens.primary,
        body: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(),

                // Animated Brand Mark (Concept A Helix-H)
                AnimatedBuilder(
                  animation: Listenable.merge([_introController, _pulseController]),
                  builder: (context, child) {
                    final pulseOpacity = (reduceMotion || !_pulseController.isAnimating)
                        ? 1.0
                        : (1.0 - (_pulseController.value * 0.30)); // 100% to 70%

                    return Opacity(
                      opacity: pulseOpacity,
                      child: SizedBox(
                        width: 96,
                        height: 96,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            // Kaki belakang (Back strand)
                            if (reduceMotion)
                              SvgPicture.string(
                                HelioraSvgData.logoMarkWhiteBack,
                                width: 96,
                                height: 96,
                                fit: BoxFit.contain,
                              )
                            else
                              SlideTransition(
                                position: _backStrandSlide,
                                child: FadeTransition(
                                  opacity: _backStrandFade,
                                  child: SvgPicture.string(
                                    HelioraSvgData.logoMarkWhiteBack,
                                    width: 96,
                                    height: 96,
                                    fit: BoxFit.contain,
                                  ),
                                ),
                              ),

                            // Kaki depan (Front strand)
                            if (reduceMotion)
                              SvgPicture.string(
                                HelioraSvgData.logoMarkWhiteFront,
                                width: 96,
                                height: 96,
                                fit: BoxFit.contain,
                              )
                            else
                              SlideTransition(
                                position: _frontStrandSlide,
                                child: FadeTransition(
                                  opacity: _frontStrandFade,
                                  child: SvgPicture.string(
                                    HelioraSvgData.logoMarkWhiteFront,
                                    width: 96,
                                    height: 96,
                                    fit: BoxFit.contain,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 24),

                // Wordmark HELIORA (Plus Jakarta Sans, tracking, bold, white, no tagline)
                AnimatedBuilder(
                  animation: _introController,
                  builder: (context, child) {
                    final opacity = reduceMotion ? 1.0 : _wordmarkFade.value;
                    return Opacity(
                      opacity: opacity,
                      child: const Text(
                        'HELIORA',
                        style: TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 6.0,
                          color: Colors.white,
                        ),
                      ),
                    );
                  },
                ),

                const Spacer(),

                // Connection message and Retry button if timeout exceeds 3 seconds (MFR-011)
                if (_showRetry)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'Koneksi lambat atau terputus.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Colors.white70,
                          ),
                        ),
                        const SizedBox(height: 16),
                        OutlinedButton(
                          onPressed: _retry,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Colors.white, width: 1.5),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
                            ),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 28.0,
                              vertical: 12.0,
                            ),
                          ),
                          child: const Text(
                            'Coba lagi',
                            style: TextStyle(
                              fontFamily: 'Plus Jakarta Sans',
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  const SizedBox(height: 72),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
