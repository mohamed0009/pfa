// ========================================
// Formation Interfaces (Nouvelle Architecture)
// ========================================

export interface FormationTrainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Formation {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  category: string; // Spécialité
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  duration: number; // en heures
  modules: FormationModule[];
  enrolledCount: number;
  completionRate: number;
  createdBy: string;
  assignedTo?: string; // Formateur assigné
  assignedToName?: string;
  trainer?: FormationTrainer; // Pour compatibilité avec les composants existants
  modulesCount?: number; // Calculé depuis modules.length
  coursesCount?: number; // 0 dans nouvelle architecture
  quizzesCount?: number; // Calculé depuis modules
  createdAt: Date;
  updatedAt: Date;
  submittedForValidationAt?: Date;
  publishedAt?: Date;
  validatedBy?: string;
  validatedAt?: Date;
  rejectionReason?: string;
}

export interface FormationModule {
  id: string;
  formationId: string;
  title: string;
  description: string;
  order: number;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
  // Contenu direct du module
  textContent?: string; // Contenu texte/lecture
  videoUrl?: string; // URL de la vidéo
  labContent?: string; // Contenu du lab/TP
  quiz?: ModuleQuiz; // Quiz associé
  isLocked?: boolean; // Verrouillé jusqu'à validation du précédent
  duration: number; // en heures
  createdAt: Date;
  updatedAt: Date;
  // Pour compatibilité avec ancienne structure
  courses?: any[]; // Vide dans nouvelle architecture
  coursesCount?: number; // 0 dans nouvelle architecture
}

export interface ModuleQuiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  duration: number; // en minutes
  passingScore: number; // pourcentage
  maxAttempts: number;
  questions: QuizQuestion[];
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED';
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: 'mcq' | 'true_false' | 'open';
  options?: string[]; // Pour MCQ
  correctAnswer: string | number;
  explanation?: string;
  points: number;
  order: number;
}

// Inscription à une formation
export interface FormationEnrollment {
  id: string;
  userId: string;
  formationId: string;
  enrollmentId?: string; // Alias pour id (pour compatibilité)
  status: 'EN_COURS' | 'COMPLETED' | 'DROPPED';
  enrolledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  targetCompletionDate?: Date;
  certificateEarned: boolean;
  certificateUrl?: string;
  progress: FormationProgress;
  moduleProgresses: ModuleProgress[];
  // Pour compatibilité avec composants existants
  formationTitle?: string;
  formation?: Formation;
}

// Progression globale de la formation
export interface FormationProgress {
  id: string;
  enrollmentId: string;
  overallProgress: number; // 0-100
  completedModules: number;
  totalModules: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageQuizScore: number;
  totalTimeSpent: number; // en heures
  currentStreak: number; // jours consécutifs
  lastActivityDate?: Date;
  // Pour compatibilité avec ancienne structure
  completedLessons?: number; // 0 dans nouvelle architecture
  totalLessons?: number; // 0 dans nouvelle architecture
  completedCourses?: number; // 0 dans nouvelle architecture
  totalCourses?: number; // 0 dans nouvelle architecture
}

// Progression par module
export interface ModuleProgress {
  id: string;
  enrollmentId: string;
  moduleId: string;
  // Progression des éléments
  textCompleted: boolean;
  videoCompleted: boolean;
  labCompleted: boolean;
  quizCompleted: boolean;
  quizScore?: number;
  isModuleValidated: boolean; // Validé si quiz réussi
  // Timestamps
  textCompletedAt?: Date;
  videoCompletedAt?: Date;
  labCompletedAt?: Date;
  quizCompletedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Module associé (pour affichage)
  module?: FormationModule;
  
  // Méthodes calculées
  getProgressPercentage?(): number;
  isFullyCompleted?(): boolean;
}
