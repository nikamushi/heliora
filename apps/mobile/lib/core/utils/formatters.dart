import '../api/generated/export.dart';

/// Centralized utility for consistent localization and domain formatting across HELIORA mobile.
abstract class HelioraFormatters {
  static const List<String> _shortMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];

  static const List<String> _fullMonths = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  /// Formats an ISO-8601 date string to short Indonesian display (e.g. "24 Okt 2026").
  static String formatDateShort(String? isoString) {
    if (isoString == null || isoString.isEmpty) return '-';
    final parsed = DateTime.tryParse(isoString);
    if (parsed == null) return isoString;

    final local = parsed.toLocal();
    final month = (local.month >= 1 && local.month <= 12)
        ? _shortMonths[local.month - 1]
        : local.month.toString();
    return '${local.day} $month ${local.year}';
  }

  /// Formats a [DateTime] into full date with 24h WIB time (e.g. "24 Oktober 2026, 14:30 WIB").
  static String formatDateFull(DateTime? dt) {
    if (dt == null) return '-';
    final local = dt.toLocal();
    final month = (local.month >= 1 && local.month <= 12)
        ? _fullMonths[local.month - 1]
        : local.month.toString();
    final hour = local.hour.toString().padLeft(2, '0');
    final minute = local.minute.toString().padLeft(2, '0');
    return '${local.day} $month ${local.year}, $hour:$minute WIB';
  }

  /// Returns localized descriptive label for smoking status.
  static String formatSmokingStatus(dynamic status, {bool full = true}) {
    String key = '';
    if (status is SmokingStatusEnum) {
      key = status.name;
    } else if (status is String) {
      key = status.toLowerCase();
    }

    switch (key) {
      case 'never':
        return full ? 'Tidak pernah merokok' : 'Tidak pernah';
      case 'former':
        return full ? 'Mantan perokok (sudah berhenti)' : 'Mantan perokok';
      case 'current':
        return full ? 'Perokok aktif saat ini' : 'Perokok aktif';
      default:
        return 'Tidak ditentukan';
    }
  }

  /// Derives human-friendly BMI category string using canonical Indonesian health guidelines.
  static String formatBmiCategory(double bmi) {
    if (bmi < 18.5) return 'Berat Rendah';
    if (bmi < 25.0) return 'Normal / Sehat';
    if (bmi < 30.0) return 'Kelebihan Berat';
    return 'Obesitas';
  }
}
