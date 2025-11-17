class Quiz {
  final String id;
  final String title;
  final String description;
  final String moduleId;
  final List<Question> questions;
  final int timeLimit; // in minutes
  final DateTime createdAt;
  final bool isCompleted;
  final double? score;

  Quiz({
    required this.id,
    required this.title,
    required this.description,
    required this.moduleId,
    this.questions = const [],
    this.timeLimit = 30,
    required this.createdAt,
    this.isCompleted = false,
    this.score,
  });

  factory Quiz.fromJson(Map<String, dynamic> json) {
    return Quiz(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      moduleId: json['moduleId'] ?? '',
      questions: (json['questions'] as List<dynamic>?)
          ?.map((q) => Question.fromJson(q))
          .toList() ?? [],
      timeLimit: json['timeLimit'] ?? 30,
      createdAt: DateTime.parse(json['createdAt']),
      isCompleted: json['isCompleted'] ?? false,
      score: json['score']?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'moduleId': moduleId,
      'questions': questions.map((q) => q.toJson()).toList(),
      'timeLimit': timeLimit,
      'createdAt': createdAt.toIso8601String(),
      'isCompleted': isCompleted,
      'score': score,
    };
  }
}

class Question {
  final String id;
  final String question;
  final List<String> options;
  final int correctAnswerIndex;
  final String? explanation;

  Question({
    required this.id,
    required this.question,
    required this.options,
    required this.correctAnswerIndex,
    this.explanation,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] ?? '',
      question: json['question'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      correctAnswerIndex: json['correctAnswerIndex'] ?? 0,
      explanation: json['explanation'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'question': question,
      'options': options,
      'correctAnswerIndex': correctAnswerIndex,
      'explanation': explanation,
    };
  }
}

