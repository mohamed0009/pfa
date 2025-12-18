import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { adminGuard } from './guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
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
        path: 'users',
        loadComponent: () => import('./pages/users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./pages/users/user-details/user-details.component').then(m => m.UserDetailsComponent)
      },
      {
        path: 'courses',
        loadComponent: () => import('./pages/courses/courses-list/courses-list.component').then(m => m.CoursesListComponent)
      },
      {
        path: 'courses/:id',
        loadComponent: () => import('./pages/courses/course-details/course-details.component').then(m => m.CourseDetailsComponent)
      },
      {
        path: 'content',
        loadComponent: () => import('./pages/content/content-management/content-management.component').then(m => m.ContentManagementComponent)
      },
      {
        path: 'ai-supervision',
        loadComponent: () => import('./pages/ai/ai-supervision/ai-supervision.component').then(m => m.AiSupervisionComponent)
      },
      {
        path: 'trainers',
        loadComponent: () => import('./pages/trainers/trainers-management/trainers-management.component').then(m => m.TrainersManagementComponent)
      },
      {
        path: 'support',
        loadComponent: () => import('./pages/support/support-tickets/support-tickets.component').then(m => m.SupportTicketsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/notifications-management/notifications-management.component').then(m => m.NotificationsManagementComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent)
      }
    ]
  }
];





