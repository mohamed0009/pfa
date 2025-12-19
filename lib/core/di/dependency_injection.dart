import 'package:get_it/get_it.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:logger/logger.dart';

import '../services/auth_service.dart';
import '../services/ai_coach_service.dart';
import '../services/conversation_service.dart';
import '../services/learning_service.dart';
import '../services/storage_service.dart';
import '../services/api_service.dart';
import '../services/logger_service.dart';
import '../providers/user_provider.dart';
import '../services/trainer_service.dart';
import '../../features/dashboard/services/admin_service.dart';

final getIt = GetIt.instance;

/// Setup dependency injection for the application
Future<void> setupDependencyInjection() async {
  // Core services
  getIt.registerLazySingleton<Logger>(() => Logger(
        printer: PrettyPrinter(
          methodCount: 2,
          errorMethodCount: 8,
          lineLength: 120,
          colors: true,
          printEmojis: true,
        ),
      ));

  getIt.registerLazySingleton<LoggerService>(
    () => LoggerService(getIt<Logger>()),
  );

  // Storage
  final prefs = await SharedPreferences.getInstance();
  getIt.registerLazySingleton<SharedPreferences>(() => prefs);

  getIt.registerLazySingleton<FlutterSecureStorage>(
    () => const FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true),
      iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
    ),
  );

  getIt.registerLazySingleton<StorageService>(
    () => StorageService(
      secureStorage: getIt<FlutterSecureStorage>(),
      sharedPreferences: getIt<SharedPreferences>(),
    ),
  );

  // Network
  getIt.registerLazySingleton<Dio>(() {
    final dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
    ));
    return dio;
  });

  getIt.registerLazySingleton<ApiService>(
    () => ApiService(
      dio: getIt<Dio>(),
      logger: getIt<LoggerService>(),
      storage: getIt<StorageService>(),
    ),
  );

  // Business services
  getIt.registerLazySingleton<AuthService>(
    () => AuthService(
      storage: getIt<StorageService>(),
      apiService: getIt<ApiService>(),
      logger: getIt<LoggerService>(),
    ),
  );

  getIt.registerLazySingleton<AICoachService>(
    () => AICoachService(
      apiService: getIt<ApiService>(),
      logger: getIt<LoggerService>(),
    ),
  );

  getIt.registerLazySingleton<ConversationService>(
    () => ConversationService(
      apiService: getIt<ApiService>(),
      logger: getIt<LoggerService>(),
    ),
  );

  getIt.registerLazySingleton<LearningService>(
    () => LearningService(
      storage: getIt<StorageService>(),
      logger: getIt<LoggerService>(),
    ),
  );

  getIt.registerLazySingleton<TrainerService>(
    () => TrainerService(),
  );

  getIt.registerLazySingleton<AdminService>(
    () => AdminService(),
  );

  // Providers
  getIt.registerLazySingleton<UserProvider>(
    () => UserProvider(authService: getIt<AuthService>()),
  );
}
