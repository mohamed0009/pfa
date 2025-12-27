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
      {
        path: 'chat/trainer',
        loadComponent: () => import('./pages/chat/trainer-chat.component').then(m => m.TrainerChatComponent)
      },
      // NOUVEAU : Catalogue de formations (affiche formations, pas cours directement)
      {
        path: 'courses',
        loadComponent: () => import('./pages/formations/formations-catalog.component').then(m => m.FormationsCatalogComponent)
      },
      // NOUVEAU : Détails d'une formation (avec modules/cours)
      {
        path: 'formations/:id',
        loadComponent: () => import('./pages/formations/formation-details.component').then(m => m.FormationDetailsComponent)
      },
      // NOUVEAU : Module player (affiche le contenu d'un module : texte, vidéo, lab, quiz)
      {
        path: 'formations/:id/modules/:moduleId',
        loadComponent: () => import('./pages/formations/module-player.component').then(m => m.ModulePlayerComponent)
      },
      // NOUVEAU : Mes formations en cours
      {
        path: 'my-formations',
        loadComponent: () => import('./pages/formations/my-formations.component').then(m => m.MyFormationsComponent)
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
        path: 'quiz/:id',
        loadComponent: () => import('./pages/quiz/quiz-player.component').then(m => m.QuizPlayerComponent)
      },
      {
        path: 'lab/:id',
        loadComponent: () => import('./pages/lab/lab-player.component').then(m => m.LabPlayerComponent)
      },
      {
        path: 'recommended',
        loadComponent: () => import('./pages/recommended/recommended-formations.component').then(m => m.RecommendedFormationsComponent)
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
        path: 'certificates',
        loadComponent: () => import('./pages/certificates/certificates-list.component').then(m => m.CertificatesListComponent)
      },
      {
        path: 'certificate/:id',
        loadComponent: () => import('./pages/certificate/certificate-view.component').then(m => m.CertificateViewComponent)
      },
      {
        path: 'certificate/number/:number',
        loadComponent: () => import('./pages/certificate/certificate-view.component').then(m => m.CertificateViewComponent)
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




