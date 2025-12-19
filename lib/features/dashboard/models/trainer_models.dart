import 'package:json_annotation/json_annotation.dart';

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
}

class TrainerFormation {
  final String id;
  final String title;
  final String description;
  final String? thumbnail;
  final DifficultyLevel level;
  final String category;
  final ContentStatus status;
  final double duration;
  final int enrolledCount;
  final double completionRate;
  final DateTime createdAt;
  final DateTime updatedAt;

  TrainerFormation({
    required this.id,
    required this.title,
    required this.description,
    this.thumbnail,
    required this.level,
    required this.category,
    required this.status,
    required this.duration,
    required this.enrolledCount,
    required this.completionRate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TrainerFormation.fromJson(Map<String, dynamic> json) {
    return TrainerFormation(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      thumbnail: json['thumbnail'],
      level: DifficultyLevel.values.firstWhere(
        (e) => e.toString().split('.').last == json['level'],
        orElse: () => DifficultyLevel.Moyen,
      ),
      category: json['category'] ?? '',
      status: ContentStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => ContentStatus.draft,
      ),
      duration: (json['duration'] ?? 0).toDouble(),
      enrolledCount: json['enrolledCount'] ?? 0,
      completionRate: (json['completionRate'] ?? 0).toDouble(),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'thumbnail': thumbnail,
      'level': level.toString().split('.').last,
      'category': category,
      'status': status.toString().split('.').last,
      'duration': duration,
      'enrolledCount': enrolledCount,
      'completionRate': completionRate,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class TrainerModule {
  final String id;
  final String formationId;
  final String title;
  final String description;
  final int order;
  final ContentStatus status;
  final int coursesCount;
  final double duration;

  TrainerModule({
    required this.id,
    required this.formationId,
    required this.title,
    required this.description,
    required this.order,
    required this.status,
    required this.coursesCount,
    required this.duration,
  });

  factory TrainerModule.fromJson(Map<String, dynamic> json) {
    return TrainerModule(
      id: json['id'] ?? '',
      formationId: json['formationId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      order: json['order'] ?? 0,
      status: ContentStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => ContentStatus.draft,
      ),
      coursesCount: json['coursesCount'] ?? 0,
      duration: (json['duration'] ?? 0).toDouble(),
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
      'coursesCount': coursesCount,
      'duration': duration,
    };
  }
}

class TrainerCourse {
  final String id;
  final String moduleId;
  final String title;
  final String description;
  final String content;
  final int order;
  final ContentStatus status;
  final double duration;

  TrainerCourse({
    required this.id,
    required this.moduleId,
    required this.title,
    required this.description,
    required this.content,
    required this.order,
    required this.status,
    required this.duration,
  });

  factory TrainerCourse.fromJson(Map<String, dynamic> json) {
    return TrainerCourse(
      id: json['id'] ?? '',
      moduleId: json['moduleId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      content: json['content'] ?? '',
      order: json['order'] ?? 0,
      status: ContentStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => ContentStatus.draft,
      ),
      duration: (json['duration'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'moduleId': moduleId,
      'title': title,
      'description': description,
      'content': content,
      'order': order,
      'status': status.toString().split('.').last,
      'duration': duration,
    };
  }
}

class StudentDashboard {
  final String studentId;
  final String studentName;
  final String formationId;
  final double overallProgress;
  final DateTime lastActivity;

  StudentDashboard({
    required this.studentId,
    required this.studentName,
    required this.formationId,
    required this.overallProgress,
    required this.lastActivity,
  });

  factory StudentDashboard.fromJson(Map<String, dynamic> json) {
    return StudentDashboard(
      studentId: json['studentId'] ?? '',
      studentName: json['studentName'] ?? '',
      formationId: json['formationId'] ?? '',
      overallProgress: (json['overallProgress'] ?? 0).toDouble(),
      lastActivity: DateTime.parse(json['lastActivity'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class AtRiskStudent {
  final String studentId;
  final String studentName;
  final String formationId;
  final String riskLevel; // low, medium, high
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
}

