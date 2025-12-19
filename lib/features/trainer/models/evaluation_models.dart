/// Trainer-specific models for evaluation and grading
import 'package:intl/intl.dart';

/// Submission status
enum SubmissionStatus { pending, graded, late, missing }

/// Question type for exercises
enum QuestionType { multipleChoice, shortAnswer, essay, code, practical }

/// Exercise Submission Model
class ExerciseSubmission {
  final String id;
  final String exerciseId;
  final String exerciseTitle;
  final String studentId;
  final String studentName;
  final String studentAvatar;
  final DateTime submittedAt;
  final SubmissionStatus status;
  final String? grade;
  final double? score;
  final double maxScore;
  final String answerText;
  final List<String>? attachmentUrls;
  final String? trainerFeedback;
  final DateTime? gradedAt;
  final bool isLate;

  ExerciseSubmission({
    required this.id,
    required this.exerciseId,
    required this.exerciseTitle,
    required this.studentId,
    required this.studentName,
    required this.studentAvatar,
    required this.submittedAt,
    required this.status,
    this.grade,
    this.score,
    required this.maxScore,
    required this.answerText,
    this.attachmentUrls,
    this.trainerFeedback,
    this.gradedAt,
    this.isLate = false,
  });

  String get submittedAtFormatted => DateFormat('dd/MM/yy HH:mm').format(submittedAt);
  String get gradedAtFormatted => gradedAt != null 
      ? DateFormat('dd/MM/yy HH:mm').format(gradedAt!) 
      : '-';
  
  double? get scorePercentage => score != null ? (score! / maxScore) * 100 : null;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'exerciseId': exerciseId,
      'exerciseTitle': exerciseTitle,
      'studentId': studentId,
      'studentName': studentName,
      'studentAvatar': studentAvatar,
      'submittedAt': submittedAt.toIso8601String(),
      'status': status.name,
      'grade': grade,
      'score': score,
      'maxScore': maxScore,
      'answerText': answerText,
      'attachmentUrls': attachmentUrls,
      'trainerFeedback': trainerFeedback,
      'gradedAt': gradedAt?.toIso8601String(),
      'isLate': isLate,
    };
  }

  factory ExerciseSubmission.fromJson(Map<String, dynamic> json) {
    return ExerciseSubmission(
      id: json['id'] as String,
      exerciseId: json['exerciseId'] as String,
      exerciseTitle: json['exerciseTitle'] as String,
      studentId: json['studentId'] as String,
      studentName: json['studentName'] as String,
      studentAvatar: json['studentAvatar'] as String,
      submittedAt: DateTime.parse(json['submittedAt'] as String),
      status: SubmissionStatus.values.firstWhere((e) => e.name == json['status']),
      grade: json['grade'] as String?,
      score: json['score'] as double?,
      maxScore: (json['maxScore'] as num).toDouble(),
      answerText: json['answerText'] as String,
      attachmentUrls: (json['attachmentUrls'] as List<dynamic>?)?.cast<String>(),
      trainerFeedback: json['trainerFeedback'] as String?,
      gradedAt: json['gradedAt'] != null ? DateTime.parse(json['gradedAt'] as String) : null,
      isLate: json['isLate'] as bool? ?? false,
    );
  }
}

/// Quiz Result Model
class QuizResult {
  final String id;
  final String quizId;
  final String quizTitle;
  final String studentId;
  final String studentName;
  final String studentAvatar;
  final DateTime completedAt;
  final int totalQuestions;
  final int correctAnswers;
  final double score;
  final double maxScore;
  final Duration timeSpent;
  final bool needsReview; // For open-ended questions
  final String? trainerFeedback;
  final List<QuizAnswer> answers;

  QuizResult({
    required this.id,
    required this.quizId,
    required this.quizTitle,
    required this.studentId,
    required this.studentName,
    required this.studentAvatar,
    required this.completedAt,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.score,
    required this.maxScore,
    required this.timeSpent,
    this.needsReview = false,
    this.trainerFeedback,
    required this.answers,
  });

