import 'package:dio/dio.dart';
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
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      sendTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  dio.interceptors.add(AuthInterceptor(tokenProvider: tokenProvider));

  if (additionalInterceptors != null) {
    dio.interceptors.addAll(additionalInterceptors);
  }

  return dio;
}
