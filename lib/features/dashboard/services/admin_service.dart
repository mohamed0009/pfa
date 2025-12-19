import 'package:flutter/foundation.dart';
import '../../../../core/services/logger_service.dart';
import '../../../../core/di/dependency_injection.dart';
import '../presentation/models/admin_models.dart';

class AdminService {
  final LoggerService _logger = getIt<LoggerService>();

  // Mock Data Parity with Web App (users-admin.service.ts)
  final List<AdminUser> _users = [
    AdminUser(
      id: '1',
      fullName: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      training: 'Développement Full Stack',
      level: 'Intermédiaire',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      lastActive: DateTime.now().subtract(const Duration(days: 5)),
      coursesEnrolled: 5,
      coursesCompleted: 2,
      status: UserStatus.active,
      role: UserRole.Apprenant,
      createdAt: DateTime(2024, 1, 15),
    ),
    AdminUser(
      id: '2',
      fullName: 'Michael Chen',
      email: 'michael.chen@example.com',
      training: 'Data Science',
      level: 'Avancé',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      lastActive: DateTime.now().subtract(const Duration(days: 8)),
      coursesEnrolled: 8,
      coursesCompleted: 6,
      status: UserStatus.active,
      role: UserRole.Apprenant,
      createdAt: DateTime(2023, 11, 20),
    ),
    AdminUser(
      id: '3',
      fullName: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      training: 'UX/UI Design',
      level: 'Débutant',
      avatarUrl: 'https://i.pravatar.cc/150?img=10',
      lastActive: DateTime.now().subtract(const Duration(days: 20)),
      coursesEnrolled: 3,
      coursesCompleted: 1,
      status: UserStatus.inactive,
      role: UserRole.Apprenant,
      createdAt: DateTime(2024, 3, 1),
    ),
    // Add a trainer and admin for stats
    AdminUser(
      id: '4',
      fullName: 'Jean Formateur',
      email: 'jean.formateur@example.com',
      level: 'Expert',
      coursesEnrolled: 0,
      coursesCompleted: 0,
      status: UserStatus.active,
      role: UserRole.Formateur,
      createdAt: DateTime(2023, 1, 1),
    ),
  ];

  Future<List<AdminUser>> getUsers() async {
    _logger.info('Fetching users (Mock)');
    await Future.delayed(const Duration(milliseconds: 300));
    return _users;
  }

  Future<void> deleteUser(String id) async {
    _logger.info('Deleting user $id (Mock)');
    await Future.delayed(const Duration(milliseconds: 300));
    _users.removeWhere((u) => u.id == id);
  }

  Future<UserStats> getUserStats() async {
    await Future.delayed(const Duration(milliseconds: 250));
    return UserStats(
      total: _users.length,
      active: _users.where((u) => u.status == UserStatus.active).length,
      learners: _users.where((u) => u.role == UserRole.Apprenant).length,
      trainers: _users.where((u) => u.role == UserRole.Formateur).length,
      admins: _users.where((u) => u.role == UserRole.Administrateur).length,
    );
  }
}
