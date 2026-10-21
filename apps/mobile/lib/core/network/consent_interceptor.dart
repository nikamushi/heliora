import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Global trigger incremented when a 403 response indicates missing or revoked consent.
final consentTriggerProvider = StateProvider<int>((ref) => 0);

/// Intercepts 403 Forbidden responses caused by missing or revoked medical consent
/// and triggers callback to redirect user to ConsentScreen (BR-CONSENT-001).
class ConsentInterceptor extends Interceptor {
  ConsentInterceptor({this.onConsentRequired});

  final VoidCallback? onConsentRequired;

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 403) {
      final data = err.response?.data;
      final msg = data is Map ? (data['detail'] ?? data['message'] ?? '').toString() : '';
      if (msg.toLowerCase().contains('consent') ||
          msg.toLowerCase().contains('persetujuan') ||
          msg.isEmpty) {
        onConsentRequired?.call();
      }
    }
    return handler.next(err);
  }
}
