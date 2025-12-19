/// AI Supervision Models for Admin
/// Mirrors the web admin interfaces for feature parity

enum AITone { formal, friendly, motivating, professional }

enum AIDetailLevel { concise, moderate, detailed }

enum AISentiment { positive, neutral, negative }

enum AIContentType { quiz, exercise, summary }

enum DocumentStatus { active, processing, error }

/// AI Configuration Model
class AIConfiguration {
  final String language;
  final AITone tone;
  final AIDetailLevel detailLevel;
  final int maxResponseLength;
  final bool enableQuizGeneration;
  final bool enableExerciseGeneration;
  final bool enableSummaryGeneration;
  final bool enablePersonalization;

  AIConfiguration({
    required this.language,
    required this.tone,
    required this.detailLevel,
    required this.maxResponseLength,
    required this.enableQuizGeneration,
    required this.enableExerciseGeneration,
    required this.enableSummaryGeneration,
    required this.enablePersonalization,
  });

  AIConfiguration copyWith({
    String? language,
    AITone? tone,
    AIDetailLevel? detailLevel,
    int? maxResponseLength,
    bool? enableQuizGeneration,
    bool? enableExerciseGeneration,
    bool? enableSummaryGeneration,
    bool? enablePersonalization,
  }) {
    return AIConfiguration(
      language: language ?? this.language,
      tone: tone ?? this.tone,
      detailLevel: detailLevel ?? this.detailLevel,
      maxResponseLength: maxResponseLength ?? this.maxResponseLength,
      enableQuizGeneration: enableQuizGeneration ?? this.enableQuizGeneration,
      enableExerciseGeneration: enableExerciseGeneration ?? this.enableExerciseGeneration,
      enableSummaryGeneration: enableSummaryGeneration ?? this.enableSummaryGeneration,
      enablePersonalization: enablePersonalization ?? this.enablePersonalization,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'language': language,
      'tone': tone.name,
      'detailLevel': detailLevel.name,
      'maxResponseLength': maxResponseLength,
      'enableQuizGeneration': enableQuizGeneration,
      'enableExerciseGeneration': enableExerciseGeneration,
      'enableSummaryGeneration': enableSummaryGeneration,
      'enablePersonalization': enablePersonalization,
    };
  }

  factory AIConfiguration.fromJson(Map<String, dynamic> json) {
    return AIConfiguration(
      language: json['language'] as String,
      tone: AITone.values.firstWhere((e) => e.name == json['tone']),
      detailLevel: AIDetailLevel.values.firstWhere((e) => e.name == json['detailLevel']),
      maxResponseLength: json['maxResponseLength'] as int,
      enableQuizGeneration: json['enableQuizGeneration'] as bool,
      enableExerciseGeneration: json['enableExerciseGeneration'] as bool,
      enableSummaryGeneration: json['enableSummaryGeneration'] as bool,
      enablePersonalization: json['enablePersonalization'] as bool,
    );
  }
}

/// AI Interaction Model
class AIInteraction {
  final String id;
  final String userName;
  final String userRole;
  final String question;
  final String response;
  final AISentiment? sentiment;
  final int responseTime; // milliseconds
  final DateTime timestamp;
  final String category;
  final bool flagged;
  final String? flagReason;

  AIInteraction({
    required this.id,
    required this.userName,
    required this.userRole,
    required this.question,
    required this.response,
    this.sentiment,
    required this.responseTime,
    required this.timestamp,
    required this.category,
    this.flagged = false,
    this.flagReason,
  });

  AIInteraction copyWith({
    bool? flagged,
    String? flagReason,
  }) {
    return AIInteraction(
      id: id,
      userName: userName,
      userRole: userRole,
      question: question,
      response: response,
      sentiment: sentiment,
      responseTime: responseTime,
      timestamp: timestamp,
      category: category,
      flagged: flagged ?? this.flagged,
      flagReason: flagReason ?? this.flagReason,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userName': userName,
      'userRole': userRole,
      'question': question,
      'response': response,
      'sentiment': sentiment?.name,
      'responseTime': responseTime,
      'timestamp': timestamp.toIso8601String(),
      'category': category,
      'flagged': flagged,
      'flagReason': flagReason,
    };
  }

  factory AIInteraction.fromJson(Map<String, dynamic> json) {
    return AIInteraction(
      id: json['id'] as String,
      userName: json['userName'] as String,
      userRole: json['userRole'] as String,
      question: json['question'] as String,
      response: json['response'] as String,
      sentiment: json['sentiment'] != null 
          ? AISentiment.values.firstWhere((e) => e.name == json['sentiment'])
          : null,
      responseTime: json['responseTime'] as int,
      timestamp: DateTime.parse(json['timestamp'] as String),
      category: json['category'] as String,
      flagged: json['flagged'] as bool? ?? false,
      flagReason: json['flagReason'] as String?,
    );
  }
}

/// AI Generated Content Model
class AIGeneratedContent {
  final String id;
  final AIContentType type;
  final String courseName;
  final int usedCount;
  final double? rating;
  final DateTime generatedAt;
  final String content;
  final bool archived;

