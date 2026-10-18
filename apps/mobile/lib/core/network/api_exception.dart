import 'package:dio/dio.dart';

/// Structured API exception mapped from network and backend error responses.
class ApiException implements Exception {
  const ApiException({
    required this.message,
    this.statusCode,
    this.details,
    this.isConsentRequired = false,
    this.isUnauthorized = false,
  });

  /// User-friendly message explaining the error.
  final String message;

  /// HTTP status code if available.
  final int? statusCode;

  /// Raw backend error details.
  final dynamic details;

  /// True if error is 403 due to missing/revoked consent.
  final bool isConsentRequired;

  /// True if error is 401 due to missing/expired session.
  final bool isUnauthorized;

  /// Map a [DioException] to a domain [ApiException].
  factory ApiException.fromDioException(DioException error) {
    final response = error.response;
    final statusCode = response?.statusCode;
    final data = response?.data;

    String message = 'Terjadi kesalahan pada jaringan. Silakan coba lagi.';
    bool consentRequired = false;
    bool unauthorized = false;

    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError) {
      return const ApiException(
        message: 'Koneksi ke server terputus. Pastikan perangkat terhubung ke internet dan backend aktif di port 8000.',
        statusCode: null,
      );
    }

    if (statusCode != null) {
      if (statusCode == 401) {
        unauthorized = true;
        message = 'Sesi Anda telah berakhir. Silakan masuk kembali.';
      } else if (statusCode == 403) {
        consentRequired = true;
        message = 'Persetujuan pemrosesan data kesehatan diperlukan untuk melanjutkan.';
      } else if (statusCode == 422) {
        if (data is Map && data['detail'] != null) {
          final detail = data['detail'];
          if (detail is List && detail.isNotEmpty) {
            final first = detail.first;
            if (first is Map && first['msg'] != null) {
              message = first['msg'].toString();
            }
          } else if (detail is String) {
            message = detail;
          }
        } else {
          message = 'Data input tidak valid. Periksa kembali form Anda.';
        }
      } else if (statusCode >= 500) {
        message = 'Analisis sedang tidak tersedia, coba lagi.';
      } else if (data is Map && data['detail'] is String) {
        message = data['detail'] as String;
      }
    }

    return ApiException(
      message: message,
      statusCode: statusCode,
      details: data,
      isConsentRequired: consentRequired,
      isUnauthorized: unauthorized,
    );
  }

  @override
  String toString() => 'ApiException(statusCode: $statusCode, message: $message)';
}
