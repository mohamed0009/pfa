// ============================================
// INTERFACES POUR LE SYSTÈME DE COURS
// Inspiré de Coursera pour une plateforme éducative avec Coach IA
// ============================================

export type CourseLevel = 'Débutant' | 'Intermédiaire' | 'Avancé';
export type CourseCategory = 'Développement' | 'Data Science' | 'Business' | 'Design' | 'Marketing' | 'Langues';
export type LessonType = 'video' | 'lecture' | 'quiz' | 'exercise' | 'ai-chat';
export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'code';
export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

// Course - Formation complète
export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  thumbnailUrl: string;
  previewVideoUrl?: string;
  category: CourseCategory;
  level: CourseLevel;
  language: string; // 'Français'
  duration: string; // ex: "6 semaines"
  estimatedHours: number; // Heures totales estimées
  rating: number; // 0-5
  reviewsCount: number;
  enrolledCount: number;
  price: number; // 0 pour gratuit
  skills: string[]; // Compétences acquises
  learningObjectives: string[]; // Objectifs d'apprentissage
  prerequisites: string[]; // Prérequis
  syllabus: CourseModule[]; // Programme du cours
  createdAt: Date;
  updatedAt: Date;
  isPopular: boolean;
  isCertified: boolean; // Délivre un certificat
  certificate?: CourseCertificate;
}

// CourseModule - Module/Semaine du cours
export interface CourseModule {
  id: string;
  courseId: string;
  moduleNumber: number;
  title: string;
  description: string;
  estimatedHours: number;
  lessons: Lesson[];
  unlockDate?: Date; // Date de déverrouillage
  isLocked: boolean;
}

// Lesson - Leçon (vidéo, lecture, quiz, exercice)
export interface Lesson {
  id: string;
  moduleId: string;
  lessonNumber: number;
  type: LessonType;
  title: string;
  description: string;
  duration: number; // en minutes
  videoUrl?: string; // Pour type 'video'
  contentUrl?: string; // Pour type 'lecture' (PDF, article)
  quizId?: string; // Pour type 'quiz'
  exerciseId?: string; // Pour type 'exercise'
  transcript?: string; // Transcription vidéo
  resources?: LessonResource[]; // Ressources téléchargeables
  isCompleted: boolean;
  isMandatory: boolean;
  order: number;
}

// LessonResource - Ressource téléchargeable
export interface LessonResource {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'code' | 'link';
  url: string;
  size?: string; // ex: "2.5 MB"
}

// CourseQuiz - Quiz Coursera-style
export interface CourseQuiz {
  id: string;
  lessonId?: string;
  moduleId?: string;
  title: string;
  description: string;
  duration: number; // Temps limite en minutes
  passingScore: number; // Score minimum pour réussir (sur 100)
  maxAttempts: number; // Nombre maximum de tentatives
  questions: QuizQuestion[];
  isGraded: boolean; // Quiz noté ou pratique
  availableAfter?: Date;
}

// QuizQuestion - Question de quiz
export interface QuizQuestion {
  id: string;
  quizId: string;
  questionNumber: number;
  type: QuestionType;
  question: string;
  explanation?: string; // Explication de la réponse
  points: number;
  options?: QuizOption[]; // Pour QCM
  correctAnswer?: string | string[]; // Réponse(s) correcte(s)
  codeTemplate?: string; // Pour questions de code
  aiHintEnabled: boolean; // Autoriser l'aide du coach IA
}

// QuizOption - Option de réponse QCM
export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// QuizAttempt - Tentative de quiz
export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  answers: QuizAnswer[];
  score: number; // Sur 100
  passed: boolean;
  startedAt: Date;
  submittedAt?: Date;
  timeSpent: number; // en secondes
  feedback: string;
}

// QuizAnswer - Réponse de l'utilisateur
export interface QuizAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
  feedback?: string;
  aiExplanation?: string; // Explication générée par l'IA
}

// Enrollment - Inscription à un cours
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  targetCompletionDate?: Date; // Deadline personnalisée
  progress: CourseProgress;
  lastAccessedLessonId?: string;
  certificateEarned: boolean;
  certificateUrl?: string;
}

// CourseProgress - Progression dans un cours
export interface CourseProgress {
  enrollmentId: string;
  overallProgress: number; // Pourcentage 0-100
  completedLessons: number;
  totalLessons: number;
  completedModules: number;
  totalModules: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageQuizScore: number;
  totalTimeSpent: number; // en heures
  currentStreak: number; // Jours consécutifs d'activité
  lastActivityDate: Date;
  moduleProgress: ModuleProgress[];
}

// ModuleProgress - Progression par module
export interface ModuleProgress {
  moduleId: string;
  progress: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
  completedAt?: Date;
}

// CourseCertificate - Certificat de cours
export interface CourseCertificate {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  completionDate: Date;
  certificateUrl: string;
  verificationCode: string;
  skills: string[];
}

// VideoProgress - Progression vidéo
export interface VideoProgress {
  lessonId: string;
  userId: string;
  watchedSeconds: number;
  totalSeconds: number;
  progress: number; // 0-100
  isCompleted: boolean;
  lastWatchedAt: Date;
}

// LearningDeadline - Deadline d'apprentissage
export interface LearningDeadline {
  id: string;
  enrollmentId: string;
  type: 'module' | 'quiz' | 'assignment' | 'course';
  itemId: string; // ID du module, quiz, etc.
  itemTitle: string;
  dueDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
  reminderSent: boolean;
}

// AICoachMessage - Message du coach IA dans le contexte d'un cours
export interface AICoachMessage {
  id: string;
  courseId: string;
  lessonId?: string;
  userId: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  context?: {
    lessonTitle?: string;
    questionAsked?: string;
    videoTimestamp?: number; // Position dans la vidéo
  };
  audioUrl?: string; // Pour support audio
}

// AICoachSession - Session de chat avec le coach IA
export interface AICoachSession {
  id: string;
  courseId: string;
  userId: string;
  lessonId?: string;
  messages: AICoachMessage[];
  startedAt: Date;
  lastMessageAt: Date;
  isActive: boolean;
}




