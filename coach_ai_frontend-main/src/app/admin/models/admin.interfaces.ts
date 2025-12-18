// ==================== UTILISATEURS ====================

export type UserRole = 'Administrateur' | 'Formateur' | 'Apprenant';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
  training: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  coursesEnrolled: number;
  coursesCompleted: number;
  lastActive?: Date;
  createdAt: Date;
  permissions?: string[];
}

export interface UserProfile extends User {
  phone?: string;
  address?: string;
  bio?: string;
  preferences?: {
    language: string;
    notifications: boolean;
    emailUpdates: boolean;
  };
  activity: UserActivity[];
  progress: UserProgress[];
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

// ==================== CONTENUS PÉDAGOGIQUES ====================

export type ContentType = 'formation' | 'module' | 'cours' | 'ressource';
export type ContentStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
export type ResourceType = 'pdf' | 'video' | 'link' | 'document' | 'quiz' | 'exercise';

export interface Formation {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  category: string;
  status: ContentStatus;
  duration: number; // en heures
  modules: Module[];
  enrolledCount: number;
  completionRate: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  formationId: string;
  title: string;
  description: string;
  order: number;
  status: ContentStatus;
  courses: Course[];
  duration: number; // en heures
  createdBy: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  content: string;
  order: number;
  status: ContentStatus;
  duration: number; // en minutes
  lessons: Lesson[];
  resources: Resource[];
  enrolledStudents: number;
  completionRate: number;
  createdBy: string;
  createdAt: Date;
  validatedBy?: string;
  validatedAt?: Date;
  rejectionReason?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  duration: number;
  type: 'video' | 'text' | 'interactive' | 'quiz';
}

export interface Resource {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  fileSize?: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ContentValidation {
  id: string;
  contentId: string;
  contentType: ContentType;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  feedback?: string;
}

// ==================== COACH VIRTUEL IA ====================

export interface AIConfiguration {
  id: string;
  language: string;
  tone: 'formal' | 'friendly' | 'motivating' | 'professional';
  detailLevel: 'concise' | 'moderate' | 'detailed';
  enableQuizGeneration: boolean;
  enableExerciseGeneration: boolean;
  enableSummaryGeneration: boolean;
  enablePersonalization: boolean;
  maxResponseLength: number;
  updatedBy: string;
  updatedAt: Date;
}

export interface AIInteraction {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  timestamp: Date;
  question: string;
  response: string;
  category: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  flagged: boolean;
  flagReason?: string;
  responseTime: number; // en ms
}

export interface AIGeneratedContent {
  id: string;
  type: 'quiz' | 'exercise' | 'summary';
  courseId: string;
  courseName: string;
  content: any;
  generatedAt: Date;
  usedCount: number;
  rating?: number;
  status: 'active' | 'archived';
}

export interface AIKnowledgeDocument {
  id: string;
  title: string;
  category: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  indexed: boolean;
  status: 'processing' | 'active' | 'error';
}

// ==================== FORMATEURS ====================

export interface Trainer {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  status: 'pending' | 'validated' | 'active' | 'suspended';
  specializations: string[];
  bio: string;
  formationsAssigned: string[];
  studentsCount: number;
  coursesCreated: number;
  rating: number;
  joinedAt: Date;
  validatedAt?: Date;
  validatedBy?: string;
}

export interface TrainerActivity {
  id: string;
  trainerId: string;
  type: 'content_created' | 'content_updated' | 'student_interaction' | 'lesson_completed';
  description: string;
  timestamp: Date;
  metadata?: any;
}

export interface TrainerMetrics {
  trainerId: string;
  studentsActive: number;
  averageProgress: number;
  contentCreated: number;
  contentPending: number;
  studentSatisfaction: number;
  responseTime: number; // en heures
}

// ==================== NOTIFICATIONS ====================

export type NotificationType = 'announcement' | 'alert' | 'reminder' | 'motivation' | 'update';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  targetAudience: 'all' | 'apprenants' | 'formateurs' | 'administrateurs' | 'specific';
  targetUserIds?: string[];
  scheduledFor?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  isRead: boolean;
  createdBy: string;
  createdAt: Date;
  readCount?: number;
  totalRecipients?: number;
}

export interface AutomaticNotificationRule {
  id: string;
  name: string;
  type: 'training_reminder' | 'delay_alert' | 'achievement' | 'motivation';
  enabled: boolean;
  trigger: {
    event: string;
    condition: string;
    value: any;
  };
  template: string;
  frequency?: string;
  createdBy: string;
  createdAt: Date;
}

// ==================== SUPPORT ====================

export type TicketStatus = 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'pedagogical' | 'account' | 'payment' | 'other';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  userId: string;
  userName: string;
  userEmail: string;
  assignedTo?: string;
  assignedToName?: string;
  messages: TicketMessage[];
  attachments?: TicketAttachment[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolutionTime?: number; // en heures
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: Date;
  isInternal: boolean;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// ==================== ANALYTICS & DASHBOARD ====================

export interface Analytics {
  totalUsers: number;
  activeUsers: number;
  userGrowth: number;
  totalCourses: number;
  publishedCourses: number;
  totalFormations: number;
  courseEnrollments: number;
  averageCompletion: number;
  totalStudyHours: number;
  usersByRole: {
    administrateurs: number;
    formateurs: number;
    apprenants: number;
  };
}

export interface UserProgress {
  userId: string;
  courseId: string;
  courseName: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed: Date;
  timeSpent: number;
  grade?: number;
}

export interface Grade {
  id: string;
  userId: string;
  courseId: string;
  lessonId?: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  submittedAt: Date;
  gradedBy?: string;
}

export interface LearnerActivity {
  userId: string;
  userName: string;
  userAvatar: string;
  courseId: string;
  courseName: string;
  action: 'enrolled' | 'completed_module' | 'completed_course' | 'quiz_taken' | 'resource_accessed';
  date: Date;
  metadata?: any;
}

export interface PerformanceMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface DropoutRisk {
  userId: string;
  userName: string;
  userAvatar: string;
  courseId: string;
  courseName: string;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
  lastActivity: Date;
  daysInactive: number;
  progress: number;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeCharts: boolean;
  sections: string[];
}




