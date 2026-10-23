import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:heliora_mobile/features/auth/presentation/register_screen.dart';

void main() {
  Widget createTestWidget({
    bool isFirstLaunch = false,
    VoidCallback? onNavigateToLogin,
    VoidCallback? onRegistrationSuccess,
    VoidCallback? onOpenTerms,
    VoidCallback? onOpenPrivacy,
  }) {
    return ProviderScope(
      child: MaterialApp(
        home: RegisterScreen(
          isFirstLaunch: isFirstLaunch,
          onNavigateToLogin: onNavigateToLogin,
          onRegistrationSuccess: onRegistrationSuccess,
          onOpenTerms: onOpenTerms,
          onOpenPrivacy: onOpenPrivacy,
        ),
      ),
    );
  }

  group('RegisterScreen Widget Tests (Figma Alur 1)', () {
    testWidgets('renders all initial fields, labels, and first-launch header',
        (tester) async {
      await tester.pumpWidget(createTestWidget(isFirstLaunch: true));
      await tester.pumpAndSettle();

      expect(find.text('Daftar'), findsNWidgets(2)); // Title in AppBar + Primary Button
      expect(find.text('Buat akun HELIORA'), findsOneWidget);
      expect(find.text('Daftar dengan Google'), findsOneWidget);
      expect(find.text('atau daftar dengan email'), findsOneWidget);
      expect(find.text('Nama lengkap'), findsOneWidget);
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Kata sandi'), findsOneWidget);
      expect(find.text('Konfirmasi kata sandi'), findsOneWidget);
      expect(find.text('Kekuatan sandi: Belum diisi'), findsOneWidget);
      expect(
        find.textContaining('Saya menyetujui'),
        findsOneWidget,
      );
      // First launch mode: no back arrow button
      expect(find.byIcon(Icons.arrow_back), findsNothing);
      // Top bar contains Masuk action
      expect(find.text('Masuk'), findsNWidgets(2)); // AppBar action + bottom link
    });

    testWidgets('shows back button when isFirstLaunch is false',
        (tester) async {
      var backPressed = false;
      await tester.pumpWidget(
        createTestWidget(
          isFirstLaunch: false,
          onNavigateToLogin: () => backPressed = true,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.arrow_back), findsOneWidget);

      await tester.tap(find.byIcon(Icons.arrow_back));
      await tester.pumpAndSettle();

      expect(backPressed, isTrue);
    });

    testWidgets('validates input constraints and password confirmation according to Figma',
        (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Enter 1-char name
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Hana Lestari'),
        'A',
      );
      // Enter malformed email
      await tester.enterText(
        find.widgetWithText(TextFormField, 'hana@example.com'),
        'bad-email',
      );
      // Enter short password
      final passwordFields = find.widgetWithText(TextFormField, '••••••••••');
      await tester.enterText(passwordFields.at(0), 'short');
      // Enter mismatched confirm password
      await tester.enterText(passwordFields.at(1), 'mismatch');

      // Tap 'Daftar' primary button
      final submitButton = find.widgetWithText(ElevatedButton, 'Daftar');
      await tester.ensureVisible(submitButton);
      await tester.tap(submitButton);
      await tester.pumpAndSettle();

      expect(find.text('Nama minimal 2 karakter.'), findsOneWidget);
      expect(find.text('Format email belum valid.'), findsOneWidget);
      expect(find.text('Kata sandi minimal 8 karakter'), findsOneWidget);
      expect(find.text('Kata sandi tidak sama.'), findsOneWidget);
      expect(find.text('Centang persetujuan untuk melanjutkan.'), findsOneWidget);
    });

    testWidgets('updates password strength indicator dynamically',
        (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      final passwordFields = find.widgetWithText(TextFormField, '••••••••••');

      // Empty
      expect(find.text('Kekuatan sandi: Belum diisi'), findsOneWidget);

      // Weak
      await tester.enterText(passwordFields.at(0), 'abc');
      await tester.pump();
      expect(find.text('Kekuatan sandi: Lemah'), findsOneWidget);

      // Moderate
      await tester.enterText(passwordFields.at(0), 'abcdefgh1');
      await tester.pump();
      expect(find.text('Kekuatan sandi: Cukup'), findsOneWidget);

      // Very Strong
      await tester.enterText(passwordFields.at(0), 'StrongP@ss123');
      await tester.pump();
      expect(find.text('Kekuatan sandi: Sangat Kuat'), findsOneWidget);
    });

    testWidgets('toggles agreement checkbox state',
        (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.check), findsNothing);

      // Tap checkbox container
      final checkbox = find.byKey(const Key('register_agreement_checkbox'));
      await tester.ensureVisible(checkbox);
      await tester.tap(checkbox);
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.check), findsOneWidget);
    });

    testWidgets('triggers onOpenTerms and onOpenPrivacy callbacks when tapped',
        (tester) async {
      var termsOpened = false;
      var privacyOpened = false;

      await tester.pumpWidget(
        createTestWidget(
          onOpenTerms: () => termsOpened = true,
          onOpenPrivacy: () => privacyOpened = true,
        ),
      );
      await tester.pumpAndSettle();

      final richTextFinder = find.byWidgetPredicate(
        (widget) =>
            widget is RichText &&
            widget.text.toPlainText().contains('Ketentuan Layanan'),
      );
      expect(richTextFinder, findsOneWidget);

      final richText = tester.widget<RichText>(richTextFinder);

      TextSpan? findSpan(InlineSpan root, String target) {
        if (root is TextSpan) {
          if (root.text == target) return root;
          if (root.children != null) {
            for (final child in root.children!) {
              final result = findSpan(child, target);
              if (result != null) return result;
            }
          }
        }
        return null;
      }

      final termsSpan = findSpan(richText.text, 'Ketentuan Layanan');
      expect(termsSpan, isNotNull);
      (termsSpan!.recognizer as TapGestureRecognizer?)?.onTap?.call();
      expect(termsOpened, isTrue);

      final privacySpan = findSpan(richText.text, 'Kebijakan Privasi');
      expect(privacySpan, isNotNull);
      (privacySpan!.recognizer as TapGestureRecognizer?)?.onTap?.call();
      expect(privacyOpened, isTrue);
    });
  });
}