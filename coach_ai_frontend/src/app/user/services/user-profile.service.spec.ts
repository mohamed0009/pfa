import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserProfileService } from './user-profile.service';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { UserProfile, LearningPreferences } from '../models/user.interfaces';
import { of, throwError } from 'rxjs';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // Start with false to prevent automatic profile loading
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: of(false)
    });
    const loggerSpy = jasmine.createSpyObj('LoggerService', ['error', 'debug', 'info', 'warn', 'log']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserProfileService,
        { provide: AuthService, useValue: authSpy },
        { provide: LoggerService, useValue: loggerSpy }
      ]
    });

    service = TestBed.inject(UserProfileService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    // No automatic request should be made when not authenticated
    httpMock.expectNone('http://localhost:8081/api/user/profile');
  });

  describe('getUserProfile', () => {
    it('should fetch user profile successfully', (done) => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        formation: 'Development',
        niveau: 'INTERMEDIAIRE',
        joinedAt: '2024-01-01T00:00:00Z',
        lastActive: '2024-12-25T00:00:00Z'
      };

      service.getUserProfile().subscribe({
        next: (profile: UserProfile) => {
          expect(profile).toBeTruthy();
          expect(profile.id).toBe('1');
          expect(profile.email).toBe('test@example.com');
          expect(profile.firstName).toBe('John');
          expect(profile.lastName).toBe('Doe');
          expect(profile.preferences).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/profile');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle missing fields with defaults', (done) => {
      const mockUser = {
        id: '1',
        email: 'test@example.com'
      };

      service.getUserProfile().subscribe({
        next: (profile: UserProfile) => {
          expect(profile.firstName).toBe('');
          expect(profile.lastName).toBe('');
          expect(profile.niveau).toBe('Débutant');
          expect(profile.avatarUrl).toContain('pravatar.cc');
          expect(profile.preferences).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/profile');
      req.flush(mockUser);
    });

    it('should handle error', (done) => {
      service.getUserProfile().subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/profile');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', (done) => {
      const updates: Partial<UserProfile> = {
        firstName: 'Jane',
        lastName: 'Smith',
        niveau: 'Avancé'
      };

      const mockResponse = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        formation: 'Development',
        niveau: 'AVANCE',
        joinedAt: '2024-01-01T00:00:00Z',
        lastActive: '2024-12-25T00:00:00Z'
      };

      service.updateProfile(updates).subscribe({
        next: (profile: UserProfile) => {
          expect(profile).toBeTruthy();
          expect(profile.firstName).toBe('Jane');
          expect(profile.lastName).toBe('Smith');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/profile');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.firstName).toBe('Jane');
      expect(req.request.body.lastName).toBe('Smith');
      req.flush(mockResponse);
    });

    it('should only send defined fields', (done) => {
      const updates: Partial<UserProfile> = {
        firstName: 'Jane'
      };

      service.updateProfile(updates).subscribe({
        next: (profile: UserProfile) => {
          expect(profile).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/profile');
      expect(req.request.body.lastName).toBeUndefined();
      expect(req.request.body.firstName).toBe('Jane');
      req.flush({
        id: '1',
        email: 'test@example.com',
        firstName: 'Jane'
      });
    });

    it('should handle error', (done) => {
      const updates: Partial<UserProfile> = {
        firstName: 'Jane'
      };

      service.updateProfile(updates).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/profile');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', (done) => {
      service.changePassword('oldPassword', 'newPassword').subscribe({
        next: (result) => {
          expect(result).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/profile/password');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.currentPassword).toBe('oldPassword');
      expect(req.request.body.newPassword).toBe('newPassword');
      req.flush({ success: true });
    });

    it('should handle error when changing password', (done) => {
      service.changePassword('wrongPassword', 'newPassword').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/profile/password');
      req.flush({ message: 'Invalid current password' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences successfully', (done) => {
      // First, set a current user profile
      const mockUser: UserProfile = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        formation: 'Development',
        niveau: 'INTERMEDIAIRE',
        preferences: {
          learningPace: 'Modéré',
          preferredContentTypes: ['Vidéo'],
          studyTimePreference: 'Soir',
          notificationsEnabled: true,
          weeklyGoalHours: 10
        },
        joinedAt: new Date(),
        lastActive: new Date()
      };
      
      // Load profile first
      service.getUserProfile().subscribe({
        next: () => {
          const preferences: Partial<LearningPreferences> = {
            learningPace: 'Rapide',
            preferredContentTypes: ['Vidéo', 'Quiz'],
            studyTimePreference: 'Matin',
            notificationsEnabled: false,
            weeklyGoalHours: 15
          };

          const mockResponse = {
            id: '1',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            preferences: { ...mockUser.preferences, ...preferences }
          };

          service.updatePreferences(preferences).subscribe({
            next: (profile: UserProfile) => {
              expect(profile).toBeTruthy();
              expect(profile.preferences?.learningPace).toBe('Rapide');
              expect(profile.preferences?.weeklyGoalHours).toBe(15);
              done();
            }
          });

          const req = httpMock.expectOne('http://localhost:8081/api/user/profile');
          expect(req.request.method).toBe('PUT');
          req.flush(mockResponse);
        }
      });

      const initialReq = httpMock.expectOne('http://localhost:8081/api/user/profile');
      initialReq.flush(mockUser);
    });

    it('should handle error', (done) => {
      // First, set a current user profile
      const mockUser: UserProfile = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        formation: 'Development',
        niveau: 'INTERMEDIAIRE',
        preferences: {
          learningPace: 'Modéré',
          preferredContentTypes: ['Vidéo'],
          studyTimePreference: 'Soir',
          notificationsEnabled: true,
          weeklyGoalHours: 10
        },
        joinedAt: new Date(),
        lastActive: new Date()
      };
      
      // Load profile first
      service.getUserProfile().subscribe({
        next: () => {
          const preferences = {
            learningPace: 'Rapide' as const
          };

          service.updatePreferences(preferences).subscribe({
            error: (error) => {
              expect(error).toBeTruthy();
              done();
            }
          });

          const req = httpMock.expectOne('http://localhost:8081/api/user/profile');
          req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
        }
      });

      const initialReq = httpMock.expectOne('http://localhost:8081/api/user/profile');
      initialReq.flush(mockUser);
    });
  });
});

