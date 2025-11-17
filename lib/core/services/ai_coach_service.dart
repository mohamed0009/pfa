import 'dart:math';

import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../models/coach_recommendation.dart';
import 'api_service.dart';
import 'logger_service.dart';

class AICoachService {
  final ApiService apiService;
  final LoggerService logger;

  AICoachService({
    required this.apiService,
    required this.logger,
  });

  /// Generate AI response to user message
  /// In production, replace with real LLM API call (OpenAI, Anthropic, etc.)
  Future<String> generateResponse(String userMessage, String? context) async {
    try {
      logger.logUserAction('ai_coach_query', metadata: {'message': userMessage});

      // Simulate API delay
      await Future.delayed(Duration(milliseconds: 500 + Random().nextInt(1000)));

      // In production, replace with:
      // if (AppConfig.openAIApiKey.isNotEmpty) {
      //   final response = await apiService.post<Map<String, dynamic>>(
      //     'https://api.openai.com/v1/chat/completions',
      //     data: {
      //       'model': AppConfig.openAIModel,
      //       'messages': [
      //         {'role': 'system', 'content': 'You are a helpful virtual coach...'},
      //         {'role': 'user', 'content': userMessage},
      //       ],
      //     },
      //     options: Options(
      //       headers: {'Authorization': 'Bearer ${AppConfig.openAIApiKey}'},
      //     ),
      //   );
      //   return response['choices'][0]['message']['content'];
      // }

      // Attempt real model inference if backend is configured
      final recommendation = await _fetchRecommendation(userMessage, context);
      if (recommendation != null) {
        return _formatRecommendationResponse(userMessage, recommendation);
      }

      final message = userMessage.toLowerCase();

      // Context-aware responses based on keywords
      if (message.contains('explain') || message.contains('what is')) {
        return _generateExplanationResponse(userMessage);
      } else if (message.contains('example') || message.contains('show me')) {
        return _generateExampleResponse(userMessage);
      } else if (message.contains('help') || message.contains('how')) {
        return _generateHelpResponse(userMessage);
      } else if (message.contains('difficulty') || message.contains('hard')) {
        return _generateMotivationalResponse(userMessage);
      } else {
        return _generateGeneralResponse(userMessage);
      }
    } catch (e) {
      logger.error('AI Coach failed to generate response', e);
      return 'Je suis désolé, j\'ai rencontré un problème. Pouvez-vous reformuler votre question ?';
    }
  }

  Future<CoachRecommendation?> _fetchRecommendation(String prompt, String? context) async {
    final baseUrl = AppConfig.apiBaseUrl;
    if (baseUrl.isEmpty) return null;

    try {
      final response = await apiService.post<Map<String, dynamic>>(
        '/coach/hybrid',
        data: {
          'question': prompt,
          'answer': context ?? '',
          'source': 'app',
          'difficulty_hint': 'unknown',
          'rating': 4.5,
          'views': 100,
          'votes': 0,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        logger.logApiResponse('/coach/hybrid', response.data!);
        return CoachRecommendation.fromJson(response.data!);
      }
    } catch (e) {
      logger.logError('Failed to fetch hybrid recommendation', e);
    }
    return null;
  }

  String _formatRecommendationResponse(String question, CoachRecommendation rec) {
    return rec.response.isNotEmpty 
        ? rec.response
        : 'Basé sur votre question, je recommande un niveau "${rec.predictedDifficulty}".\n'
          'Confiance du modèle : ${(rec.confidence * 100).toStringAsFixed(1)}%.';
  }

  String _generateExplanationResponse(String message) {
    final pattern = RegExp(
      r'(explain|what is|quest-ce que)',
      caseSensitive: false,
    );
    final cleanMessage = message.replaceAll(pattern, '').trim();
    final explanations = [
      "Excellente question ! Permettez-moi de vous expliquer ce concept en détail. $cleanMessage est un concept fondamental dans votre domaine d'apprentissage.",
      "Je suis ravi de clarifier ce point pour vous. Voici une explication détaillée...",
      "C'est une question importante ! Laissez-moi vous fournir une explication complète et structurée.",
    ];
    return explanations[Random().nextInt(explanations.length)];
  }

  String _generateExampleResponse(String message) {
    final examples = [
      "Bien sûr ! Voici un exemple concret qui illustre ce concept : Imaginez que vous travaillez sur un projet réel...",
      "Excellente demande ! Voici un exemple pratique qui vous aidera à mieux comprendre...",
      "Je vais vous donner un exemple concret et détaillé pour illustrer ce point important.",
    ];
    return examples[Random().nextInt(examples.length)];
  }

  String _generateHelpResponse(String message) {
    final helpResponses = [
      "Je suis là pour vous aider ! Voici comment vous pouvez progresser :",
      "Pas de problème ! Voici quelques stratégies que je recommande :",
      "Je comprends vos difficultés. Laissez-moi vous guider étape par étape...",
    ];
    return helpResponses[Random().nextInt(helpResponses.length)];
  }

  String _generateMotivationalResponse(String message) {
    final motivational = [
      "Je comprends que cela peut sembler difficile, mais vous progressez bien ! Continuez vos efforts.",
      "Chaque apprenant avance à son rythme. Vous êtes sur la bonne voie !",
      "La difficulté fait partie de l'apprentissage. Vous développez de nouvelles compétences importantes.",
    ];
    return motivational[Random().nextInt(motivational.length)];
  }

  String _generateGeneralResponse(String message) {
    return "Merci pour votre question. $message est un excellent sujet à explorer. Voulez-vous que je vous explique cela en détail ou préférez-vous un exemple pratique ?";
  }

  Future<String> generateQuiz(List<String> topics, int difficulty) async {
    try {
      logger.logUserAction('generate_quiz', metadata: {
        'topics': topics,
        'difficulty': difficulty,
      });

      await Future.delayed(const Duration(seconds: 1));

      // In production, use AI to generate quiz
      return "J'ai généré un quiz personnalisé basé sur vos besoins. Il couvre les sujets suivants : ${topics.join(', ')}. Le niveau de difficulté est adapté à votre progression actuelle.";
    } catch (e) {
      logger.error('Failed to generate quiz', e);
      rethrow;
    }
  }

  Future<String> generateExercise(String topic, int level) async {
    try {
      logger.logUserAction('generate_exercise', metadata: {
        'topic': topic,
        'level': level,
      });

      await Future.delayed(const Duration(seconds: 1));

      // In production, use AI to generate exercise
      return "Voici un exercice personnalisé sur '$topic' adapté à votre niveau. Prenez votre temps et n'hésitez pas à me poser des questions si vous avez besoin d'aide !";
    } catch (e) {
      logger.error('Failed to generate exercise', e);
      rethrow;
    }
  }
}

