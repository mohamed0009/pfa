/// Admin models for user management

class AdminUser {
  final String id;
  final String fullName;
  final String email;
  final String? training;
  final String? level;
  final String? avatarUrl;
  final DateTime? lastActive;
  final int coursesEnrolled;
  final int coursesCompleted;
  final UserStatus status;
  final UserRole role;
  final DateTime createdAt;

  AdminUser({
    required this.id,
    required this.fullName,
    required this.email,
    this.training,
    this.level,
    this.avatarUrl,
    this.lastActive,
    this.coursesEnrolled = 0,
    this.coursesCompleted = 0,
    required this.status,
    required this.role,
    required this.createdAt,
  });

  factory AdminUser.fromJson(Map<String, dynamic> json) {
    return AdminUser(
      id: json['id'] ?? '',
      fullName: json['fullName'] ?? json['name'] ?? '',
      email: json['email'] ?? '',
      training: json['training'],
      level: json['level'],
      avatarUrl: json['avatarUrl'],
      lastActive: json['lastActive'] != null ? DateTime.parse(json['lastActive']) : null,
      coursesEnrolled: json['coursesEnrolled'] ?? 0,
      coursesCompleted: json['coursesCompleted'] ?? 0,
      status: UserStatus.values.firstWhere(
        (e) => e.toString().split('.').last.toLowerCase() == json['status']?.toString().toLowerCase(),
        orElse: () => UserStatus.active,
      ),
      role: UserRole.values.firstWhere(
        (e) => e.toString().split('.').last.toLowerCase() == json['role']?.toString().toLowerCase(),
        orElse: () => UserRole.Apprenant,
      ),
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'email': email,
      'training': training,
      'level': level,
      'avatarUrl': avatarUrl,
      'lastActive': lastActive?.toIso8601String(),
      'coursesEnrolled': coursesEnrolled,
      'coursesCompleted': coursesCompleted,
      'status': status.toString().split('.').last,
      'role': role.toString().split('.').last,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

enum UserStatus {
  active,
  inactive,
  suspended,
  pending,
}

enum UserRole {
  Apprenant,
  Formateur,
  Administrateur,
}

class UserStats {
  final int total;
  final int active;
  final int learners;
  final int trainers;
  final int admins;

  UserStats({
    required this.total,
    required this.active,
    required this.learners,
    required this.trainers,
    required this.admins,
  });

  Map<String, dynamic> toJson() {
    return {
      'total': total,
      'active': active,
      'learners': learners,
      'trainers': trainers,
      'admins': admins,
    };
  }
}

