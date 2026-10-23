import 'package:flutter_test/flutter_test.dart';
import 'package:heliora_mobile/core/api/generated/export.dart';
import 'package:heliora_mobile/core/utils/formatters.dart';

void main() {
  group('HelioraFormatters Unit Tests', () {
    test('formatDateShort formats ISO dates with Indonesian short month names', () {
      expect(
        HelioraFormatters.formatDateShort('2026-10-14T08:30:00Z'),
        equals('14 Okt 2026'),
      );
      expect(
        HelioraFormatters.formatDateShort('2026-01-01T00:00:00Z'),
        equals('1 Jan 2026'),
      );
      expect(
        HelioraFormatters.formatDateShort('invalid-date'),
        equals('invalid-date'),
      );
    });

    test('formatDateFull formats date and time with zero-padded minute', () {
      final dt = DateTime(2026, 10, 14, 8, 5);
      final formatted = HelioraFormatters.formatDateFull(dt);
      expect(formatted, contains('14 Oktober 2026'));
      expect(formatted, contains('08:05'));
    });

    test('formatSmokingStatus formats enum values accurately', () {
      expect(
        HelioraFormatters.formatSmokingStatus(SmokingStatusEnum.never, full: true),
        equals('Tidak pernah merokok'),
      );
      expect(
        HelioraFormatters.formatSmokingStatus(SmokingStatusEnum.never, full: false),
        equals('Tidak pernah'),
      );
      expect(
        HelioraFormatters.formatSmokingStatus(SmokingStatusEnum.former, full: true),
        equals('Mantan perokok (sudah berhenti)'),
      );
      expect(
        HelioraFormatters.formatSmokingStatus(SmokingStatusEnum.former, full: false),
        equals('Mantan perokok'),
      );
      expect(
        HelioraFormatters.formatSmokingStatus(SmokingStatusEnum.current, full: true),
        equals('Perokok aktif saat ini'),
      );
      expect(
        HelioraFormatters.formatSmokingStatus(SmokingStatusEnum.current, full: false),
        equals('Perokok aktif'),
      );
    });

    test('formatBmiCategory categorizes WHO Asia-Pacific BMI cutoffs', () {
      expect(HelioraFormatters.formatBmiCategory(17.5), equals('Berat Rendah'));
      expect(HelioraFormatters.formatBmiCategory(22.0), equals('Normal / Sehat'));
      expect(HelioraFormatters.formatBmiCategory(26.0), equals('Kelebihan Berat'));
      expect(HelioraFormatters.formatBmiCategory(31.0), equals('Obesitas'));
    });
  });
}
