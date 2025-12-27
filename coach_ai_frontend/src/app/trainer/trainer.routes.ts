import { Routes } from '@angular/router';
import { TrainerLayoutComponent } from './layout/trainer-layout.component';
import { trainerGuard } from './guards/trainer.guard';

export const trainerRoutes: Routes = [
  {
    path: '',
    component: TrainerLayoutComponent,
    canActivate: [trainerGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'content',
        loadComponent: () => import('./pages/content/content-management/content-management.component').then(m => m.ContentManagementComponent)
      },
      {
        path: 'content/formations',
        loadComponent: () => import('./pages/content/formations/formations.component').then(m => m.FormationsComponent)
      },
      {
        path: 'content/formations/:id',
        loadComponent: () => import('./pages/content/formation-details/formation-details.component').then(m => m.FormationDetailsComponent)
      },
      {
        path: 'content/formations/:id/students',
        loadComponent: () => import('./pages/content/formation-students/formation-students.component').then(m => m.FormationStudentsComponent)
      },
      {
        path: 'content/modules',
        loadComponent: () => import('./pages/content/modules/modules.component').then(m => m.ModulesComponent)
      },
      {
        path: 'content/modules/:id',
        loadComponent: () => import('./pages/content/module-details/module-details.component').then(m => m.ModuleDetailsComponent)
      },
      {
        path: 'content/courses',
        loadComponent: () => import('./pages/content/courses/courses.component').then(m => m.CoursesComponent)
      },
      {
        path: 'content/courses/:id',
        loadComponent: () => import('./pages/content/course-details/course-details.component').then(m => m.CourseDetailsComponent)
      },
      {
        path: 'content/exercises',
        loadComponent: () => import('./pages/content/exercises/exercises.component').then(m => m.ExercisesComponent)
      },
      {
        path: 'content/quizzes',
        loadComponent: () => import('./pages/content/quizzes/quizzes.component').then(m => m.QuizzesComponent)
      },
      {
        path: 'content/quizzes/:id',
        loadComponent: () => import('./pages/content/quiz-details/quiz-details.component').then(m => m.QuizDetailsComponent)
      },
      {
        path: 'ai-assistant',
        loadComponent: () => import('./pages/ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent)
      },
      {
        path: 'ai-recommendations',
        loadComponent: () => import('./pages/ai-recommendations/ai-recommendations-list.component').then(m => m.AIRecommendationsListComponent)
      },
      {
        path: 'ai-analysis',
        loadComponent: () => import('./pages/ai-analysis/conversations-analysis.component').then(m => m.ConversationsAnalysisComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./pages/students/students-list/students-list.component').then(m => m.StudentsListComponent)
      },
      {
        path: 'students/:id',
        loadComponent: () => import('./pages/students/student-details/student-details.component').then(m => m.StudentDetailsComponent)
      },
      {
        path: 'evaluation',
        loadComponent: () => import('./pages/evaluation/evaluation.component').then(m => m.EvaluationComponent)
      },
      {
        path: 'evaluation/exercises',
        loadComponent: () => import('./pages/evaluation/exercise-reviews/exercise-reviews.component').then(m => m.ExerciseReviewsComponent)
      },
      {
        path: 'evaluation/quizzes',
        loadComponent: () => import('./pages/evaluation/quiz-reviews/quiz-reviews.component').then(m => m.QuizReviewsComponent)
      },
      {
        path: 'communication',
        loadComponent: () => import('./pages/communication/communication.component').then(m => m.CommunicationComponent)
      },
      {
        path: 'communication/messages',
        loadComponent: () => import('./pages/communication/messages/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: 'communication/reminders',
        loadComponent: () => import('./pages/communication/reminders/reminders.component').then(m => m.RemindersComponent)
      },
      {
        path: 'communication/questions',
        loadComponent: () => import('./pages/communication/questions/questions.component').then(m => m.QuestionsComponent)
      },
      {
        path: 'learning-paths',
        loadComponent: () => import('./pages/learning-paths/learning-paths.component').then(m => m.LearningPathsComponent)
      },
      {
        path: 'statistics',
        loadComponent: () => import('./pages/statistics/statistics.component').then(m => m.StatisticsComponent)
      },
      {
        path: 'recommendations',
        loadComponent: () => import('./pages/recommendations/recommendations.component').then(m => m.RecommendationsComponent)
      },
      {
        path: 'recommendations/:id',
        loadComponent: () => import('./pages/recommendations/recommendation-details/recommendation-details.component').then(m => m.RecommendationDetailsComponent)
      }
    ]
  }
];
