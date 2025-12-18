import { Routes } from '@angular/router';
import { UserLayoutComponent } from './layout/user-layout.component';
import { authGuard } from '../guards/auth.guard';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [authGuard],
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
        loadComponent: () => import('./pages/profile/user-profile.component').then(m => m.UserProfileComponent)
      },
      {
        path: 'chat',
        loadComponent: () => import('./pages/chat/ai-chat.component').then(m => m.AiChatComponent)
      },
      // NOUVEAU : Catalogue de cours (remplace learning-path)
      {
        path: 'courses',
        loadComponent: () => import('./pages/courses/course-catalog.component').then(m => m.CourseCatalogComponent)
      },
      // NOUVEAU : Détails d'un cours
      {
        path: 'courses/:id',
        loadComponent: () => import('./pages/courses/course-details.component').then(m => m.CourseDetailsComponent)
      },
      // Garde l'ancien route pour compatibilité
      {
        path: 'learning-path',
        redirectTo: 'courses',
        pathMatch: 'full'
      },
      {
        path: 'assessments',
        loadComponent: () => import('./pages/assessments/assessments.component').then(m => m.AssessmentsComponent)
      },
      {
        path: 'progress',
        loadComponent: () => import('./pages/progress/user-progress.component').then(m => m.UserProgressComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/user-notifications.component').then(m => m.UserNotificationsComponent)
      },
      {
        path: 'search',
        loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent)
      },
      {
        path: 'support',
        loadComponent: () => import('./pages/support/user-support.component').then(m => m.UserSupportComponent)
      }
    ]
  },
  // NOUVEAU : Course Player (fullscreen, en dehors du layout)
  {
    path: 'course-player/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/course-player/course-player.component').then(m => m.CoursePlayerComponent)
  }
];




