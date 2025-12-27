// ========================================
// Trainer Space Interfaces
// ========================================

// ==================== PROFIL FORMATEUR ====================

export interface TrainerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  specializations: string[];
  formationsAssigned: string[]; // IDs des formations assignées
  status: 'pending' | 'validated' | 'active' | 'suspended';
  validatedAt?: Date;
  validatedBy?: string;
  joinedAt: Date;
  lastActive: Date;
  preferences: TrainerPreferences;
}

export interface TrainerPreferences {
  language: string;
  notificationsEnabled: boolean;
  emailUpdates: boolean;
  defaultDifficultyLevel: 'Facile' | 'Moyen' | 'Difficile';
  aiAssistanceEnabled: boolean;
}

export interface TrainerStats {
  trainerId: string;
  totalStudents: number;
  activeStudents: number;
  totalFormations: number;
  totalModules: number;
  totalCourses: number;
  totalExercises: number;
  totalQuizzes: number;
  contentPendingValidation: number;
  contentApproved: number;
  averageStudentProgress: number;
  averageStudentSatisfaction: number;
  responseTime: number; // en heures
}

// ==================== GESTION DES CONTENUS PÉDAGOGIQUES ====================

export type ContentStatus = 'draft' | 'pending' | 'approved' | 'published' | 'rejected' | 'archived';
export type ResourceType = 'pdf' | 'video' | 'link' | 'document' | 'image';
export type DifficultyLevel = 'Facile' | 'Moyen' | 'Difficile';

export interface TrainerFormation {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: DifficultyLevel;
  category: string;
  status: ContentStatus;
  duration: number; // en heures
  modules: TrainerModule[];
  enrolledCount: number;
  completionRate: number;
  createdBy: string;
  assignedTo?: string; // ⭐ NOUVEAU - Formateur assigné
  assignedToName?: string; // Nom du formateur assigné
  createdAt: Date;
  updatedAt: Date;
  submittedForValidationAt?: Date;
  publishedAt?: Date; // ⭐ NOUVEAU
  validatedBy?: string;
  validatedAt?: Date;
  rejectionReason?: string;
}

export interface TrainerModule {
  id: string;
  formationId: string;
  title: string;
  description: string;
  order: number;
  status: ContentStatus;
  // ⭐ NOUVELLE STRUCTURE - Contenu direct dans le module
  textContent?: string; // Contenu texte/lecture
  videoUrl?: string; // URL de la vidéo
  labContent?: string; // Contenu du lab/TP
  quiz?: TrainerQuiz; // Quiz associé au module
  isLocked?: boolean; // Module verrouillé jusqu'à validation du précédent
  // ⚠️ ANCIEN SYSTÈME (pour compatibilité)
  courses?: TrainerCourse[];
  coursesCount?: number;
  duration: number; // en heures
  estimatedDuration?: number;
  enrolledStudents?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  submittedForValidationAt?: Date;
  validatedBy?: string;
  validatedAt?: Date;
  rejectionReason?: string;
}

export interface TrainerCourse {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  content: string;
  order: number;
  status: ContentStatus;
  duration: number; // en minutes
  difficulty?: DifficultyLevel; // Niveau de difficulté (optionnel)
  lessons: TrainerLesson[];
  resources: TrainerResource[];
  exercises: TrainerExercise[];
  quizzes: TrainerQuiz[];
  enrolledStudents: number;
  enrolledCount?: number; // Alias pour enrolledStudents (pour compatibilité)
  completionRate: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  submittedForValidationAt?: Date;
  validatedBy?: string;
  validatedAt?: Date;
  rejectionReason?: string;
  isAIGenerated?: boolean;
  aiGenerationPrompt?: string;
  category?: string; // Catégorie du cours (optionnel)
  thumbnailUrl?: string; // URL de la miniature (optionnel)
}

