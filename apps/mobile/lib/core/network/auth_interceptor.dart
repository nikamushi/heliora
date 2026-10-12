import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

typedef TokenProvider = Future<String?> Function();

/// Dio Interceptor that automatically injects the Supabase JWT Bearer token
/// into outgoing requests if not already specified.
class AuthInterceptor extends Interceptor {
  AuthInterceptor({TokenProvider? tokenProvider})
      : _tokenProvider = tokenProvider ?? _defaultTokenProvider;

  final TokenProvider _tokenProvider;

  static Future<String?> _defaultTokenProvider() async {
    try {
      final session = Supabase.instance.client.auth.currentSession;
      return session?.accessToken;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    options.headers['Accept'] = 'application/json';

    // Inject Bearer token if not already present
    if (!options.headers.containsKey('Authorization')) {
      final token = await _tokenProvider();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }

    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // We can intercept 401s here if global logout notification is needed
    return handler.next(err);
  }
}