  AIGeneratedContent({
    required this.id,
    required this.type,
    required this.courseName,
    required this.usedCount,
    this.rating,
    required this.generatedAt,
    required this.content,
    this.archived = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'courseName': courseName,
      'usedCount': usedCount,
      'rating': rating,
      'generatedAt': generatedAt.toIso8601String(),
      'content': content,
      'archived': archived,
    };
  }

  factory AIGeneratedContent.fromJson(Map<String, dynamic> json) {
    return AIGeneratedContent(
      id: json['id'] as String,
      type: AIContentType.values.firstWhere((e) => e.name == json['type']),
      courseName: json['courseName'] as String,
      usedCount: json['usedCount'] as int,
      rating: json['rating'] as double?,
      generatedAt: DateTime.parse(json['generatedAt'] as String),
      content: json['content'] as String,
      archived: json['archived'] as bool? ?? false,
    );
  }
}

/// AI Knowledge Document Model
class AIKnowledgeDocument {
  final String id;
  final String title;
  final String category;
  final String fileType;
  final int fileSize; // in bytes
  final DocumentStatus status;
  final String uploadedBy;
  final DateTime uploadedAt;

  AIKnowledgeDocument({
    required this.id,
    required this.title,
    required this.category,
    required this.fileType,
    required this.fileSize,
    required this.status,
    required this.uploadedBy,
    required this.uploadedAt,
  });

  String get fileSizeMB => (fileSize / 1024 / 1024).toStringAsFixed(2);

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'category': category,
      'fileType': fileType,
      'fileSize': fileSize,
      'status': status.name,
      'uploadedBy': uploadedBy,
      'uploadedAt': uploadedAt.toIso8601String(),
    };
  }

  factory AIKnowledgeDocument.fromJson(Map<String, dynamic> json) {
    return AIKnowledgeDocument(
      id: json['id'] as String,
      title: json['title'] as String,
      category: json['category'] as String,
      fileType: json['fileType'] as String,
      fileSize: json['fileSize'] as int,
      status: DocumentStatus.values.firstWhere((e) => e.name == json['status']),
      uploadedBy: json['uploadedBy'] as String,
      uploadedAt: DateTime.parse(json['uploadedAt'] as String),
    );
  }
}

/// AI Statistics Model
class AIStatistics {
  final int totalInteractions;
  final int averageResponseTime;
  final int flaggedInteractions;
  final SentimentBreakdown sentimentBreakdown;
  final GeneratedContentCount generatedContentCount;
  final double averageContentRating;
  final int knowledgeBaseSize; // in MB
  final int indexedDocuments;

  AIStatistics({
    required this.totalInteractions,
    required this.averageResponseTime,
    required this.flaggedInteractions,
    required this.sentimentBreakdown,
    required this.generatedContentCount,
    required this.averageContentRating,
    required this.knowledgeBaseSize,
    required this.indexedDocuments,
  });

  Map<String, dynamic> toJson() {
    return {
      'totalInteractions': totalInteractions,
      'averageResponseTime': averageResponseTime,
      'flaggedInteractions': flaggedInteractions,
      'sentimentBreakdown': sentimentBreakdown.toJson(),
      'generatedContentCount': generatedContentCount.toJson(),
      'averageContentRating': averageContentRating,
      'knowledgeBaseSize': knowledgeBaseSize,
      'indexedDocuments': indexedDocuments,
    };
  }

  factory AIStatistics.fromJson(Map<String, dynamic> json) {
    return AIStatistics(
      totalInteractions: json['totalInteractions'] as int,
      averageResponseTime: json['averageResponseTime'] as int,
      flaggedInteractions: json['flaggedInteractions'] as int,
      sentimentBreakdown: SentimentBreakdown.fromJson(json['sentimentBreakdown']),
      generatedContentCount: GeneratedContentCount.fromJson(json['generatedContentCount']),
      averageContentRating: (json['averageContentRating'] as num).toDouble(),
      knowledgeBaseSize: json['knowledgeBaseSize'] as int,
      indexedDocuments: json['indexedDocuments'] as int,
    );
  }
}

class SentimentBreakdown {
  final int positive;
  final int neutral;
  final int negative;

  SentimentBreakdown({
    required this.positive,
    required this.neutral,
    required this.negative,
  });

  Map<String, dynamic> toJson() => {
    'positive': positive,
    'neutral': neutral,
    'negative': negative,
  };

  factory SentimentBreakdown.fromJson(Map<String, dynamic> json) {
    return SentimentBreakdown(
      positive: json['positive'] as int,
      neutral: json['neutral'] as int,
      negative: json['negative'] as int,
    );
  }
}

class GeneratedContentCount {
  final int quiz;
  final int exercise;
  final int summary;

  GeneratedContentCount({
    required this.quiz,
    required this.exercise,
    required this.summary,
  });

  int get total => quiz + exercise + summary;

  Map<String, dynamic> toJson() => {
    'quiz': quiz,
    'exercise': exercise,
    'summary': summary,
  };

  factory GeneratedContentCount.fromJson(Map<String, dynamic> json) {
    return GeneratedContentCount(
      quiz: json['quiz'] as int,
      exercise: json['exercise'] as int,
      summary: json['summary'] as int,
    );
  }
}
