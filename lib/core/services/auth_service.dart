import 'dart:convert';
import 'package:uuid/uuid.dart';
import 'package:dio/dio.dart';
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

      // Real API call to backend
      logger.debug('Calling login API: /api/auth/login', {'email': email});
      
      final response = await apiService.post<Map<String, dynamic>>(
        '/api/auth/login',
        data: {'email': email, 'password': password},
      );

      logger.debug('Login API response received', response);

      if (response == null) {
        logger.error('Login failed: null response', null);
        throw ServerException('No response from server');
      }

      // Save JWT token
      final token = response['token'] as String?;
      if (token != null) {
        await storage.saveAccessToken(token);
        logger.debug('JWT token saved', null);
      } else {
        logger.warning('No token in response', response);
      }

      // Create user model from response
      final user = UserModel(
        id: response['id']?.toString() ?? '',
        email: response['email']?.toString() ?? email,
        name: '${response['firstName'] ?? ''} ${response['lastName'] ?? ''}'.trim(),
        role: _mapRoleFromString(response['role']?.toString() ?? 'USER'),
        createdAt: DateTime.now(),
        preferences: {},
      );

      await _saveCurrentUser(user);
      logger.info('User logged in successfully: ${user.email}');

      return Success(user);
    } on AppException catch (e) {
      logger.error('Login failed', e);
      if (e is UnauthorizedException || e.message.contains('401') || e.message.contains('incorrect') || e.message.contains('Authentication failed')) {
        return Failure('Email ou mot de passe incorrect');
      }
      return Failure(e.message, e);
    } on DioException catch (e) {
      logger.error('Login failed (DioException)', e);
      if (e.response?.statusCode == 401) {
        return Failure('Email ou mot de passe incorrect');
      }
      // Check if it's a network error
      if (e.type == DioExceptionType.connectionTimeout || 
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.connectionError) {
        return Failure('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      }
      return Failure('Login failed: ${e.message ?? 'Unknown error'}');
    } catch (e) {
      logger.error('Unexpected login error', e);
      return Failure('Login failed: ${e.toString()}');
    }
  }

  UserRole _mapRoleFromString(String role) {
    switch (role.toUpperCase()) {
      case 'ADMIN':
      case 'ADMINISTRATEUR':
        return UserRole.admin;
      case 'TRAINER':
      case 'FORMATEUR':
        return UserRole.trainer;
      case 'USER':
      case 'APPRENANT':
      case 'LEARNER':
      default:
        return UserRole.learner;
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

      // Split name into first and last name
      final nameParts = name.trim().split(' ');
      final firstName = nameParts.isNotEmpty ? nameParts.first : name;
      final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';

      // Real API call to backend
      final response = await apiService.post<Map<String, dynamic>>(
        '/api/auth/signup',
        data: {
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
          'role': _mapRoleToString(role),
        },
      );

      if (response == null) {
        throw ServerException('No response from server');
      }

      // Save JWT token
      final token = response['token'] as String?;
      if (token != null) {
        await storage.saveAccessToken(token);
      }

      // Create user model from response
      final newUser = UserModel(
        id: response['id'] ?? '',
        email: response['email'] ?? email,
        name: '${response['firstName'] ?? ''} ${response['lastName'] ?? ''}'.trim(),
        role: _mapRoleFromString(response['role']?.toString() ?? 'USER'),
        createdAt: DateTime.now(),
        preferences: {},
      );

      await _saveCurrentUser(newUser);
      logger.info('User registered successfully: ${newUser.email}');
      return Success(newUser);
    } on AppException catch (e) {
      logger.error('Registration failed', e);
      if (e is BadRequestException || e.message.contains('already') || e.message.contains('taken')) {
        return Failure('Cet email est déjà utilisé');
      }
      return Failure(e.message, e);
    } on DioException catch (e) {
      logger.error('Registration failed (DioException)', e);
      if (e.response?.statusCode == 400) {
        final errorMessage = e.response?.data?.toString() ?? 'Email already exists';
        return Failure(errorMessage);
      }
      return Failure('Registration failed: ${e.message ?? 'Unknown error'}');
    } catch (e) {
      logger.error('Unexpected registration error', e);
      return Failure('Registration failed: ${e.toString()}');
    }
  }

  String _mapRoleToString(UserRole role) {
    switch (role) {
      case UserRole.admin:
        return 'ADMIN';
      case UserRole.trainer:
        return 'TRAINER';
      case UserRole.learner:
      default:
        return 'USER';
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

