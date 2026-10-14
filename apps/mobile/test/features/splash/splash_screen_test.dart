import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'package:heliora_mobile/features/splash/presentation/splash_screen.dart';
import 'package:heliora_mobile/theme/tokens.dart';

void main() {
  Widget buildTestSplash({
    required VoidCallback onComplete,
    Future<void> Function()? initAction,
    bool disableAnimations = false,
    Duration animationDuration = const Duration(milliseconds: 1000),
    Duration timeoutDuration = const Duration(milliseconds: 3000),
  }) {
    return ProviderScope(
      child: MaterialApp(
        home: MediaQuery(
          data: MediaQueryData(disableAnimations: disableAnimations),
          child: SplashScreen(
            onSplashComplete: onComplete,
            initializationAction: initAction,
            animationDuration: animationDuration,
            timeoutDuration: timeoutDuration,
          ),
        ),
      ),
    );
  }

  testWidgets('renders white brand mark, HELIORA wordmark, and primary background',
      (tester) async {
    var completed = false;
    await tester.pumpWidget(
      buildTestSplash(
        onComplete: () => completed = true,
        initAction: () async {},
      ),
    );
    await tester.pump();

    // Primary green background
    final scaffold = tester.widget<Scaffold>(find.byType(Scaffold));
    expect(scaffold.backgroundColor, HelioraTokens.primary);

    // Concept A Helix-H SVGs rendered
    expect(find.byType(SvgPicture), findsNWidgets(2));

    // Wordmark HELIORA present without tagline
    expect(find.text('HELIORA'), findsOneWidget);
    expect(find.textContaining('solusi', findRichText: true), findsNothing);

    // Semantics announces HELIORA
    expect(find.bySemanticsLabel('HELIORA'), findsWidgets);

    // Fast forward to complete intro
    await tester.pump(const Duration(milliseconds: 1050));
    await tester.pump();
    expect(completed, isTrue);
  });

  testWidgets('respects reduced motion (disableAnimations) by completing without animation delay',
      (tester) async {
    var completed = false;
    await tester.pumpWidget(
      buildTestSplash(
        onComplete: () => completed = true,
        initAction: () async {},
        disableAnimations: true,
      ),
    );
    // Reduced motion finishes immediately on post-frame callback
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 10));

    expect(completed, isTrue);
    expect(find.text('HELIORA'), findsOneWidget);
  });

  testWidgets('pulses logo when initialization takes longer than 1s, and completes when init finishes',
      (tester) async {
    var completed = false;
    final completer = Completer<void>();

    await tester.pumpWidget(
      buildTestSplash(
        onComplete: () => completed = true,
        initAction: () => completer.future,
      ),
    );
    await tester.pump();

    // At 1.0s, animation completes, but data is not ready -> enters pulse mode
    await tester.pump(const Duration(milliseconds: 1000));
    expect(completed, isFalse);

    // Pulse for 500ms
    await tester.pump(const Duration(milliseconds: 500));
    expect(completed, isFalse);

    // Now complete the initialization
    completer.complete();
    await tester.pump();

    expect(completed, isTrue);
  });

  testWidgets('displays slow connection message and retry button when exceeding 3.0s timeout',
      (tester) async {
    var completed = false;
    final completer = Completer<void>();

    await tester.pumpWidget(
      buildTestSplash(
        onComplete: () => completed = true,
        initAction: () => completer.future,
        timeoutDuration: const Duration(milliseconds: 2000),
      ),
    );
    await tester.pump();

    // Intro completes at 1000ms
    await tester.pump(const Duration(milliseconds: 1000));
    expect(completed, isFalse);
    expect(find.text('Coba lagi'), findsNothing);

    // Advance past timeout (total 2000ms)
    await tester.pump(const Duration(milliseconds: 1100));
    expect(find.text('Koneksi lambat atau terputus.'), findsOneWidget);
    expect(find.text('Coba lagi'), findsOneWidget);

    // Button should be an OutlinedButton with white border, not a pill chip
    final retryBtn = find.widgetWithText(OutlinedButton, 'Coba lagi');
    expect(retryBtn, findsOneWidget);
  });

  testWidgets('tapping Coba lagi re-executes initialization and clears retry prompt',
      (tester) async {
    var initCount = 0;
    final completer1 = Completer<void>();
    final completer2 = Completer<void>();

    await tester.pumpWidget(
      buildTestSplash(
        onComplete: () {},
        initAction: () async {
          initCount++;
          if (initCount == 1) {
            await completer1.future;
          } else {
            await completer2.future;
          }
        },
        timeoutDuration: const Duration(milliseconds: 1500),
      ),
    );
    await tester.pump();

    // Trigger timeout
    await tester.pump(const Duration(milliseconds: 1000));
    await tester.pump(const Duration(milliseconds: 600));

    expect(initCount, 1);
    expect(find.text('Coba lagi'), findsOneWidget);

    // Tap retry button
    await tester.tap(find.text('Coba lagi'));
    await tester.pump();

    // Retry message disappears and initialization re-runs
    expect(initCount, 2);
    expect(find.text('Koneksi lambat atau terputus.'), findsNothing);
  });

  testWidgets('complies with strict ban on pill chips or decorative dot indicators',
      (tester) async {
    await tester.pumpWidget(
      buildTestSplash(
        onComplete: () {},
        initAction: () async {},
      ),
    );
    await tester.pump();

    // Verify there are no Chip or RawChip widgets
    expect(find.byType(Chip), findsNothing);
    expect(find.byType(RawChip), findsNothing);
  });
}
