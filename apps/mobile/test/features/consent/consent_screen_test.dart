import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:heliora_mobile/core/api/generated/export.dart';
import 'package:heliora_mobile/features/consent/data/consent_repository.dart';
import 'package:heliora_mobile/features/consent/presentation/consent_screen.dart';
import 'package:heliora_mobile/theme/components.dart';

class _FakeConsentRepository implements ConsentRepository {
  var recordCalled = false;
  var targetVersion = '';

  @override
  Future<ConsentStatusResponse> getConsentStatus() async {
    return const ConsentStatusResponse(hasActiveConsent: false);
  }

  @override
  Future<ConsentResponse> recordConsent({String consentVersion = '1.0'}) async {
    recordCalled = true;
    targetVersion = consentVersion;
    return ConsentResponse(
      id: 'test-consent-id',
      userId: 'test-user-id',
      consentVersion: consentVersion,
      acceptedAt: DateTime.now(),
      isActive: true,
    );
  }

  @override
  Future<ConsentResponse> revokeConsent() async {
    return ConsentResponse(
      id: 'test-consent-id',
      userId: 'test-user-id',
      consentVersion: '1.0',
      acceptedAt: DateTime.now(),
      revokedAt: DateTime.now(),
      isActive: false,
    );
  }
}

void main() {
  group('ConsentScreen Widget Tests (Figma Alur 2 Node 77:357)', () {
    late _FakeConsentRepository fakeRepository;

    setUp(() {
      fakeRepository = _FakeConsentRepository();
    });

    Widget createTestWidget({VoidCallback? onConsentGranted}) {
      return ProviderScope(
        overrides: [
          consentRepositoryProvider.overrideWithValue(fakeRepository),
        ],
        child: MaterialApp(
          home: ConsentScreen(onConsentGranted: onConsentGranted),
        ),
      );
    }

    testWidgets('renders all Figma header, benefit tiles, and statutory disclaimer',
        (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Brand & Eyebrow
      expect(find.text('HELIORA'), findsOneWidget);
      expect(find.text('LANGKAH 01 / 02 · PERSETUJUAN DATA'), findsOneWidget);
      expect(find.text('Sebelum memulai asesmen'), findsOneWidget);
      expect(
        find.text('HELIORA memakai data gaya hidup Anda untuk empat hal berikut.'),
        findsOneWidget,
      );

      // 4 Benefit Tiles
      expect(find.text('Estimasi risiko'), findsOneWidget);
      expect(
        find.text(
          'Estimasi risiko diabetes, hipertensi, dan kardiovaskular dari gaya hidup Anda.',
        ),
        findsOneWidget,
      );
      expect(find.text('Health & Lifestyle Score'), findsOneWidget);
      expect(
        find.text('Skor ringkas kualitas gaya hidup, dijelaskan dengan bahasa awam.'),
        findsOneWidget,
      );
      expect(find.text('Simulasi'), findsOneWidget);
      expect(
        find.text('Coba ubah kebiasaan dan lihat arah estimasi risikonya.'),
        findsOneWidget,
      );
      expect(find.text('Rekomendasi preventif'), findsOneWidget);
      expect(
        find.text('Saran pencegahan yang merujuk pada pedoman klinis.'),
        findsOneWidget,
      );

      // Statutory Medical Disclaimer (Design.md §2.6 verbatim)
      expect(
        find.text(
          'HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. '
          'Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data '
          'dan model yang digunakan, bukan diagnosis medis dan bukan pengganti '
          'konsultasi tenaga kesehatan.',
        ),
        findsOneWidget,
      );

      // Agreement Checkbox & Note
      expect(
        find.text(
          'Saya memahami dan menyetujui pemrosesan data gaya hidup saya '
          'untuk tujuan estimasi risiko preventif.',
        ),
        findsOneWidget,
      );
      expect(
        find.text('Anda bisa mencabut persetujuan kapan saja di halaman Profil.'),
        findsOneWidget,
      );
    });

    testWidgets('submit button is disabled until consent checkbox is agreed',
        (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      final buttonFinder = find.widgetWithText(ElevatedButton, 'Lanjut ke profil kesehatan');
      expect(buttonFinder, findsOneWidget);

      final buttonWidget = tester.widget<ElevatedButton>(buttonFinder);
      expect(buttonWidget.onPressed, isNull); // Disabled state

      // Scroll and tap checkbox
      final checkboxFinder = find.text(
        'Saya memahami dan menyetujui pemrosesan data gaya hidup saya '
        'untuk tujuan estimasi risiko preventif.',
      );
      await tester.ensureVisible(checkboxFinder);
      await tester.tap(checkboxFinder);
      await tester.pumpAndSettle();

      // Checkbox is now checked
      expect(
        find.byWidgetPredicate(
          (widget) => widget is HelioraIcon && widget.assetPath == HelioraIcons.check,
        ),
        findsOneWidget,
      );

      // Button is now enabled
      final enabledButton = tester.widget<ElevatedButton>(buttonFinder);
      expect(enabledButton.onPressed, isNotNull);
    });

    testWidgets('tapping enabled submit button records consent and invokes callback',
        (tester) async {
      var callbackInvoked = false;
      await tester.pumpWidget(
        createTestWidget(onConsentGranted: () => callbackInvoked = true),
      );
      await tester.pumpAndSettle();

      // Tap checkbox to enable button
      final checkboxFinder = find.text(
        'Saya memahami dan menyetujui pemrosesan data gaya hidup saya '
        'untuk tujuan estimasi risiko preventif.',
      );
      await tester.ensureVisible(checkboxFinder);
      await tester.tap(checkboxFinder);
      await tester.pumpAndSettle();

      // Tap submit button
      final buttonFinder = find.widgetWithText(ElevatedButton, 'Lanjut ke profil kesehatan');
      await tester.ensureVisible(buttonFinder);
      await tester.tap(buttonFinder);
      await tester.pumpAndSettle();

      expect(fakeRepository.recordCalled, isTrue);
      expect(fakeRepository.targetVersion, equals('1.0'));
      expect(callbackInvoked, isTrue);
    });
  });
}
