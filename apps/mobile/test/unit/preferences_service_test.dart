import 'package:flutter_test/flutter_test.dart';
import 'package:heliora_mobile/core/storage/preferences_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('PreferencesService Unit Tests', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('defaults hasLaunchedBefore to false when key does not exist', () async {
      final prefs = await SharedPreferences.getInstance();
      final service = PreferencesService(prefs);

      expect(service.hasLaunchedBefore, isFalse);
    });

    test('sets and reads hasLaunchedBefore correctly', () async {
      final prefs = await SharedPreferences.getInstance();
      final service = PreferencesService(prefs);

      await service.setHasLaunchedBefore(true);
      expect(service.hasLaunchedBefore, isTrue);

      await service.setHasLaunchedBefore(false);
      expect(service.hasLaunchedBefore, isFalse);
    });
  });
}
