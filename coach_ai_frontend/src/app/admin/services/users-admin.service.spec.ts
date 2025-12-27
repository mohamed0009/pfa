import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsersAdminService } from './users-admin.service';
import { User } from '../models/admin.interfaces';

describe('UsersAdminService', () => {
  let service: UsersAdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersAdminService]
    });

    service = TestBed.inject(UsersAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should fetch all users successfully', (done) => {
      const mockUsers = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'USER',
          status: 'ACTIVE',
          formation: 'Development',
          niveau: 'INTERMEDIAIRE',
          enrollments: []
        }
      ];

      service.getUsers().subscribe({
        next: (users: User[]) => {
          expect(users).toBeTruthy();
          expect(Array.isArray(users)).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should filter users by role', (done) => {
      const mockUsers: any[] = [];

      service.getUsers('Apprenant').subscribe({
        next: (users: User[]) => {
          expect(users).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users?role=Apprenant');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle error and return empty array', (done) => {
      service.getUsers().subscribe({
        next: (users: User[]) => {
          expect(users).toEqual([]);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getUserById', () => {
    it('should fetch user by id successfully', (done) => {
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'USER',
        status: 'ACTIVE',
        formation: 'Development',
        niveau: 'INTERMEDIAIRE',
        enrollments: []
      };

      service.getUserById('1').subscribe({
        next: (user) => {
          expect(user).toBeTruthy();
          expect(user?.id).toBe('1');
          expect(user?.email).toBe('john@example.com');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle error and return undefined', (done) => {
      service.getUserById('999').subscribe({
        next: (user) => {
          expect(user).toBeUndefined();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users/999');
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createUser', () => {
    it('should create user successfully', (done) => {
      const newUser: Partial<User> = {
        email: 'newuser@example.com',
        fullName: 'New User',
        role: 'Apprenant',
        status: 'active',
        training: 'Development',
        level: 'Débutant'
      };

      const mockResponse = {
        id: '2',
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        role: 'USER',
        status: 'ACTIVE',
        formation: 'Development',
        niveau: 'DEBUTANT',
        joinedAt: new Date().toISOString()
      };

      service.createUser(newUser).subscribe({
        next: (user: User) => {
          expect(user).toBeTruthy();
          expect(user.email).toBe('newuser@example.com');
          expect(user.role).toBe('Apprenant');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle error when creating user', (done) => {
      const newUser: Partial<User> = {
        email: 'test@example.com'
      };

      service.createUser(newUser).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users');
      req.flush({ message: 'Error' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', (done) => {
      const updates: Partial<User> = {
        fullName: 'Updated Name',
        level: 'Intermédiaire'
      };

      const mockResponse = {
        id: '1',
        firstName: 'Updated',
        lastName: 'Name',
        email: 'john@example.com',
        role: 'USER',
        status: 'ACTIVE',
        formation: 'Development',
        niveau: 'INTERMEDIAIRE',
        enrollments: []
      };

      service.updateUser('1', updates).subscribe({
        next: (user: User) => {
          expect(user).toBeTruthy();
          expect(user.id).toBe('1');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users/1');
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should handle error when updating user', (done) => {
      const updates: Partial<User> = {
        fullName: 'Updated Name'
      };

      service.updateUser('999', updates).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.message).toBe('User not found');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users/999');
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status successfully', (done) => {
      const mockResponse = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'USER',
        status: 'INACTIVE',
        formation: 'Development',
        niveau: 'INTERMEDIAIRE',
        enrollments: []
      };

      service.updateUserStatus('1', 'inactive').subscribe({
        next: (user: User) => {
          expect(user).toBeTruthy();
          expect(user.status).toBe('inactive');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users/1/status');
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should handle error when updating status', (done) => {
      service.updateUserStatus('999', 'inactive').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.message).toBe('Failed to update user status');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users/999/status');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', (done) => {
      service.deleteUser('1').subscribe({
        next: (result: boolean) => {
          expect(result).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should return false on error', (done) => {
      service.deleteUser('999').subscribe({
        next: (result: boolean) => {
          expect(result).toBeFalse();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/users/999');
      req.flush({ message: 'Error' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getUserProgress', () => {
    it('should fetch user progress', (done) => {
      service.getUserProgress('1').subscribe({
        next: (progress) => {
          expect(progress).toBeTruthy();
          expect(Array.isArray(progress)).toBeTrue();
          if (progress.length > 0) {
            expect(progress[0].userId).toBe('1');
          }
          done();
        }
      });
    });
  });

  describe('getUserActivity', () => {
    it('should fetch user activity', (done) => {
      service.getUserActivity('1').subscribe({
        next: (activities) => {
          expect(activities).toBeTruthy();
          expect(Array.isArray(activities)).toBeTrue();
          if (activities.length > 0) {
            expect(activities[0].userId).toBe('1');
          }
          done();
        }
      });
    });
  });
});

