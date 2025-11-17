import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

/// Professional storage service handling both secure and regular storage
class StorageService {
  final FlutterSecureStorage secureStorage;
  final SharedPreferences sharedPreferences;

  StorageService({
    required this.secureStorage,
    required this.sharedPreferences,
  });

  // Secure Storage Methods (for sensitive data like tokens)
  Future<void> writeSecure(String key, String value) async {
    await secureStorage.write(key: key, value: value);
  }

  Future<String?> readSecure(String key) async {
    return await secureStorage.read(key: key);
  }

  Future<void> deleteSecure(String key) async {
    await secureStorage.delete(key: key);
  }

  Future<void> clearSecure() async {
    await secureStorage.deleteAll();
  }

  // Regular Storage Methods (for non-sensitive data)
  Future<bool> write(String key, dynamic value) async {
    if (value is String) {
      return await sharedPreferences.setString(key, value);
    } else if (value is int) {
      return await sharedPreferences.setInt(key, value);
    } else if (value is double) {
      return await sharedPreferences.setDouble(key, value);
    } else if (value is bool) {
      return await sharedPreferences.setBool(key, value);
    } else if (value is List<String>) {
      return await sharedPreferences.setStringList(key, value);
    } else {
      // Store as JSON string for complex objects
      return await sharedPreferences.setString(key, json.encode(value));
    }
  }

  T? read<T>(String key) {
    final value = sharedPreferences.get(key);
    if (value is T) {
      return value;
    }
    return null;
  }

  String? readString(String key) => sharedPreferences.getString(key);
  int? readInt(String key) => sharedPreferences.getInt(key);
  double? readDouble(String key) => sharedPreferences.getDouble(key);
  bool? readBool(String key) => sharedPreferences.getBool(key);
  List<String>? readStringList(String key) => sharedPreferences.getStringList(key);

  Future<bool> delete(String key) async {
    return await sharedPreferences.remove(key);
  }

  Future<bool> clear() async {
    return await sharedPreferences.clear();
  }

  bool containsKey(String key) {
    return sharedPreferences.containsKey(key);
  }

  // Token Management (secure)
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';

  Future<void> saveAccessToken(String token) async {
    await writeSecure(_accessTokenKey, token);
  }

  Future<String?> getAccessToken() async {
    return await readSecure(_accessTokenKey);
  }

  Future<void> saveRefreshToken(String token) async {
    await writeSecure(_refreshTokenKey, token);
  }

  Future<String?> getRefreshToken() async {
    return await readSecure(_refreshTokenKey);
  }

  Future<void> clearTokens() async {
    await deleteSecure(_accessTokenKey);
    await deleteSecure(_refreshTokenKey);
  }
}