  double get percentage => (score / maxScore) * 100;
  String get completedAtFormatted => DateFormat('dd/MM/yy HH:mm').format(completedAt);
  String get timeSpentFormatted {
    final minutes = timeSpent.inMinutes;
    final seconds = timeSpent.inSeconds % 60;
    return '${minutes}m ${seconds}s';
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'quizId': quizId,
      'quizTitle': quizTitle,
      'studentId': studentId,
      'studentName': studentName,
      'studentAvatar': studentAvatar,
      'completedAt': completedAt.toIso8601String(),
      'totalQuestions': totalQuestions,
      'correctAnswers': correctAnswers,
      'score': score,
      'maxScore': maxScore,
      'timeSpent': timeSpent.inSeconds,
      'needsReview': needsReview,
      'trainerFeedback': trainerFeedback,
      'answers': answers.map((a) => a.toJson()).toList(),
    };
  }

  factory QuizResult.fromJson(Map<String, dynamic> json) {
    return QuizResult(
      id: json['id'] as String,
      quizId: json['quizId'] as String,
      quizTitle: json['quizTitle'] as String,
      studentId: json['studentId'] as String,
      studentName: json['studentName'] as String,
      studentAvatar: json['studentAvatar'] as String,
      completedAt: DateTime.parse(json['completedAt'] as String),
      totalQuestions: json['totalQuestions'] as int,
      correctAnswers: json['correctAnswers'] as int,
      score: (json['score'] as num).toDouble(),
      maxScore: (json['maxScore'] as num).toDouble(),
      timeSpent: Duration(seconds: json['timeSpent'] as int),
      needsReview: json['needsReview'] as bool? ?? false,
      trainerFeedback: json['trainerFeedback'] as String?,
      answers: (json['answers'] as List<dynamic>)
          .map((a) => QuizAnswer.fromJson(a as Map<String, dynamic>))
          .toList(),
    );
  }
}

/// Quiz Answer Model
class QuizAnswer {
  final String questionId;
  final String questionText;
  final QuestionType questionType;
  final String studentAnswer;
  final String? correctAnswer;
  final bool isCorrect;
  final double pointsEarned;
  final double maxPoints;
  final String? explanation;

  QuizAnswer({
    required this.questionId,
    required this.questionText,
    required this.questionType,
    required this.studentAnswer,
    this.correctAnswer,
    required this.isCorrect,
    required this.pointsEarned,
    required this.maxPoints,
    this.explanation,
  });

  Map<String, dynamic> toJson() {
    return {
      'questionId': questionId,
      'questionText': questionText,
      'questionType': questionType.name,
      'studentAnswer': studentAnswer,
      'correctAnswer': correctAnswer,
      'isCorrect': isCorrect,
      'pointsEarned': pointsEarned,
      'maxPoints': maxPoints,
      'explanation': explanation,
    };
  }

  factory QuizAnswer.fromJson(Map<String, dynamic> json) {
    return QuizAnswer(
      questionId: json['questionId'] as String,
      questionText: json['questionText'] as String,
      questionType: QuestionType.values.firstWhere((e) => e.name == json['questionType']),
      studentAnswer: json['studentAnswer'] as String,
      correctAnswer: json['correctAnswer'] as String?,
      isCorrect: json['isCorrect'] as bool,
      pointsEarned: (json['pointsEarned'] as num).toDouble(),
      maxPoints: (json['maxPoints'] as num).toDouble(),
      explanation: json['explanation'] as String?,
    );
  }
}

/// Evaluation Statistics
class EvaluationStatistics {
  final int totalSubmissions;
  final int pendingReviews;
  final int gradedSubmissions;
  final int lateSubmissions;
  final double averageScore;
  final int totalQuizzes;
  final int quizzesNeedingReview;
  final double averageQuizScore;

  EvaluationStatistics({
    required this.totalSubmissions,
    required this.pendingReviews,
    required this.gradedSubmissions,
    required this.lateSubmissions,
    required this.averageScore,
    required this.totalQuizzes,
    required this.quizzesNeedingReview,
    required this.averageQuizScore,
  });

  factory EvaluationStatistics.fromJson(Map<String, dynamic> json) {
    return EvaluationStatistics(
      totalSubmissions: json['totalSubmissions'] as int,
      pendingReviews: json['pendingReviews'] as int,
      gradedSubmissions: json['gradedSubmissions'] as int,
      lateSubmissions: json['lateSubmissions'] as int,
      averageScore: (json['averageScore'] as num).toDouble(),
      totalQuizzes: json['totalQuizzes'] as int,
      quizzesNeedingReview: json['quizzesNeedingReview'] as int,
      averageQuizScore: (json['averageQuizScore'] as num).toDouble(),
    );
  }
}
