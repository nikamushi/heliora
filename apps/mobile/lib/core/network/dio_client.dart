import 'dart:io';

import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import 'auth_interceptor.dart';

/// Create and configure the shared Dio HTTP client for Heliora API.
Dio createDioClient({
  required AppConfig config,
  TokenProvider? tokenProvider,
  List<Interceptor>? additionalInterceptors,
}) {
  final dio = Dio(
    BaseOptions(
      baseUrl: config.apiBaseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  // Configure TLS certificate trust on native mobile platforms (Android / iOS).
  // This prevents HandshakeException (CERTIFICATE_VERIFY_FAILED) on older devices
  // whose system CA stores lack Let's Encrypt ECDSA cross-signs (YE1 / ISRG Root X2/YE).
  if (!kIsWeb) {
    dio.httpClientAdapter = IOHttpClientAdapter(
      createHttpClient: () {
        final client = HttpClient();
        client.connectionTimeout = const Duration(seconds: 30);
        client.badCertificateCallback = (X509Certificate cert, String host, int port) {
          if (host == 'api.heliora.software' ||
              host.endsWith('.heliora.software') ||
              host == 'heliora.software' ||
              host == '10.0.2.2' ||
              host == 'localhost' ||
              host == '127.0.0.1') {
            return true;
          }
          return false;
        };
        return client;
      },
    );
  }

  dio.interceptors.add(AuthInterceptor(tokenProvider: tokenProvider));

  if (additionalInterceptors != null) {
    dio.interceptors.addAll(additionalInterceptors);
  }

  return dio;
}
