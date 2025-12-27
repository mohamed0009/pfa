import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard, loginGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    route = {} as ActivatedRouteSnapshot;
    state = { url: '/protected' } as RouterStateSnapshot;
  });

  describe('authGuard', () => {
    it('should allow access when user is logged in', () => {
      authService.isLoggedIn.and.returnValue(true);
      
      const result = authGuard(route, state);
      
      expect(result).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not logged in', () => {
      authService.isLoggedIn.and.returnValue(false);
      
      const result = authGuard(route, state);
      
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/protected' }
      });
    });
  });

  describe('loginGuard', () => {
    it('should allow access when user is not logged in', () => {
      authService.isLoggedIn.and.returnValue(false);
      
      const result = loginGuard(route, state);
      
      expect(result).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to home when user is already logged in', () => {
      authService.isLoggedIn.and.returnValue(true);
      
      const result = loginGuard(route, state);
      
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});

