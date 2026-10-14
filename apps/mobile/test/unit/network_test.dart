import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:heliora_mobile/core/network/api_exception.dart';
import 'package:heliora_mobile/core/network/auth_interceptor.dart';

void main() {
  group('AuthInterceptor', () {
    test('injects Bearer token when tokenProvider returns a token', () async {
      final interceptor = AuthInterceptor(
        tokenProvider: () async => 'test-jwt-token-123',
      );

      final options = RequestOptions(path: '/api/v1/auth/me');
      final handler = RequestInterceptorHandler();

      await interceptor.onRequest(options, handler);

      expect(options.headers['Authorization'], equals('Bearer test-jwt-token-123'));
      expect(options.headers['Accept'], equals('application/json'));
    });

    test('preserves existing Authorization header if explicitly set', () async {
      final interceptor = AuthInterceptor(
        tokenProvider: () async => 'should-not-override-token',
      );

      final options = RequestOptions(
        path: '/api/v1/auth/me',
        headers: {'Authorization': 'Bearer custom-token'},
      );
      final handler = RequestInterceptorHandler();

      await interceptor.onRequest(options, handler);

      expect(options.headers['Authorization'], equals('Bearer custom-token'));
    });

    test('does not add Authorization header if token is null', () async {
      final interceptor = AuthInterceptor(
        tokenProvider: () async => null,
      );

      final options = RequestOptions(path: '/api/v1/health');
      final handler = RequestInterceptorHandler();

      await interceptor.onRequest(options, handler);

      expect(options.headers.containsKey('Authorization'), isFalse);
    });
  });

  group('ApiException', () {
    test('maps 401 response to unauthorized exception', () {
      final dioError = DioException(
        requestOptions: RequestOptions(path: '/api/v1/auth/me'),
        response: Response(
          requestOptions: RequestOptions(path: '/api/v1/auth/me'),
          statusCode: 401,
          data: {'detail': 'Not authenticated'},
        ),
      );

      final exception = ApiException.fromDioException(dioError);

      expect(exception.statusCode, equals(401));
      expect(exception.isUnauthorized, isTrue);
      expect(exception.isConsentRequired, isFalse);
    });

    test('maps 403 response to consent required exception', () {
      final dioError = DioException(
        requestOptions: RequestOptions(path: '/api/v1/assessment'),
        response: Response(
          requestOptions: RequestOptions(path: '/api/v1/assessment'),
          statusCode: 403,
          data: {'detail': 'Active consent required'},
        ),
      );

      final exception = ApiException.fromDioException(dioError);

      expect(exception.statusCode, equals(403));
      expect(exception.isConsentRequired, isTrue);
      expect(exception.isUnauthorized, isFalse);
    });

    test('maps timeout to user-friendly network message', () {
      final dioError = DioException(
        requestOptions: RequestOptions(path: '/api/v1/assessment'),
        type: DioExceptionType.connectionTimeout,
      );

      final exception = ApiException.fromDioException(dioError);

      expect(exception.statusCode, isNull);
      expect(exception.message, contains('Koneksi ke server'));
    });
  });
}
