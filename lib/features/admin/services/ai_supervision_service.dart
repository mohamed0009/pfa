/// AI Supervision Service for Admin
/// Provides AI configuration, monitoring, and content management
import 'dart:async';
import '../models/ai_models.dart';

class AISupervisionService {
  // Singleton pattern
  static final AISupervisionService _instance = AISupervisionService._internal();
  factory AISupervisionService() => _instance;
  AISupervisionService._internal();

  // Current AI Configuration
  AIConfiguration _config = AIConfiguration(
    language: 'Français',
    tone: AITone.friendly,
    detailLevel: AIDetailLevel.moderate,
    maxResponseLength: 500,
    enableQuizGeneration: true,
    enableExerciseGeneration: true,
    enableSummaryGeneration: true,
    enablePersonalization: true,
  );

  // Mock data matching web admin
  final List<AIInteraction> _interactions = [
    AIInteraction(
      id: '1',
      userName: 'Marie Dupont',
      userRole: 'Apprenant',
      question: 'Comment puis-je améliorer mes compétences en Python?',
      response: 'Je vous recommande de commencer par les bases...',
      sentiment: AISentiment.positive,
      responseTime: 1200,
      timestamp: DateTime.now().subtract(const Duration(hours: 2)),
      category: 'Formation',
    ),
    AIInteraction(
      id: '2',
      userName: 'Jean Martin',
      userRole: 'Apprenant',
      question: 'Quels sont les meilleurs cours pour débutants?',
      response: 'Pour les débutants, je suggère...',
      sentiment: AISentiment.neutral,
      responseTime: 980,
      timestamp: DateTime.now().subtract(const Duration(hours: 5)),
      category: 'Orientation',
    ),
    AIInteraction(
      id: '3',
      userName: 'Sophie Bernard',
      userRole: 'Formateur',
      question: 'Comment puis-je créer un quiz interactif?',
      response: 'Vous pouvez utiliser notre générateur de quiz...',
      sentiment: AISentiment.positive,
      responseTime: 1450,
      timestamp: DateTime.now().subtract(const Duration(hours: 8)),
      category: 'Assistance Technique',
    ),
    AIInteraction(
      id: '4',
      userName: 'Pierre Leroy',
      userRole: 'Apprenant',
      question: 'Je ne comprends pas la différence entre...',
      response: 'La différence principale est...',
      sentiment: AISentiment.neutral,
      responseTime: 1100,
      timestamp: DateTime.now().subtract(const Duration(days: 1)),
      category: 'Clarification',
    ),
    AIInteraction(
      id: '5',
      userName: 'Emma Thomas',
      userRole: 'Apprenant',
      question: 'Le système ne fonctionne pas correctement',
      response: 'Je suis désolé pour le désagrément...',
      sentiment: AISentiment.negative,
      responseTime: 890,
      timestamp: DateTime.now().subtract(const Duration(days: 1, hours: 3)),
      category: 'Problème Technique',
      flagged: true,
      flagReason: 'Sentiment négatif - problème technique signalé',
    ),
  ];

  final List<AIGeneratedContent> _generatedContent = [
    AIGeneratedContent(
      id: '1',
      type: AIContentType.quiz,
      courseName: 'Introduction à Python',
      usedCount: 45,
      rating: 4.5,
      generatedAt: DateTime.now().subtract(const Duration(days: 3)),
      content: 'Quiz sur les bases de Python avec 10 questions',
    ),
    AIGeneratedContent(
      id: '2',
      type: AIContentType.exercise,
      courseName: 'JavaScript Avancé',
      usedCount: 32,
      rating: 4.2,
      generatedAt: DateTime.now().subtract(const Duration(days: 5)),
      content: 'Exercice pratique sur les promesses et async/await',
    ),
    AIGeneratedContent(
      id: '3',
      type: AIContentType.summary,
      courseName: 'Bases de données SQL',
      usedCount: 78,
      rating: 4.8,
      generatedAt: DateTime.now().subtract(const Duration(days: 7)),
      content: 'Résumé complet du cours SQL avec points clés',
    ),
    AIGeneratedContent(
      id: '4',
      type: AIContentType.quiz,
      courseName: 'React Fundamentals',
      usedCount: 56,
      rating: 4.6,
      generatedAt: DateTime.now().subtract(const Duration(days: 10)),
      content: 'Quiz interactif sur les hooks React',
    ),
    AIGeneratedContent(
      id: '5',
      type: AIContentType.exercise,
      courseName: 'Machine Learning',
      usedCount: 23,
      rating: 4.3,
      generatedAt: DateTime.now().subtract(const Duration(days: 12)),
      content: 'Exercice de classification avec scikit-learn',
    ),
  ];

