// ========================================
// User Space Interfaces
// ========================================

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  formation: string;
  niveau: 'Débutant' | 'Intermédiaire' | 'Avancé';
  preferences: LearningPreferences;
  joinedAt: Date;
  lastActive: Date;
}

export interface LearningPreferences {
  learningPace: 'Lent' | 'Modéré' | 'Rapide';
  preferredContentTypes: ContentType[];
  studyTimePreference: 'Matin' | 'Après-midi' | 'Soir' | 'Nuit';
  notificationsEnabled: boolean;
  weeklyGoalHours: number;
}

export type ContentType = 'Vidéo' | 'Lecture' | 'Exercice Pratique' | 'Quiz' | 'Simulation';

// AI Chat
export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type: 'text' | 'suggestion' | 'feedback';
  attachments?: ChatAttachment[];
  // AI metadata (optional, added when using direct AI)
  aiMetadata?: {
    predictedDifficulty?: string;
    confidence?: number;
    source?: string;
  };
}

export interface ChatAttachment {
  id: string;
  type: 'link' | 'document' | 'exercise' | 'audio';
  title: string;
  url: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  lastMessage: string;
  lastMessageDate: Date;
  messagesCount: number;
  isActive: boolean;
}

// Learning Path
export interface LearningPath {
  id: string;
  userId: string;
  formation: string;
  niveau: string;
  startDate: Date;
  estimatedEndDate: Date;
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
  modules: LearningModule[];
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  progressPercentage: number;
  estimatedDuration: number; // en heures
  lessons: Lesson[];
  order: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: ContentType;
  duration: number; // en minutes
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  resourceUrl?: string;
  order: number;
}

// Assessments & Quizzes
export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  duration: number; // en minutes
  questionsCount: number;
  passingScore: number; // pourcentage
  attempts: QuizAttempt[];
  questions: Question[];
  isAIGenerated: boolean;
}

export interface Question {
  id: string;
  type: 'mcq' | 'true_false' | 'open';
  question: string;
  options?: string[]; // Pour MCQ
  correctAnswer: string | number; // index pour MCQ, "true"/"false" pour T/F
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  score: number;
  percentage: number;
  passed: boolean;
  answers: UserAnswer[];
  feedback: string;
}

export interface UserAnswer {
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
  pointsEarned: number;
}

// Exercise
export interface Exercise {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: 'pratique' | 'simulation' | 'projet';
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  estimatedTime: number;
  instructions: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'reviewed';
  submission?: ExerciseSubmission;
}

export interface ExerciseSubmission {
  id: string;
  exerciseId: string;
  userId: string;
  submittedAt: Date;
  content: string;
  attachments: string[];
  feedback?: string;
  score?: number;
  reviewedAt?: Date;
}

// Progress & Dashboard
export interface UserProgress {
  userId: string;
  overallProgress: number; // pourcentage global
  modulesCompleted: number;
  totalModules: number;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesCompleted: number;
  averageQuizScore: number;
  totalStudyTime: number; // en heures
  currentStreak: number; // jours consécutifs
  longestStreak: number;
  weeklyGoalProgress: number; // pourcentage
  achievements: Achievement[];
  recentActivity: ActivityLog[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'progression' | 'quiz' | 'streak' | 'special';
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'lesson_completed' | 'quiz_passed' | 'exercise_submitted' | 'chat_session' | 'module_completed';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

// Statistics
export interface LearningStats {
  weeklyStudyTime: number[];
  moduleProgress: { moduleName: string; progress: number }[];
  quizPerformance: { quizName: string; score: number; date: Date }[];
  skillsProgress: { skill: string; level: number }[];
}

// Notifications
export interface UserNotification {
  id: string;
  userId: string;
  type: 'reminder' | 'new_content' | 'motivation' | 'alert' | 'achievement';
  title: string;
  message: string;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  createdBy?: 'admin' | 'system' | 'trainer' | string; // Source de la notification
}

// Recommendations
export interface Recommendation {
  id: string;
  userId: string;
  type: 'course' | 'exercise' | 'quiz' | 'resource';
  title: string;
  description: string;
  reason: string; // Pourquoi recommandé
  targetId: string; // ID du cours/exercice recommandé
  relevanceScore: number; // 0-100
  createdAt: Date;
  isAIGenerated: boolean;
}

// Support Ticket (User side)
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: 'technique' | 'contenu' | 'compte' | 'autre';
  priority: 'basse' | 'moyenne' | 'haute';
  status: 'nouveau' | 'en_cours' | 'résolu' | 'fermé';
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  sender: 'user' | 'support' | 'trainer';
  senderName: string;
  content: string;
  timestamp: Date;
  attachments?: string[];
}

// Search
export interface SearchResult {
  id: string;
  type: 'module' | 'lesson' | 'quiz' | 'resource' | 'conversation';
  title: string;
  description: string;
  url: string;
  relevance: number;
  category: string;
  metadata?: any;
}

export interface SearchFilters {
  type?: string[];
  niveau?: string[];
  formation?: string[];
  dateRange?: { start: Date; end: Date };
}

// Favorites
export interface Favorite {
  id: string;
  userId: string;
  targetType: 'module' | 'lesson' | 'quiz' | 'resource';
  targetId: string;
  targetTitle: string;
  addedAt: Date;
}




