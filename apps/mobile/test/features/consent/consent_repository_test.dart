import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:heliora_mobile/core/api/generated/export.dart';
import 'package:heliora_mobile/core/network/api_exception.dart';
import 'package:heliora_mobile/features/consent/data/consent_repository.dart';

class _MockDioAdapter implements HttpClientAdapter {
  _MockDioAdapter({required this.handler});

  final Future<ResponseBody> Function(RequestOptions options) handler;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<List<int>>? requestStream,
    Future<void>? cancelFuture,
  ) {
    return handler(options);
  }

  @override
  void close({bool force = false}) {}
}

void main() {
  group('ConsentRepository Unit Tests', () {
    late Dio dio;
    late HelioraApiClient apiClient;
    late ConsentRepository repository;

    setUp(() {
      dio = Dio(BaseOptions(baseUrl: 'https://api.heliora.test'));
      apiClient = HelioraApiClient(dio);
      repository = ConsentRepository(apiClient);
    });

    test('getConsentStatus returns active consent status successfully', () async {
      dio.httpClientAdapter = _MockDioAdapter(
        handler: (options) async {
          expect(options.path, equals('/api/v1/consent/status'));
          return ResponseBody.fromString(
            '{"has_active_consent": true, "terms_version": "1.0", "medical_disclaimer": "HELIORA adalah alat bantu..."}',
            200,
            headers: {
              Headers.contentTypeHeader: [Headers.jsonContentType],
            },
          );
        },
      );

      final status = await repository.getConsentStatus();
      expect(status.hasActiveConsent, isTrue);
      expect(status.termsVersion, equals('1.0'));
    });

    test('recordConsent sends version 1.0 and returns consent response', () async {
      dio.httpClientAdapter = _MockDioAdapter(
        handler: (options) async {
          expect(options.path, equals('/api/v1/consent'));
          expect(options.data['consent_version'], equals('1.0'));
          expect(options.data['agreed'], isTrue);
          return ResponseBody.fromString(
            '{"id": "c-123", "user_id": "u-456", "consent_version": "1.0", "accepted_at": "2026-10-12T00:00:00Z", "is_active": true}',
            200,
            headers: {
              Headers.contentTypeHeader: [Headers.jsonContentType],
            },
          );
        },
      );

      final result = await repository.recordConsent(consentVersion: '1.0');
      expect(result.id, equals('c-123'));
      expect(result.isActive, isTrue);
    });

    test('throws ApiException on Dio error', () async {
      dio.httpClientAdapter = _MockDioAdapter(
        handler: (options) async {
          return ResponseBody.fromString(
            '{"detail": "Consent already active"}',
            400,
            headers: {
              Headers.contentTypeHeader: [Headers.jsonContentType],
            },
          );
        },
      );

      expect(
        () => repository.getConsentStatus(),
        throwsA(isA<ApiException>()),
      );
    });
  });
}
