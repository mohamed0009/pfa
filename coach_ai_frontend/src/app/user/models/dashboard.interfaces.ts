// Interfaces pour le tableau de bord utilisateur

export interface UserDashboardSummary {
  totalEnrollments: number;
  activeEnrollments: number;
  completedCourses: number;
  certificatesEarned: number;
  totalTimeSpent: number; // en heures
  currentStreak: number; // jours consécutifs
  enrollments: EnrollmentCard[];
  nextSteps: NextStepItem[];
  upcomingDeadlines: DeadlineItem[];
  recentAchievements: Achievement[];
}

export interface EnrollmentCard {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseImage: string;
  courseLevel: string;
  estimatedHours: number;
  progress: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  nextLessonId?: string;
  nextLessonTitle?: string;
  nextModuleId?: string;
  nextModuleTitle?: string;
  lastAccessedAt: Date;
  canContinue: boolean;
  certificateAvailable: boolean;
}

export interface NextStepItem {
  type: 'lesson' | 'quiz' | 'lab' | 'module';
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface DeadlineItem {
  id: string;
  enrollmentId: string;
  type: 'module' | 'quiz' | 'assignment' | 'course';
  itemId: string;
  itemTitle: string;
  courseTitle: string;
  dueDate: Date;
  isCompleted: boolean;
  daysRemaining: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'progression' | 'quiz' | 'streak' | 'certificate' | 'special';
  earnedAt: Date;
  points?: number;
}

export interface FormationDetail {
  formationId: string;
  formationTitle: string;
  formationDescription: string;
  formationLevel: string;
  formationCategory: string;
  formationImage: string;
  skills: string[];
  overallProgress: number;
  completedModules: number;
  totalModules: number;
  estimatedHours: number;
  enrolledAt: Date;
  courses: CourseInFormation[];
}

export interface CourseInFormation {
  courseId: string;
  courseTitle: string;
  courseOrder: number;
  progress: number;
  modules: ModuleInCourse[];
}

export interface ModuleInCourse {
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  progress: number;
  status: 'locked' | 'in_progress' | 'completed';
  completedLessons: number;
  totalLessons: number;
  estimatedHours: number;
  isNextToComplete: boolean;
}

