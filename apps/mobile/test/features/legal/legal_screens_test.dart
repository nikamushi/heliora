import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:heliora_mobile/features/legal/presentation/privacy_screen.dart';
import 'package:heliora_mobile/features/legal/presentation/terms_screen.dart';

void main() {
  group('TermsScreen Widget Tests', () {
    testWidgets('renders all statutory terms sections and version metadata', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: TermsScreen(),
        ),
      );

      expect(find.text('Ketentuan Layanan'), findsOneWidget); // AppBar
      expect(find.text('KETENTUAN LAYANAN'), findsOneWidget); // Header Eyebrow
      expect(find.text('Perjanjian Penggunaan Platform HELIORA'), findsOneWidget);
      expect(find.textContaining('Versi 1.2'), findsOneWidget);

      // Section titles
      expect(find.text('1. Disclaimer Medis'), findsOneWidget);
      expect(find.text('2. Ruang Lingkup Layanan'), findsOneWidget);
      expect(find.text('3. Syarat Usia'), findsOneWidget);
      expect(find.text('4. Penggunaan yang Dilarang'), findsOneWidget);
      expect(find.text('5. Keamanan Akun'), findsOneWidget);
      expect(find.text('6. Tentang Estimasi AI'), findsOneWidget);
      expect(find.text('7. Hak Kekayaan Intelektual'), findsOneWidget);
      expect(find.text('8. Batasan Tanggung Jawab'), findsOneWidget);
      expect(find.text('9. Penutupan dan Penangguhan Akun'), findsOneWidget);
      expect(find.text('10. Perubahan Ketentuan'), findsOneWidget);
      expect(find.text('11. Hukum dan Sengketa'), findsOneWidget);
      expect(find.text('12. Kontak dan Bantuan'), findsOneWidget);

      // Statutory emergency disclaimers
      expect(find.textContaining('112 (darurat umum)'), findsOneWidget);
      expect(find.textContaining('support@heliora.id'), findsAtLeastNWidgets(1));
    });

    testWidgets('tapping back button navigates back', (tester) async {
      var popped = false;
      await tester.pumpWidget(
        MaterialApp(
          home: TermsScreen(onBack: () => popped = true),
        ),
      );

      final backButton = find.byIcon(Icons.arrow_back);
      expect(backButton, findsOneWidget);
      await tester.tap(backButton);
      await tester.pumpAndSettle();

      expect(popped, isTrue);
    });
  });

  group('PrivacyScreen Widget Tests', () {
    testWidgets('renders privacy principles, data table, and statutory sections', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: PrivacyScreen(),
        ),
      );

      expect(find.text('Kebijakan Privasi'), findsOneWidget); // AppBar
      expect(find.text('KEBIJAKAN PRIVASI'), findsOneWidget); // Header Eyebrow
      expect(find.text('Pelindungan Data Pribadi HELIORA'), findsOneWidget);
      expect(find.textContaining('UU No. 27 Tahun 2022'), findsOneWidget);

      // Principles summary
      expect(find.text('Ringkasan Prinsip Privasi'), findsOneWidget);
      expect(find.textContaining('Kami hanya mengumpulkan data yang diperlukan'), findsOneWidget);

      // Data categories
      expect(find.text('Akun'), findsOneWidget);
      expect(find.text('Fisik'), findsOneWidget);
      expect(find.text('Gaya Hidup'), findsOneWidget);
      expect(find.text('Riwayat Keluarga'), findsOneWidget);
      expect(find.text('Biomarker'), findsOneWidget);
      expect(find.text('Teknis'), findsOneWidget);

      // Sections
      expect(find.text('1. Dasar Hukum dan Ruang Lingkup'), findsOneWidget);
      expect(find.text('2. Data yang Dikumpulkan'), findsOneWidget);
      expect(find.text('3. Tujuan Penggunaan Data'), findsOneWidget);
      expect(find.text('4. Keamanan dan Enkripsi Data'), findsOneWidget);
      expect(find.text('5. Masa Simpan Data'), findsOneWidget);
      expect(find.text('6. Hak Subjek Data Pribadi'), findsOneWidget);
      expect(find.text('7. Layanan AI dan Pemrosesan Data'), findsOneWidget);
      expect(find.text('8. Penarikan Persetujuan & Hapus Akun'), findsOneWidget);
      expect(find.text('9. Batasan Usia Pengguna'), findsOneWidget);
      expect(find.text('10. Perubahan Kebijakan Privasi'), findsOneWidget);
      expect(find.text('11. Kontak Pejabat Pelindungan Data'), findsOneWidget);

      // Security and Contact details
      expect(find.textContaining('AES-256'), findsAtLeastNWidgets(1));
      expect(find.textContaining('TLS 1.3'), findsAtLeastNWidgets(1));
      expect(find.textContaining('dpo@heliora.id'), findsOneWidget);
    });

    testWidgets('tapping back button navigates back from privacy', (tester) async {
      var popped = false;
      await tester.pumpWidget(
        MaterialApp(
          home: PrivacyScreen(onBack: () => popped = true),
        ),
      );

      final backButton = find.byIcon(Icons.arrow_back);
      expect(backButton, findsOneWidget);
      await tester.tap(backButton);
      await tester.pumpAndSettle();

      expect(popped, isTrue);
    });
  });
}
