import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [loginGuard] // Prevent access if already logged in
  },
  { 
    path: 'signup', 
    component: SignupComponent,
    canActivate: [loginGuard] // Prevent access if already logged in
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard] // Require authentication
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.routes').then(m => m.userRoutes)
  },
  {
    path: 'trainer',
    loadChildren: () => import('./trainer/trainer.routes').then(m => m.trainerRoutes)
  },
  { path: '**', redirectTo: '' }
];


