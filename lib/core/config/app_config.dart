import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

/// Environment configuration for the application
class AppConfig {
  // API Configuration
  static String get apiBaseUrl {
    final envUrl = dotenv.env['API_BASE_URL'];
    if (envUrl != null && envUrl.isNotEmpty) {
      return envUrl;
    }
    
    // For Android emulator, use 10.0.2.2 instead of localhost
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:8080';
    }
    
    // Default for web and other platforms
    return 'http://localhost:8080';
  }
  static int get apiTimeout => int.parse(dotenv.env['API_TIMEOUT'] ?? '30000');

  // OpenAI Configuration
  static String get openAIApiKey => dotenv.env['OPENAI_API_KEY'] ?? '';
  static String get openAIModel => dotenv.env['OPENAI_MODEL'] ?? 'gpt-4';

  // Environment
  static String get environment => dotenv.env['ENV'] ?? 'development';
  static bool get isProduction => environment == 'production';
  static bool get isDevelopment => environment == 'development';
  static bool get debugMode => dotenv.env['DEBUG_MODE'] == 'true';

  // Feature Flags
  static bool get enableAnalytics => dotenv.env['ENABLE_ANALYTICS'] == 'true';
  static bool get enableCrashReporting => dotenv.env['ENABLE_CRASH_REPORTING'] == 'true';
  static bool get enablePushNotifications => dotenv.env['ENABLE_PUSH_NOTIFICATIONS'] == 'true';

  // Sentry Configuration
  static String get sentryDsn => dotenv.env['SENTRY_DSN'] ?? '';

  /// Initialize environment configuration
  static Future<void> initialize() async {
    try {
      await dotenv.load(fileName: '.env');
    } catch (e) {
      // .env file not found - use default values
      // This is normal for web or when .env is not deployed
      // Note: Logger not available here during initialization
      // Consider using a static logger or deferring this message
    }
  }
}