export interface TrainerLesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  duration: number; // en minutes
  type: 'video' | 'text' | 'interactive' | 'quiz';
  videoUrl?: string;
  resources: TrainerResource[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainerResource {
  id: string;
  courseId?: string;
  lessonId?: string;
  title: string;
  description?: string;
  type: ResourceType;
  url: string;
  fileSize?: number; // en bytes
  uploadedBy: string;
  uploadedAt: Date;
  isPublic: boolean;
}

export interface TrainerExercise {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  difficulty: DifficultyLevel;
  estimatedTime: number; // en minutes
  type: 'pratique' | 'simulation' | 'projet' | 'code';
  status: ContentStatus;
  submissions: ExerciseSubmission[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isAIGenerated?: boolean;
  aiGenerationPrompt?: string;
}

export interface TrainerQuiz {
  id: string;
  courseId?: string; // ⚠️ Ancien système (pour compatibilité)
  moduleId?: string; // ⭐ NOUVEAU - Pour nouveau système
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  duration: number; // en minutes
  passingScore: number; // pourcentage
  maxAttempts?: number; // Nombre maximum de tentatives
  questions: QuizQuestion[];
  status: ContentStatus;
  attempts: QuizAttempt[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isAIGenerated?: boolean;
  aiGenerationPrompt?: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: 'mcq' | 'true_false' | 'open' | 'code';
  question: string;
  options?: string[]; // Pour MCQ
  correctAnswer: string | number;
  explanation?: string;
  points: number;
  order: number;
}

export interface ExerciseSubmission {
  id: string;
  exerciseId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  submittedAt: Date;
  content: string;
  attachments: string[];
  status: 'submitted' | 'reviewed' | 'graded';
  feedback?: string;
  score?: number;
  gradedBy?: string;
  gradedAt?: Date;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  startedAt: Date;
  completedAt?: Date;
  score: number;
  percentage: number;
  passed: boolean;
  answers: StudentAnswer[];
  feedback?: string;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface ContentValidationRequest {
  id: string;
  contentId: string;
  contentType: 'formation' | 'module' | 'course' | 'exercise' | 'quiz';
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  feedback?: string;
  rejectionReason?: string;
}

// ==================== INTERACTION AVEC LE COACH VIRTUEL (IA) ====================

export interface AIContentGenerationRequest {
  id: string;
  type: 'exercise' | 'quiz' | 'summary' | 'lesson' | 'example' | 'case_study';
  courseId?: string;
  moduleId?: string;
  prompt: string;
  difficulty: DifficultyLevel;
  context?: string;
  parameters: AIGenerationParameters;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generatedContent?: any;
  generatedAt?: Date;
  reviewed: boolean;
  approved: boolean;
  feedback?: string;
}

export interface AIGenerationParameters {
  language: string;
  tone: 'formal' | 'friendly' | 'motivating' | 'professional';
  detailLevel: 'concise' | 'moderate' | 'detailed';
  includeExamples: boolean;
  includeExplanations: boolean;
  maxLength?: number;
  numberOfQuestions?: number; // Pour les quiz
  difficultyAdjustment?: number; // 0-100
}

export interface AIGeneratedContent {
  id: string;
  requestId: string;
  type: 'exercise' | 'quiz' | 'summary' | 'lesson' | 'example' | 'case_study';
  content: any;
  metadata: {
    generationTime: number; // en ms
    tokensUsed?: number;
    model?: string;
  };
  generatedAt: Date;
  reviewed: boolean;
  approved: boolean;
  used: boolean;
  rating?: number; // 1-5
  feedback?: string;
}

export interface AIConfiguration {
  trainerId: string;
  defaultLanguage: string;
  defaultTone: 'formal' | 'friendly' | 'motivating' | 'professional';
  defaultDetailLevel: 'concise' | 'moderate' | 'detailed';
  enableAutoGeneration: boolean;
  enableSuggestions: boolean;
  difficultyLevel: DifficultyLevel;
  maxResponseLength: number;
  updatedAt: Date;
}

// ==================== SUIVI ET ÉVALUATION DES APPRENANTS ====================

export interface StudentDashboard {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  formationId: string;
  formationName: string;
  overallProgress: number; // pourcentage
  modulesCompleted: number;
  totalModules: number;
  coursesCompleted: number;
  totalCourses: number;
  timeSpent: number; // en heures
  lastActivity: Date;
  currentStreak: number; // jours consécutifs
  averageScore: number;
  performance: StudentPerformance;
  difficulties: StudentDifficulty[];
  achievements: StudentAchievement[];
  chatLevel?: string; // Niveau basé sur les conversations (Débutant, Intermédiaire, Avancé, Expert)
  chatLevelScore?: number; // Score de niveau (0-300+)
  totalConversations?: number; // Nombre total de conversations
  totalChatMessages?: number; // Nombre total de messages
}

export interface StudentPerformance {
  studentId: string;
  formationId: string;
  modulesProgress: ModuleProgress[];
  coursesProgress: CourseProgress[];
  quizScores: QuizScore[];
  exerciseScores: ExerciseScore[];
  timeDistribution: TimeDistribution[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  progress: number; // pourcentage
  completed: boolean;
  timeSpent: number; // en heures
  lastAccessed: Date;
}

export interface CourseProgress {
  courseId: string;
  courseName: string;
  progress: number; // pourcentage
  completed: boolean;
  timeSpent: number; // en minutes
  lastAccessed: Date;
  lessonsCompleted: number;
  totalLessons: number;
}

export interface QuizScore {
  quizId: string;
  quizName: string;
  attempts: number;
  bestScore: number;
  averageScore: number;
  lastAttempt: Date;
  passed: boolean;
}

export interface ExerciseScore {
  exerciseId: string;
  exerciseName: string;
  submitted: boolean;
  score?: number;
  maxScore?: number;
  submittedAt?: Date;
  graded: boolean;
}

export interface TimeDistribution {
  date: Date;
  timeSpent: number; // en minutes
  activity: 'lesson' | 'quiz' | 'exercise' | 'review';
}

export interface StudentDifficulty {
  studentId: string;
  area: string; // Module, cours, concept
  description: string;
  detectedAt: Date;
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
  resolved: boolean;
}

export interface StudentAchievement {
  id: string;
  studentId: string;
  title: string;
  description: string;
  icon: string;
  category: 'progression' | 'quiz' | 'streak' | 'special';
  earnedAt: Date;
}

export interface FormationStatistics {
  formationId: string;
  formationName: string;
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  averageCompletionTime: number; // en jours
  averageScore: number;
  completionRate: number;
  dropoutRate: number;
  modulesStatistics: ModuleStatistics[];
  coursesStatistics: CourseStatistics[];
  performanceTrend: PerformanceTrend[];
}

export interface ModuleStatistics {
  moduleId: string;
  moduleName: string;
  enrolledStudents: number;
  completedStudents: number;
  averageProgress: number;
  averageTimeSpent: number; // en heures
  completionRate: number;
  averageScore: number;
}

export interface CourseStatistics {
  courseId: string;
  courseName: string;
  enrolledStudents: number;
  completedStudents: number;
  averageProgress: number;
  averageTimeSpent: number; // en minutes
  completionRate: number;
  averageScore: number;
}

export interface PerformanceTrend {
  date: Date;
  averageProgress: number;
  activeStudents: number;
  completions: number;
}

export interface AtRiskStudent {
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  formationId: string;
  formationName: string;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
  lastActivity: Date;
  daysInactive: number;
  progress: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  suggestedActions: string[];
}

// ==================== ÉVALUATION ET FEEDBACK ====================

export interface ExerciseReview {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseTitle?: string; // Alias pour exerciseName
  submissionId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  submittedAt: Date;
  content: string;
  attachments: string[];
  answerPreview?: string; // Aperçu de la réponse
  timeSpent?: number; // Temps passé en minutes
  formationId?: string; // ID de la formation
  score?: number;
  maxScore: number;
  feedback?: string;
  recommendations?: string[];
  status: 'pending' | 'reviewed' | 'graded' | 'validated';
  reviewedBy?: string;
  reviewedAt?: Date;
  gradedAt?: Date;
}

export interface QuizReview {
  id: string;
  quizId: string;
  quizName: string;
  quizTitle?: string; // Alias pour quizName
  attemptId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  completedAt: Date;
  score: number;
  percentage: number;
  passed: boolean;
  answers: StudentAnswer[];
  correctAnswers?: number; // Nombre de bonnes réponses
  totalQuestions?: number; // Nombre total de questions
  timeSpent?: number; // Temps passé en minutes
  formationId?: string; // ID de la formation
  hasFeedback?: boolean; // Indique si un feedback a été ajouté
  feedback?: string;
  recommendations?: string[];
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface PersonalizedFeedback {
  id: string;
  studentId: string;
  studentName: string;
  type: 'exercise' | 'quiz' | 'general' | 'encouragement' | 'improvement';
  content: string;
  relatedContentId?: string;
  relatedContentType?: string;
  createdBy: string;
  createdAt: Date;
  read: boolean;
  readAt?: Date;
}

export interface CompetencyValidation {
  id: string;
  studentId: string;
  studentName: string;
  competency: string;
  formationId: string;
  formationName: string;
  validated: boolean;
  validatedBy: string;
  validatedAt: Date;
  evidence: string[]; // IDs des exercices/quiz validés
  notes?: string;
}

export interface LearningPathAdjustment {
  id?: string;
  studentId?: string;
  studentName?: string;
  formationId?: string;
  adjustments?: PathAdjustment[];
  reason?: string;
  adjustedBy?: string;
  adjustedAt?: Date;
  effective?: boolean;
  // Propriétés pour les recommandations basées sur le ML
  confidenceScore?: number; // Score de confiance du modèle ML (0-1 ou 0-100)
  courseTitle?: string; // Titre du cours recommandé
  conversationExcerpt?: string; // Extrait de conversation analysé
  predictedDifficulty?: string; // Difficulté prédite par le ML
}

export interface PathAdjustment {
  type: 'add_module' | 'remove_module' | 'reorder' | 'add_resource' | 'change_difficulty';
  moduleId?: string;
  courseId?: string;
  resourceId?: string;
  newOrder?: number;
  newDifficulty?: DifficultyLevel;
  description: string;
}

// ==================== COMMUNICATION ET NOTIFICATIONS ====================

export interface TrainerMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'trainer' | 'student' | 'admin';
  recipientId: string;
  recipientName: string;
  recipientRole: 'trainer' | 'student' | 'admin';
  subject?: string;
  content: string;
  type: 'message' | 'reminder' | 'feedback' | 'announcement';
  priority: 'low' | 'medium' | 'high';
  attachments?: MessageAttachment[];
  read: boolean;
  readAt?: Date;
  sentAt: Date;
  scheduledFor?: Date;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
}

export interface Reminder {
  id: string;
  trainerId: string;
  targetAudience: 'all_students' | 'specific_students' | 'formation_students';
  targetStudentIds?: string[];
  recipients: string[]; // IDs des destinataires
  formationId?: string;
  type: 'session' | 'deadline' | 'assignment' | 'quiz' | 'general';
  title: string;
  message: string;
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface StudentQuestion {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  courseId?: string;
  courseName?: string;
  moduleId?: string;
  moduleName?: string;
  question: string;
  category: 'content' | 'technical' | 'pedagogical' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'answered' | 'resolved' | 'closed';
  answer?: string;
  answeredBy?: string;
  answeredAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface Alert {
  id: string;
  type: 'student_difficulty' | 'low_performance' | 'inactivity' | 'dropout_risk' | 'content_issue';
  severity: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  relatedStudentId?: string;
  relatedStudentName?: string;
  relatedContentId?: string;
  relatedContentType?: string;
  read: boolean;
  readAt?: Date;
  actionTaken: boolean;
  actionTakenAt?: Date;
  createdAt: Date;
}

// ==================== PERSONNALISATION DES PARCOURS ====================

export interface PersonalizedLearningPath {
  id: string;
  studentId: string;
  studentName: string;
  formationId: string;
  formationName: string;
  formationTitle?: string; // Alias pour formationName
  baseFormationId: string;
  adjustments: LearningPathAdjustment[];
  modules: PersonalizedModule[];
  modulesCount?: number; // Peut être calculé depuis modules.length
  completionRate?: number; // Pourcentage de complétion
  estimatedTime?: number; // Temps estimé en heures
  averageScore?: number; // Score moyen
  adaptations?: Array<{ type: string; label: string }>; // Adaptations simplifiées
  aiSuggestions?: string[]; // Suggestions de l'IA
  status: 'active' | 'completed' | 'archived' | 'draft';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Propriétés pour les recommandations basées sur le ML
  confidenceScore?: number; // Score de confiance du modèle ML (0-1 ou 0-100)
  predictedDifficulty?: string; // Difficulté prédite par le ML
  courseTitle?: string; // Titre du cours recommandé (depuis adjustments[0])
  conversationExcerpt?: string; // Extrait de conversation (depuis adjustments[0])
}

export interface PersonalizedModule {
  moduleId: string;
  moduleName: string;
  order: number;
  difficulty: DifficultyLevel;
  required: boolean;
  estimatedDuration: number; // en heures
  addedAt: Date;
  reason?: string;
}

export interface ContentAdaptation {
  id: string;
  studentId: string;
  studentName: string;
  contentId: string;
  contentType: 'module' | 'course' | 'exercise' | 'quiz';
  originalDifficulty: DifficultyLevel;
  adaptedDifficulty: DifficultyLevel;
  adaptations: AdaptationDetail[];
  reason: string;
  adaptedBy: string;
  adaptedAt: Date;
  effective: boolean;
}

export interface AdaptationDetail {
  type: 'simplify' | 'enrich' | 'add_examples' | 'add_resources' | 'change_format';
  description: string;
  content?: string;
  resources?: string[];
}

export interface ComplementaryResource {
  id: string;
  studentId: string;
  studentName: string;
  relatedContentId: string;
  relatedContentType: string;
  resourceId: string;
  resourceTitle: string;
  resourceType: ResourceType;
  resourceUrl: string;
  reason: string;
  suggestedBy: string;
  suggestedAt: Date;
  accessed: boolean;
  accessedAt?: Date;
  helpful?: boolean;
}

export interface AIPathRefinement {
  id: string;
  studentId: string;
  learningPathId: string;
  prompt: string;
  suggestions: PathSuggestion[];
  applied: boolean;
  appliedAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface PathSuggestion {
  type: 'add_module' | 'remove_module' | 'reorder' | 'change_difficulty' | 'add_resource';
  moduleId?: string;
  courseId?: string;
  resourceId?: string;
  description: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
}

// ==================== ACTIVITÉS ET HISTORIQUE ====================

export interface TrainerActivity {
  id: string;
  trainerId: string;
  type: 'content_created' | 'content_updated' | 'content_submitted' | 'content_approved' | 
        'student_reviewed' | 'feedback_given' | 'message_sent' | 'path_adjusted' | 
        'ai_content_generated' | 'ai_content_approved';
  description: string;
  relatedContentId?: string;
  relatedContentType?: string;
  relatedStudentId?: string;
  metadata?: any;
  timestamp: Date;
}

export interface ContentHistory {
  id: string;
  contentId: string;
  contentType: 'formation' | 'module' | 'course' | 'exercise' | 'quiz';
  action: 'created' | 'updated' | 'submitted' | 'approved' | 'rejected' | 'archived';
  changes?: ContentChange[];
  performedBy: string;
  performedAt: Date;
  notes?: string;
}

export interface CourseRecommendation {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  courseId: string;
  course?: TrainerCourse;
  reason: string;
  conversationExcerpt?: string;
  confidenceScore: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentChange {
  field: string;
  oldValue: any;
  newValue: any;
}
