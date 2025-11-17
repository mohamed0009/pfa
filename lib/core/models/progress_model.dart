class UserProgress {
  final String userId;
  final String moduleId;
  final double progress; // 0.0 - 1.0
  final DateTime? startedAt;
  final DateTime? completedAt;
  final int timeSpent; // in minutes
  final Map<String, dynamic> performance; // scores, attempts, etc.
  final List<String> completedContents;

  UserProgress({
    required this.userId,
    required this.moduleId,
    this.progress = 0.0,
    this.startedAt,
    this.completedAt,
    this.timeSpent = 0,
    this.performance = const {},
    this.completedContents = const [],
  });

  factory UserProgress.fromJson(Map<String, dynamic> json) {
    return UserProgress(
      userId: json['userId'] ?? '',
      moduleId: json['moduleId'] ?? '',
      progress: (json['progress'] ?? 0.0).toDouble(),
      startedAt: json['startedAt'] != null
          ? DateTime.parse(json['startedAt'])
          : null,
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'])
          : null,
      timeSpent: json['timeSpent'] ?? 0,
      performance: json['performance'] ?? {},
      completedContents: List<String>.from(json['completedContents'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'moduleId': moduleId,
      'progress': progress,
      'startedAt': startedAt?.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'timeSpent': timeSpent,
      'performance': performance,
      'completedContents': completedContents,
    };
  }
}

class LearningAnalytics {
  final String userId;
  final int totalModules;
  final int completedModules;
  final int totalTimeSpent; // in minutes
  final double averageScore;
  final List<ModuleProgress> moduleProgresses;
  final Map<String, int> weeklyActivity;
  final List<String> strengths;
  final List<String> areasForImprovement;

  LearningAnalytics({
    required this.userId,
    required this.totalModules,
    required this.completedModules,
    required this.totalTimeSpent,
    required this.averageScore,
    this.moduleProgresses = const [],
    this.weeklyActivity = const {},
    this.strengths = const [],
    this.areasForImprovement = const [],
  });

  factory LearningAnalytics.fromJson(Map<String, dynamic> json) {
    return LearningAnalytics(
      userId: json['userId'] ?? '',
      totalModules: json['totalModules'] ?? 0,
      completedModules: json['completedModules'] ?? 0,
      totalTimeSpent: json['totalTimeSpent'] ?? 0,
      averageScore: (json['averageScore'] ?? 0.0).toDouble(),
      moduleProgresses: (json['moduleProgresses'] as List<dynamic>?)
          ?.map((m) => ModuleProgress.fromJson(m))
          .toList() ?? [],
      weeklyActivity: Map<String, int>.from(json['weeklyActivity'] ?? {}),
      strengths: List<String>.from(json['strengths'] ?? []),
      areasForImprovement:
          List<String>.from(json['areasForImprovement'] ?? []),
    );
  }
}

class ModuleProgress {
  final String moduleId;
  final String moduleTitle;
  final double progress;
  final double? score;
  final DateTime? lastAccessed;

  ModuleProgress({
    required this.moduleId,
    required this.moduleTitle,
    required this.progress,
    this.score,
    this.lastAccessed,
  });

  factory ModuleProgress.fromJson(Map<String, dynamic> json) {
    return ModuleProgress(
      moduleId: json['moduleId'] ?? '',
      moduleTitle: json['moduleTitle'] ?? '',
      progress: (json['progress'] ?? 0.0).toDouble(),
      score: json['score']?.toDouble(),
      lastAccessed: json['lastAccessed'] != null
          ? DateTime.parse(json['lastAccessed'])
          : null,
    );
  }
}

