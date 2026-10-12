import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Key for storing non-sensitive first launch flag (PRD §8, MFR-012).
const String kHasLaunchedBeforeKey = 'has_launched_before';

/// Service managing non-sensitive local user preferences.
class PreferencesService {
  PreferencesService(this._prefs);

  final SharedPreferences _prefs;

  /// Returns true if the app has ever been launched previously.
  bool get hasLaunchedBefore => _prefs.getBool(kHasLaunchedBeforeKey) ?? false;

  /// Marks that the app has been launched at least once.
  Future<bool> setHasLaunchedBefore([bool value = true]) async {
    return _prefs.setBool(kHasLaunchedBeforeKey, value);
  }
}

/// Provider for raw SharedPreferences instance, overridden at app startup.
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('sharedPreferencesProvider must be overridden in ProviderScope');
});

/// Provider for PreferencesService.
final preferencesServiceProvider = Provider<PreferencesService>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return PreferencesService(prefs);
});

/// Notifier tracking whether current session represents the first launch after install.
class FirstLaunchNotifier extends StateNotifier<bool> {
  FirstLaunchNotifier(this._service)
      : super(!_service.hasLaunchedBefore);

  final PreferencesService _service;

  /// Marks first launch complete and updates persistent preference.
  Future<void> markLaunched() async {
    if (!state) return;
    await _service.setHasLaunchedBefore(true);
    state = false;
  }
}

/// StateNotifierProvider exposing boolean flag indicating if app is on first launch.
final isFirstLaunchProvider = StateNotifierProvider<FirstLaunchNotifier, bool>((ref) {
  final service = ref.watch(preferencesServiceProvider);
  return FirstLaunchNotifier(service);
});