  final List<AIKnowledgeDocument> _knowledgeDocuments = [
    AIKnowledgeDocument(
      id: '1',
      title: 'Guide Pédagogique - Python',
      category: 'Programmation',
      fileType: 'pdf',
      fileSize: 2500000,
      status: DocumentStatus.active,
      uploadedBy: 'Admin Principal',
      uploadedAt: DateTime.now().subtract(const Duration(days: 15)),
    ),
    AIKnowledgeDocument(
      id: '2',
      title: 'Référence JavaScript ES6+',
      category: 'Programmation',
      fileType: 'pdf',
      fileSize: 1800000,
      status: DocumentStatus.active,
      uploadedBy: 'Admin Principal',
      uploadedAt: DateTime.now().subtract(const Duration(days: 20)),
    ),
    AIKnowledgeDocument(
      id: '3',
      title: 'Méthodologie Pédagogique',
      category: 'Général',
      fileType: 'docx',
      fileSize: 950000,
      status: DocumentStatus.processing,
      uploadedBy: 'Sophie Martin',
      uploadedAt: DateTime.now().subtract(const Duration(hours: 2)),
    ),
    AIKnowledgeDocument(
      id: '4',
      title: 'FAQ Étudiants',
      category: 'Support',
      fileType: 'pdf',
      fileSize: 1200000,
      status: DocumentStatus.active,
      uploadedBy: 'Admin Principal',
      uploadedAt: DateTime.now().subtract(const Duration(days: 30)),
    ),
  ];

  // Configuration Methods
  Future<AIConfiguration> getConfiguration() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _config;
  }

  Future<void> updateConfiguration(AIConfiguration newConfig) async {
    await Future.delayed(const Duration(milliseconds: 500));
    _config = newConfig;
  }

  // Interactions Methods
  Future<List<AIInteraction>> getInteractions({bool flaggedOnly = false}) async {
    await Future.delayed(const Duration(milliseconds: 400));
    if (flaggedOnly) {
      return _interactions.where((i) => i.flagged).toList();
    }
    return List.from(_interactions);
  }

  Future<void> flagInteraction(String id, String reason) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _interactions.indexWhere((i) => i.id == id);
    if (index != -1) {
      _interactions[index] = _interactions[index].copyWith(
        flagged: true,
        flagReason: reason,
      );
    }
  }

  Future<void> unflagInteraction(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _interactions.indexWhere((i) => i.id == id);
    if (index != -1) {
      _interactions[index] = _interactions[index].copyWith(
        flagged: false,
        flagReason: null,
      );
    }
  }

  // Generated Content Methods
  Future<List<AIGeneratedContent>> getGeneratedContent({AIContentType? type}) async {
    await Future.delayed(const Duration(milliseconds: 350));
    if (type != null) {
      return _generatedContent.where((c) => c.type == type).toList();
    }
    return List.from(_generatedContent);
  }

  Future<void> archiveContent(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _generatedContent.removeWhere((c) => c.id == id);
  }

  // Knowledge Base Methods
  Future<List<AIKnowledgeDocument>> getKnowledgeDocuments() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return List.from(_knowledgeDocuments);
  }

  Future<void> uploadDocument(AIKnowledgeDocument document) async {
    await Future.delayed(const Duration(milliseconds: 1000));
    _knowledgeDocuments.add(document);
  }

  Future<void> deleteDocument(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _knowledgeDocuments.removeWhere((d) => d.id == id);
  }

  // Statistics Methods
  Future<AIStatistics> getStatistics() async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    final flaggedCount = _interactions.where((i) => i.flagged).length;
    final avgResponseTime = _interactions.isEmpty 
        ? 0 
        : _interactions.map((i) => i.responseTime).reduce((a, b) => a + b) ~/ _interactions.length;
    
    final sentimentCounts = {
      AISentiment.positive: _interactions.where((i) => i.sentiment == AISentiment.positive).length,
      AISentiment.neutral: _interactions.where((i) => i.sentiment == AISentiment.neutral).length,
      AISentiment.negative: _interactions.where((i) => i.sentiment == AISentiment.negative).length,
    };
    
    final contentTypeCounts = {
      AIContentType.quiz: _generatedContent.where((c) => c.type == AIContentType.quiz).length,
      AIContentType.exercise: _generatedContent.where((c) => c.type == AIContentType.exercise).length,
      AIContentType.summary: _generatedContent.where((c) => c.type == AIContentType.summary).length,
    };
    
    final avgRating = _generatedContent.isEmpty 
        ? 0.0 
        : _generatedContent.where((c) => c.rating != null).map((c) => c.rating!).reduce((a, b) => a + b) / 
          _generatedContent.where((c) => c.rating != null).length;
    
    final totalKBSize = _knowledgeDocuments.map((d) => d.fileSize).reduce((a, b) => a + b);
    final kbSizeMB = (totalKBSize / 1024 / 1024).round();
    final indexedDocs = _knowledgeDocuments.where((d) => d.status == DocumentStatus.active).length;
    
    return AIStatistics(
      totalInteractions: _interactions.length,
      averageResponseTime: avgResponseTime,
      flaggedInteractions: flaggedCount,
      sentimentBreakdown: SentimentBreakdown(
        positive: sentimentCounts[AISentiment.positive]!,
        neutral: sentimentCounts[AISentiment.neutral]!,
        negative: sentimentCounts[AISentiment.negative]!,
      ),
      generatedContentCount: GeneratedContentCount(
        quiz: contentTypeCounts[AIContentType.quiz]!,
        exercise: contentTypeCounts[AIContentType.exercise]!,
        summary: contentTypeCounts[AIContentType.summary]!,
      ),
      averageContentRating: avgRating,
      knowledgeBaseSize: kbSizeMB,
      indexedDocuments: indexedDocs,
    );
  }
}
