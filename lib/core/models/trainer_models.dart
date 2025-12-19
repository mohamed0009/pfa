/// Trainer models for managing formations, modules, courses, and students

class TrainerFormation {
  final String id;
  final String title;
  final String? description;
  final ContentStatus status;
  final int enrolledStudents;
  final DateTime createdAt;
  final DateTime? updatedAt;

  TrainerFormation({
    required this.id,
    required this.title,
    this.description,
    required this.status,
    this.enrolledStudents = 0,
    required this.createdAt,
    this.updatedAt,
  });

  factory TrainerFormation.fromJson(Map<String, dynamic> json) {
    return TrainerFormation(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      status: ContentStatus.values.firstWhere(
        (e) => e.toString().split('.').last.toLowerCase() == json['status']?.toString().toLowerCase(),
        orElse: () => ContentStatus.draft,
      ),
      enrolledStudents: json['enrolledStudents'] ?? 0,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'status': status.toString().split('.').last,
      'enrolledStudents': enrolledStudents,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}

class TrainerModule {
  final String id;
  final String formationId;
  final String title;
  final String? description;
  final int order;
  final ContentStatus status;
  final double duration;
  final DateTime createdAt;

  TrainerModule({
    required this.id,
    required this.formationId,
    required this.title,
    this.description,
    required this.order,
    required this.status,
    this.duration = 0.0,
    required this.createdAt,
  });

  factory TrainerModule.fromJson(Map<String, dynamic> json) {
    return TrainerModule(
      id: json['id'] ?? '',
      formationId: json['formationId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      order: json['order'] ?? 0,
      status: ContentStatus.values.firstWhere(
        (e) => e.toString().split('.').last.toLowerCase() == json['status']?.toString().toLowerCase(),
        orElse: () => ContentStatus.draft,
      ),
      duration: (json['duration'] ?? 0.0).toDouble(),
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'formationId': formationId,
      'title': title,
      'description': description,
      'order': order,
      'status': status.toString().split('.').last,
      'duration': duration,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class TrainerCourse {
  final String id;
  final String moduleId;
  final String title;
  final String? description;
  final int order;
  final ContentStatus status;
  final DateTime createdAt;

  TrainerCourse({
    required this.id,
    required this.moduleId,
    required this.title,
    this.description,
    required this.order,
    required this.status,
    required this.createdAt,
  });

  factory TrainerCourse.fromJson(Map<String, dynamic> json) {
    return TrainerCourse(
      id: json['id'] ?? '',
      moduleId: json['moduleId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      order: json['order'] ?? 0,
      status: ContentStatus.values.firstWhere(
        (e) => e.toString().split('.').last.toLowerCase() == json['status']?.toString().toLowerCase(),
        orElse: () => ContentStatus.draft,
      ),
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'moduleId': moduleId,
      'title': title,
      'description': description,
      'order': order,
      'status': status.toString().split('.').last,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class StudentDashboard {
  final String id;
  final String name;
  final String email;
  final String? formationId;
  final String? formationTitle;
  final double progress;
  final DateTime? lastActivity;
  final int completedModules;
  final int totalModules;

  StudentDashboard({
    required this.id,
    required this.name,
    required this.email,
    this.formationId,
    this.formationTitle,
    this.progress = 0.0,
    this.lastActivity,
    this.completedModules = 0,
    this.totalModules = 0,
  });

  factory StudentDashboard.fromJson(Map<String, dynamic> json) {
    return StudentDashboard(
      id: json['id'] ?? '',
      name: json['name'] ?? json['fullName'] ?? '',
      email: json['email'] ?? '',
      formationId: json['formationId'],
      formationTitle: json['formationTitle'],
      progress: (json['progress'] ?? 0.0).toDouble(),
      lastActivity: json['lastActivity'] != null ? DateTime.parse(json['lastActivity']) : null,
      completedModules: json['completedModules'] ?? 0,
      totalModules: json['totalModules'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'formationId': formationId,
      'formationTitle': formationTitle,
      'progress': progress,
      'lastActivity': lastActivity?.toIso8601String(),
      'completedModules': completedModules,
      'totalModules': totalModules,
    };
  }
}

class AtRiskStudent {
  final String studentId;
  final String studentName;
  final String formationId;
  final String riskLevel; // 'low', 'medium', 'high'
  final List<String> reasons;
  final double progress;

  AtRiskStudent({
    required this.studentId,
    required this.studentName,
    required this.formationId,
    required this.riskLevel,
    required this.reasons,
    required this.progress,
  });

  Map<String, dynamic> toJson() {
    return {
      'studentId': studentId,
      'studentName': studentName,
      'formationId': formationId,
      'riskLevel': riskLevel,
      'reasons': reasons,
      'progress': progress,
    };
  }
}

enum ContentStatus {
  draft,
  pending,
  approved,
  published,
  rejected,
  archived,
}

enum DifficultyLevel {
  Facile,
  Moyen,
  Difficile,
  Avance,
}

