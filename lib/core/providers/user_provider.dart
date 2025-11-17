import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../errors/result.dart';

class UserProvider with ChangeNotifier {
  final AuthService authService;
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserProvider({required this.authService});

  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isAdmin => _currentUser?.role == UserRole.admin;
  bool get isTrainer => _currentUser?.role == UserRole.trainer;
  bool get isLearner => _currentUser?.role == UserRole.learner;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await authService.login(email, password);
      
      if (result is Success<UserModel>) {
        _currentUser = result.data;
        _isLoading = false;
        notifyListeners();
        return true;
      } else if (result is Failure<UserModel>) {
        _errorMessage = result.message;
        _isLoading = false;
        notifyListeners();
        return false;
      }
      return false;
    } catch (e) {
      _errorMessage = 'An unexpected error occurred';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String name,
    UserRole role = UserRole.learner,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await authService.register(
        email: email,
        password: password,
        name: name,
        role: role,
      );
      
      if (result is Success<UserModel>) {
        _currentUser = result.data;
        _isLoading = false;
        notifyListeners();
        return true;
      } else if (result is Failure<UserModel>) {
        _errorMessage = result.message;
        _isLoading = false;
        notifyListeners();
        return false;
      }
      return false;
    } catch (e) {
      _errorMessage = 'An unexpected error occurred';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await authService.logout();
    _currentUser = null;
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> updateProfile({
    String? name,
    String? formation,
    String? level,
    Map<String, dynamic>? preferences,
  }) async {
    if (_currentUser == null) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await authService.updateProfile(
        userId: _currentUser!.id,
        name: name,
        formation: formation,
        level: level,
        preferences: preferences,
      );
      
      if (result is Success<UserModel>) {
        _currentUser = result.data;
        _isLoading = false;
        notifyListeners();
      } else if (result is Failure<UserModel>) {
        _errorMessage = result.message;
        _isLoading = false;
        notifyListeners();
      }
    } catch (e) {
      _errorMessage = 'An unexpected error occurred';
      _isLoading = false;
      notifyListeners();
    }
  }

  void setUser(UserModel user) {
    _currentUser = user;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}

