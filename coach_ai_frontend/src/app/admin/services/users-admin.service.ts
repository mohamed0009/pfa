import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, throwError, map, catchError } from 'rxjs';
import { User, UserProgress, LearnerActivity, UserRole } from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UsersAdminService {
  private apiUrl = 'http://localhost:8081/api/admin/users';

  constructor(private http: HttpClient) {}

  private users: User[] = [
    {
      id: '1',
      fullName: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      training: 'Développement Full Stack',
      level: 'Intermédiaire',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      lastActive: new Date('2024-12-13'),
      coursesEnrolled: 5,
      coursesCompleted: 2,
      status: 'active',
      role: 'Apprenant',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      fullName: 'Michael Chen',
      email: 'michael.chen@example.com',
      training: 'Data Science',
      level: 'Avancé',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      lastActive: new Date('2024-12-10'),
      coursesEnrolled: 8,
      coursesCompleted: 6,
      status: 'active',
      role: 'Apprenant',
      createdAt: new Date('2023-11-20')
    },
    {
      id: '3',
      fullName: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      training: 'UX/UI Design',
      level: 'Débutant',
      avatarUrl: 'https://i.pravatar.cc/150?img=10',
      lastActive: new Date('2024-11-28'),
      coursesEnrolled: 3,
      coursesCompleted: 1,
      status: 'inactive',
      role: 'Apprenant',
      createdAt: new Date('2024-03-01')
    },
    {
      id: '4',
      fullName: 'David Martinez',
      email: 'david.m@example.com',
      training: 'Cybersécurité',
      level: 'Intermédiaire',
      avatarUrl: 'https://i.pravatar.cc/150?img=15',
      lastActive: new Date('2024-12-12'),
      coursesEnrolled: 4,
      coursesCompleted: 2,
      status: 'active',
      role: 'Apprenant',
      createdAt: new Date('2024-02-10')
    },
    {
      id: '5',
      fullName: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      training: 'Marketing Digital',
      level: 'Débutant',
      avatarUrl: 'https://i.pravatar.cc/150?img=25',
      lastActive: new Date('2024-12-13'),
      coursesEnrolled: 2,
      coursesCompleted: 0,
      status: 'active',
      role: 'Apprenant',
      createdAt: new Date('2024-04-15')
    }
  ];

  getUsers(role?: string): Observable<User[]> {
    const url = role ? `${this.apiUrl}?role=${role}` : this.apiUrl;
    return this.http.get<any[]>(url).pipe(
      map((users: any[]) => users.map(user => {
        // Calculer les cours depuis les enrollments si disponibles
        const enrollments = user.enrollments || [];
        const coursesEnrolled = enrollments.length;
        const coursesCompleted = enrollments.filter((e: any) => 
          e.status === 'COMPLETED' || (e.progress && e.progress.overallProgress === 100)
        ).length;
        
        return {
          id: user.id,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          email: user.email,
          avatarUrl: user.avatarUrl || '',
          role: (user.role === 'USER' ? 'Apprenant' : user.role === 'TRAINER' ? 'Formateur' : 'Administrateur') as UserRole,
          status: (user.status === 'ACTIVE' ? 'active' : user.status === 'INACTIVE' ? 'inactive' : user.status === 'PENDING' ? 'pending' : 'suspended') as 'active' | 'inactive' | 'pending' | 'suspended',
          training: user.formation || '',
          level: (user.niveau ? (user.niveau === 'DEBUTANT' ? 'Débutant' : user.niveau === 'INTERMEDIAIRE' ? 'Intermédiaire' : 'Avancé') : 'Débutant') as 'Débutant' | 'Intermédiaire' | 'Avancé',
          coursesEnrolled: coursesEnrolled,
          coursesCompleted: coursesCompleted,
          lastActive: user.lastActive ? new Date(user.lastActive) : new Date(),
          createdAt: user.joinedAt ? new Date(user.joinedAt) : new Date()
        };
      })),
      catchError((error) => {
        console.error('Error fetching users:', error);
        return of([]);
      })
    );
  }

  getUserById(id: string): Observable<User | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((user: any) => {
        const enrollments = user.enrollments || [];
        const coursesEnrolled = enrollments.length;
        const coursesCompleted = enrollments.filter((e: any) => 
          e.status === 'COMPLETED' || (e.progress && e.progress.overallProgress === 100)
        ).length;
        
        return {
          id: user.id,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          email: user.email,
          avatarUrl: user.avatarUrl || '',
          role: (user.role === 'USER' ? 'Apprenant' : user.role === 'TRAINER' ? 'Formateur' : 'Administrateur') as UserRole,
          status: (user.status === 'ACTIVE' ? 'active' : user.status === 'INACTIVE' ? 'inactive' : user.status === 'PENDING' ? 'pending' : 'suspended') as 'active' | 'inactive' | 'pending' | 'suspended',
          training: user.formation || '',
          level: (user.niveau ? (user.niveau === 'DEBUTANT' ? 'Débutant' : user.niveau === 'INTERMEDIAIRE' ? 'Intermédiaire' : 'Avancé') : 'Débutant') as 'Débutant' | 'Intermédiaire' | 'Avancé',
          coursesEnrolled: coursesEnrolled,
          coursesCompleted: coursesCompleted,
          lastActive: user.lastActive ? new Date(user.lastActive) : new Date(),
          createdAt: user.joinedAt ? new Date(user.joinedAt) : new Date()
        };
      }),
      catchError((error) => {
        console.error('Error fetching user:', error);
        return of(undefined);
      })
    );
  }

  createUser(user: Partial<User>): Observable<User> {
    const userData: any = {
      email: user.email || '',
      fullName: user.fullName || '',
      role: user.role || 'Apprenant',
      status: user.status || 'active',
      training: user.training || '',
      level: user.level || 'Débutant',
      avatarUrl: user.avatarUrl || 'https://i.pravatar.cc/150'
    };
    
    return this.http.post<any>(this.apiUrl, userData).pipe(
      map((savedUser: any) => ({
        id: savedUser.id,
        fullName: `${savedUser.firstName || ''} ${savedUser.lastName || ''}`.trim() || savedUser.email,
        email: savedUser.email,
        avatarUrl: savedUser.avatarUrl || '',
        role: (savedUser.role === 'USER' ? 'Apprenant' : savedUser.role === 'TRAINER' ? 'Formateur' : 'Administrateur') as UserRole,
        status: (savedUser.status === 'ACTIVE' ? 'active' : savedUser.status === 'INACTIVE' ? 'inactive' : savedUser.status === 'PENDING' ? 'pending' : 'suspended') as 'active' | 'inactive' | 'pending' | 'suspended',
        training: savedUser.formation || '',
        level: (savedUser.niveau ? (savedUser.niveau === 'DEBUTANT' ? 'Débutant' : savedUser.niveau === 'INTERMEDIAIRE' ? 'Intermédiaire' : 'Avancé') : 'Débutant') as 'Débutant' | 'Intermédiaire' | 'Avancé',
        coursesEnrolled: 0,
        coursesCompleted: 0,
        lastActive: savedUser.lastActive ? new Date(savedUser.lastActive) : new Date(),
        createdAt: savedUser.joinedAt ? new Date(savedUser.joinedAt) : new Date()
      })),
      catchError((error) => {
        console.error('Error creating user:', error);
        return throwError(() => error);
      })
    );
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    const backendUpdates: any = {};
    
    if (updates.email !== undefined) backendUpdates.email = updates.email;
    if (updates.fullName !== undefined) backendUpdates.fullName = updates.fullName;
    if (updates.role !== undefined) backendUpdates.role = updates.role;
    if (updates.status !== undefined) backendUpdates.status = updates.status;
    if (updates.training !== undefined) backendUpdates.training = updates.training;
    if (updates.level !== undefined) backendUpdates.level = updates.level;
    if (updates.avatarUrl !== undefined) backendUpdates.avatarUrl = updates.avatarUrl;
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, backendUpdates).pipe(
      map((user: any) => {
        const enrollments = user.enrollments || [];
        const coursesEnrolled = enrollments.length;
        const coursesCompleted = enrollments.filter((e: any) => 
          e.status === 'COMPLETED' || (e.progress && e.progress.overallProgress === 100)
        ).length;
        
        return {
          id: user.id,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          email: user.email,
          avatarUrl: user.avatarUrl || '',
          role: (user.role === 'USER' ? 'Apprenant' : user.role === 'TRAINER' ? 'Formateur' : 'Administrateur') as UserRole,
          status: (user.status === 'ACTIVE' ? 'active' : user.status === 'INACTIVE' ? 'inactive' : user.status === 'PENDING' ? 'pending' : 'suspended') as 'active' | 'inactive' | 'pending' | 'suspended',
          training: user.formation || '',
          level: (user.niveau ? (user.niveau === 'DEBUTANT' ? 'Débutant' : user.niveau === 'INTERMEDIAIRE' ? 'Intermédiaire' : 'Avancé') : 'Débutant') as 'Débutant' | 'Intermédiaire' | 'Avancé',
          coursesEnrolled: coursesEnrolled,
          coursesCompleted: coursesCompleted,
          lastActive: user.lastActive ? new Date(user.lastActive) : new Date(),
          createdAt: user.joinedAt ? new Date(user.joinedAt) : new Date()
        };
      }),
      catchError((error) => {
        console.error('Error updating user:', error);
        return throwError(() => new Error('User not found'));
      })
    );
  }

  updateUserStatus(id: string, status: string): Observable<User> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, `"${status}"`).pipe(
      map((user: any) => {
        const enrollments = user.enrollments || [];
        const coursesEnrolled = enrollments.length;
        const coursesCompleted = enrollments.filter((e: any) => 
          e.status === 'COMPLETED' || (e.progress && e.progress.overallProgress === 100)
        ).length;
        
        return {
          id: user.id,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          email: user.email,
          avatarUrl: user.avatarUrl || '',
          role: (user.role === 'USER' ? 'Apprenant' : user.role === 'TRAINER' ? 'Formateur' : 'Administrateur') as UserRole,
          status: (user.status === 'ACTIVE' ? 'active' : user.status === 'INACTIVE' ? 'inactive' : user.status === 'PENDING' ? 'pending' : 'suspended') as 'active' | 'inactive' | 'pending' | 'suspended',
          training: user.formation || '',
          level: (user.niveau ? (user.niveau === 'DEBUTANT' ? 'Débutant' : user.niveau === 'INTERMEDIAIRE' ? 'Intermédiaire' : 'Avancé') : 'Débutant') as 'Débutant' | 'Intermédiaire' | 'Avancé',
          coursesEnrolled: coursesEnrolled,
          coursesCompleted: coursesCompleted,
          lastActive: user.lastActive ? new Date(user.lastActive) : new Date(),
          createdAt: user.joinedAt ? new Date(user.joinedAt) : new Date()
        };
      }),
      catchError((error) => {
        console.error('Error updating user status:', error);
        return throwError(() => new Error('Failed to update user status'));
      })
    );
  }

  deleteUser(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Error deleting user:', error);
        return of(false);
      })
    );
  }

  getUserProgress(userId: string): Observable<UserProgress[]> {
    const progress: UserProgress[] = [
      {
        userId,
        courseId: 'c1',
        courseName: 'Advanced Angular Development',
        progress: 75,
        completedLessons: 15,
        totalLessons: 20,
        lastAccessed: new Date('2024-12-13'),
        timeSpent: 25
      }
    ];
    return of(progress).pipe(delay(300));
  }

  getUserActivity(userId: string): Observable<LearnerActivity[]> {
    const activities: LearnerActivity[] = [
      {
        userId,
        userName: 'Emma Wilson',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        courseId: 'c1',
        courseName: 'Advanced Angular Development',
        action: 'completed_module',
        date: new Date('2024-12-13')
      },
      {
        userId,
        userName: 'Emma Wilson',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        courseId: 'c1',
        courseName: 'Advanced Angular Development',
        action: 'quiz_taken',
        date: new Date('2024-12-12'),
        metadata: { score: 92 }
      }
    ];
    return of(activities).pipe(delay(300));
  }

  searchUsers(query: string): Observable<User[]> {
    const filtered = this.users.filter(u =>
      u.fullName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.training.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered).pipe(delay(250));
  }

  filterByStatus(status: 'active' | 'inactive' | 'suspended'): Observable<User[]> {
    return of(this.users.filter(u => u.status === status)).pipe(delay(250));
  }

  getUserStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map((stats: any) => ({
        total: stats.total || 0,
        active: stats.active || 0,
        apprenants: stats.apprenants || 0,
        formateurs: stats.formateurs || 0,
        administrateurs: stats.administrateurs || 0
      })),
      catchError((error) => {
        console.error('Error fetching user stats:', error);
        return of({
          total: 0,
          active: 0,
          apprenants: 0,
          formateurs: 0,
          administrateurs: 0
        });
      })
    );
  }

  getUserStatsById(userId: string): Observable<any> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    const stats = {
      totalCourses: user.coursesEnrolled,
      completedCourses: user.coursesCompleted,
      inProgressCourses: user.coursesEnrolled - user.coursesCompleted,
      averageScore: 87,
      completionRate: user.coursesEnrolled > 0 
        ? Math.round((user.coursesCompleted / user.coursesEnrolled) * 100) 
        : 0
    };

    return of(stats).pipe(delay(300));
  }
}




