import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // In a real app, check if user has admin role
  // For now, allow all authenticated users
  // const currentUser = authService.currentUserValue;
  // if (currentUser && currentUser.role === 'admin') {
  //   return true;
  // }

  return true; // Mock: allow all authenticated users
};





