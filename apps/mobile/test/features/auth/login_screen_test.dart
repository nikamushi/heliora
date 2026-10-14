import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:heliora_mobile/features/auth/presentation/login_screen.dart';
import 'package:heliora_mobile/theme/components.dart';

void main() {
  Widget createTestWidget({VoidCallback? onNavigateToRegister}) {
    return ProviderScope(
      child: MaterialApp(
        home: LoginScreen(onNavigateToRegister: onNavigateToRegister),
      ),
    );
  }

  group('LoginScreen Widget Tests (Figma Alur 1)', () {
    testWidgets('renders all initial fields, labels, logo, and action buttons',
        (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byType(HelioraLogo), findsOneWidget);
      expect(find.text('Masuk ke HELIORA'), findsOneWidget);
      expect(find.text('Lanjutkan asesmen gaya hidup Anda.'), findsOneWidget);
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Kata sandi'), findsOneWidget);
      expect(find.widgetWithText(ElevatedButton, 'Masuk'), findsOneWidget);
      expect(find.text('Lanjutkan dengan Google'), findsOneWidget);
      expect(find.text('Belum punya akun? '), findsOneWidget);
      expect(find.text('Daftar'), findsOneWidget);
      expect(
        find.text('Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi.'),
        findsOneWidget,
      );
    });

    testWidgets('validates required email and password fields on submit',
        (tester) async {
      await tester.pumpWidget(createTestWidget());

      // Tap 'Masuk' button
      await tester.tap(find.widgetWithText(ElevatedButton, 'Masuk'));
      await tester.pumpAndSettle();

      expect(find.text('Alamat email wajib diisi'), findsOneWidget);
      expect(find.text('Kata sandi wajib diisi'), findsOneWidget);
    });

    testWidgets('validates malformed email address and short password',
        (tester) async {
      await tester.pumpWidget(createTestWidget());

      // Enter malformed email
      await tester.enterText(
        find.widgetWithText(TextFormField, 'nama@email.com'),
        'invalid-email',
      );
      // Enter short password
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Masukkan kata sandi'),
        'short',
      );

      await tester.tap(find.widgetWithText(ElevatedButton, 'Masuk'));
      await tester.pumpAndSettle();

      expect(find.text('Format email tidak valid'), findsOneWidget);
      expect(find.text('Kata sandi minimal 8 karakter'), findsOneWidget);
    });

    testWidgets('calls onNavigateToRegister when link is pressed',
        (tester) async {
      var navigated = false;
      await tester.pumpWidget(
        createTestWidget(onNavigateToRegister: () => navigated = true),
      );

      await tester.tap(find.text('Daftar'));
      await tester.pump();

      expect(navigated, isTrue);
    });

    testWidgets('toggles password visibility when eye icon is pressed',
        (tester) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byIcon(Icons.visibility_outlined), findsOneWidget);

      await tester.tap(find.byIcon(Icons.visibility_outlined));
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.visibility_off_outlined), findsOneWidget);
    });
  });
}
