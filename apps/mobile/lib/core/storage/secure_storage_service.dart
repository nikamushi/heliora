import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Secure token and sensitive data storage backed by hardware Keystore
/// via EncryptedSharedPreferences on Android and Keychain on iOS / macOS.
class SecureStorageService {
  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: true,
              ),
              wOptions: WindowsOptions(),
            );

  final FlutterSecureStorage _storage;

  /// Read a secure value by [key].
  Future<String?> read(String key) async {
    return _storage.read(key: key);
  }

  /// Write a secure [value] by [key].
  Future<void> write(String key, String value) async {
    await _storage.write(key: key, value: value);
  }

  /// Delete a secure value by [key].
  Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }

  /// Wipe all secure keys in storage.
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}

/// Custom [LocalStorage] adapter that persists Supabase auth sessions
/// into [SecureStorageService] (PRD-Mobile §10).
class SecureSupabaseLocalStorage extends LocalStorage {
  SecureSupabaseLocalStorage({SecureStorageService? storageService})
      : _storage = storageService ?? SecureStorageService();

  final SecureStorageService _storage;
  static const _sessionKey = 'heliora_supabase_persisted_session';

  @override
  Future<void> initialize() async {}

  @override
  Future<bool> hasAccessToken() async {
    final sessionStr = await _storage.read(_sessionKey);
    if (sessionStr == null || sessionStr.isEmpty) return false;
    try {
      final decoded = jsonDecode(sessionStr);
      if (decoded is Map<String, dynamic>) {
        return true;
      }
      await removePersistedSession();
      return false;
    } catch (_) {
      await removePersistedSession();
      return false;
    }
  }

  @override
  Future<String?> accessToken() async {
    final sessionStr = await _storage.read(_sessionKey);
    if (sessionStr == null || sessionStr.isEmpty) return null;
    try {
      final decoded = jsonDecode(sessionStr);
      if (decoded is! Map<String, dynamic>) {
        await removePersistedSession();
        return null;
      }
      final accessToken = decoded['currentSession']?['access_token'] as String?;
      return accessToken ?? decoded['access_token'] as String?;
    } catch (_) {
      await removePersistedSession();
      return null;
    }
  }

  @override
  Future<void> persistSession(String persistSessionString) async {
    try {
      final decoded = jsonDecode(persistSessionString);
      if (decoded is Map) {
        await _storage.write(_sessionKey, persistSessionString);
      }
    } catch (_) {
      // Do not store non-JSON token string as session
    }
  }

  @override
  Future<void> removePersistedSession() async {
    await _storage.delete(_sessionKey);
  }
}
