enum UserRole {
  admin,
  trainer,
  learner,
}

class UserModel {
  final String id;
  final String email;
  final String name;
  final String? formation;
  final String? level;
  final UserRole role;
  final Map<String, dynamic> preferences;
  final DateTime createdAt;
  final DateTime? lastLogin;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.formation,
    this.level,
    required this.role,
    this.preferences = const {},
    required this.createdAt,
    this.lastLogin,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      formation: json['formation'],
      level: json['level'],
      role: UserRole.values.firstWhere(
        (e) => e.toString() == 'UserRole.${json['role']}',
        orElse: () => UserRole.learner,
      ),
      preferences: json['preferences'] ?? {},
      createdAt: DateTime.parse(json['createdAt']),
      lastLogin: json['lastLogin'] != null ? DateTime.parse(json['lastLogin']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'formation': formation,
      'level': level,
      'role': role.toString().split('.').last,
      'preferences': preferences,
      'createdAt': createdAt.toIso8601String(),
      'lastLogin': lastLogin?.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    String? formation,
    String? level,
    UserRole? role,
    Map<String, dynamic>? preferences,
    DateTime? createdAt,
    DateTime? lastLogin,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      formation: formation ?? this.formation,
      level: level ?? this.level,
      role: role ?? this.role,
      preferences: preferences ?? this.preferences,
      createdAt: createdAt ?? this.createdAt,
      lastLogin: lastLogin ?? this.lastLogin,
    );
  }
}

