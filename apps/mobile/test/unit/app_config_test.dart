import 'package:flutter_test/flutter_test.dart';
import 'package:heliora_mobile/core/config/app_config.dart';

void main() {
  group('AppConfig', () {
    test('loads default development configuration', () {
      final config = AppConfig.fromEnvironment();

      expect(config.apiBaseUrl, isNotEmpty);
      expect(config.supabaseUrl, contains('supabase.co'));
      expect(config.supabaseAnonKey, isNotEmpty);
      expect(config.authCallbackScheme, equals('id.heliora.app://login-callback'));
    });
  });
}
