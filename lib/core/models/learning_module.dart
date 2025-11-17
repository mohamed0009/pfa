class LearningModule {
  final String id;
  final String title;
  final String description;
  final String? category;
  final int estimatedDuration; // in minutes
  final int level; // 1-5 difficulty level
  final List<String> topics;
  final List<LearningContent> contents;
  final bool isCompleted;
  final double? progress; // 0.0 - 1.0
  final DateTime createdAt;
  final DateTime? completedAt;

  LearningModule({
    required this.id,
    required this.title,
    required this.description,
    this.category,
    required this.estimatedDuration,
    required this.level,
    this.topics = const [],
    this.contents = const [],
    this.isCompleted = false,
    this.progress = 0.0,
    required this.createdAt,
    this.completedAt,
  });

  factory LearningModule.fromJson(Map<String, dynamic> json) {
    return LearningModule(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'],
      estimatedDuration: json['estimatedDuration'] ?? 0,
      level: json['level'] ?? 1,
      topics: List<String>.from(json['topics'] ?? []),
      contents: (json['contents'] as List<dynamic>?)
          ?.map((c) => LearningContent.fromJson(c))
          .toList() ?? [],
      isCompleted: json['isCompleted'] ?? false,
      progress: json['progress']?.toDouble(),
      createdAt: DateTime.parse(json['createdAt']),
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'estimatedDuration': estimatedDuration,
      'level': level,
      'topics': topics,
      'contents': contents.map((c) => c.toJson()).toList(),
      'isCompleted': isCompleted,
      'progress': progress,
      'createdAt': createdAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }
}

class LearningContent {
  final String id;
  final ContentType type;
  final String title;
  final String content;
  final Map<String, dynamic>? metadata;

  LearningContent({
    required this.id,
    required this.type,
    required this.title,
    required this.content,
    this.metadata,
  });

  factory LearningContent.fromJson(Map<String, dynamic> json) {
    return LearningContent(
      id: json['id'] ?? '',
      type: ContentType.values.firstWhere(
        (e) => e.toString() == 'ContentType.${json['type']}',
        orElse: () => ContentType.text,
      ),
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.toString().split('.').last,
      'title': title,
      'content': content,
      'metadata': metadata,
    };
  }
}

enum ContentType {
  text,
  video,
  quiz,
  exercise,
  pdf,
  image,
}

