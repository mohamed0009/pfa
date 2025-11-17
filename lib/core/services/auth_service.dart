import 'dart:convert';
import 'package:uuid/uuid.dart';
import '../models/user_model.dart';
import 'storage_service.dart';
import 'api_service.dart';
import 'logger_service.dart';
import '../errors/result.dart';
import '../errors/app_exception.dart';

class AuthService {
  final StorageService storage;
  final ApiService apiService;
  final LoggerService logger;
  final _uuid = const Uuid();

  static const String _usersKey = 'users';

  AuthService({
    required this.storage,
    required this.apiService,
    required this.logger,
  });

  // Mock users database - In production, use real API
  Future<List<UserModel>> _getAllUsers() async {
    final usersJson = storage.readString(_usersKey);
    if (usersJson != null) {
      final List<dynamic> decoded = json.decode(usersJson);
      return decoded.map((u) => UserModel.fromJson(u)).toList();
    }

    // Initialize with default users
    final defaultUsers = [
      UserModel(
        id: _uuid.v4(),
        email: 'admin@example.com',
        name: 'Administrator',
        role: UserRole.admin,
        createdAt: DateTime.now(),
        preferences: {},
      ),
      UserModel(
        id: _uuid.v4(),
        email: 'trainer@example.com',
        name: 'Trainer',
        role: UserRole.trainer,
        createdAt: DateTime.now(),
        preferences: {},
      ),
      UserModel(
        id: _uuid.v4(),
        email: 'learner@example.com',
        name: 'Learner',
        role: UserRole.learner,
        formation: 'Formation de base',
        level: 'Débutant',
        createdAt: DateTime.now(),
        preferences: {},
      ),
    ];

    await _saveAllUsers(defaultUsers);
    return defaultUsers;
  }

  Future<void> _saveAllUsers(List<UserModel> users) async {
    final usersJson = json.encode(users.map((u) => u.toJson()).toList());
    await storage.write(_usersKey, usersJson);
  }

  /// Login with email and password
  /// Returns Result<UserModel> for type-safe error handling
  Future<Result<UserModel>> login(String email, String password) async {
    try {
      logger.logUserAction('login_attempt', metadata: {'email': email});

      // Simulate API delay
      await Future.delayed(const Duration(seconds: 1));

      // In production, replace with:
      // final response = await apiService.post<Map<String, dynamic>>(
      //   '/auth/login',
      //   data: {'email': email, 'password': password},
      // );
      // final user = UserModel.fromJson(response['user']);
      // await storage.saveAccessToken(response['accessToken']);
      // await storage.saveRefreshToken(response['refreshToken']);

      final users = await _getAllUsers();
      final user = users.firstWhere(
        (u) => u.email == email,
        orElse: () => throw NotFoundException('User not found'),
      );

      // In real app, verify password here
      await _saveCurrentUser(user);
      logger.info('User logged in successfully: ${user.email}');

      return Success(user);
    } on AppException catch (e) {
      logger.error('Login failed', e);
      return Failure(e.message, e);
    } catch (e) {
      logger.error('Unexpected login error', e);
      return Failure('Login failed: ${e.toString()}');
    }
  }

  /// Register new user
  Future<Result<UserModel>> register({
    required String email,
    required String password,
    required String name,
    UserRole role = UserRole.learner,
  }) async {
    try {
      logger.logUserAction('register_attempt', metadata: {'email': email});

      await Future.delayed(const Duration(seconds: 1));

      // In production, replace with:
      // final response = await apiService.post<Map<String, dynamic>>(
      //   '/auth/register',
      //   data: {
      //     'email': email,
      //     'password': password,
      //     'name': name,
      //     'role': role.toString(),
      //   },
      // );

      final users = await _getAllUsers();
      if (users.any((u) => u.email == email)) {
        throw BadRequestException('Email already exists');
      }

      final newUser = UserModel(
        id: _uuid.v4(),
        email: email,
        name: name,
        role: role,
        createdAt: DateTime.now(),
        preferences: {},
      );

      users.add(newUser);
      await _saveAllUsers(users);
      await _saveCurrentUser(newUser);

      logger.info('User registered successfully: ${newUser.email}');
      return Success(newUser);
    } on AppException catch (e) {
      logger.error('Registration failed', e);
      return Failure(e.message, e);
    } catch (e) {
      logger.error('Unexpected registration error', e);
      return Failure('Registration failed: ${e.toString()}');
    }
  }

  Future<void> _saveCurrentUser(UserModel user) async {
    // Save to secure storage in production
    await storage.write('current_user', json.encode(user.toJson()));
  }

  /// Get currently logged in user
  Future<UserModel?> getCurrentUser() async {
    try {
      final userJson = storage.readString('current_user');
      if (userJson != null) {
        return UserModel.fromJson(json.decode(userJson));
      }
    } catch (e) {
      logger.error('Failed to get current user', e);
    }
    return null;
  }

  /// Logout current user
  Future<void> logout() async {
    try {
      logger.logUserAction('logout');
      await storage.delete('current_user');
      await storage.clearTokens();
      logger.info('User logged out successfully');
    } catch (e) {
      logger.error('Logout failed', e);
    }
  }

  /// Update user profile
  Future<Result<UserModel>> updateProfile({
    required String userId,
    String? name,
    String? formation,
    String? level,
    Map<String, dynamic>? preferences,
  }) async {
    try {
      logger.logUserAction('update_profile', metadata: {'userId': userId});

      await Future.delayed(const Duration(milliseconds: 500));

      // In production, replace with:
      // final response = await apiService.put<Map<String, dynamic>>(
      //   '/users/$userId',
      //   data: {
      //     'name': name,
      //     'formation': formation,
      //     'level': level,
      //     'preferences': preferences,
      //   },
      // );

      final users = await _getAllUsers();
      final userIndex = users.indexWhere((u) => u.id == userId);
      if (userIndex == -1) {
        throw NotFoundException('User not found');
      }

      final updatedUser = users[userIndex].copyWith(
        name: name,
        formation: formation,
        level: level,
        preferences: preferences ?? users[userIndex].preferences,
      );

      users[userIndex] = updatedUser;
      await _saveAllUsers(users);
      await _saveCurrentUser(updatedUser);

      logger.info('Profile updated successfully');
      return Success(updatedUser);
    } on AppException catch (e) {
      logger.error('Profile update failed', e);
      return Failure(e.message, e);
    } catch (e) {
      logger.error('Unexpected profile update error', e);
      return Failure('Profile update failed: ${e.toString()}');
    }
  }
}

