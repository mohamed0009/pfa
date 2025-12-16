import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { User, UserProgress, LearnerActivity } from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UsersAdminService {
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

  constructor() {}

  getUsers(): Observable<User[]> {
    return of(this.users).pipe(delay(300));
  }

  getUserById(id: string): Observable<User | undefined> {
    return of(this.users.find(u => u.id === id)).pipe(delay(200));
  }

  createUser(user: Partial<User>): Observable<User> {
    const newUser: User = {
      id: 'u' + (this.users.length + 1),
      fullName: user.fullName || '',
      email: user.email || '',
      avatarUrl: user.avatarUrl || 'https://i.pravatar.cc/150',
      role: user.role || 'Apprenant',
      status: user.status || 'active',
      training: user.training || '',
      level: user.level || 'Débutant',
      coursesEnrolled: 0,
      coursesCompleted: 0,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return of(newUser).pipe(delay(400));
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return throwError(() => new Error('User not found'));
    }
    this.users[index] = { ...this.users[index], ...updates };
    return of(this.users[index]).pipe(delay(300));
  }

  deleteUser(id: string): Observable<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return of(false);
    }
    this.users.splice(index, 1);
    return of(true).pipe(delay(300));
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
    const stats = {
      total: this.users.length,
      active: this.users.filter(u => u.status === 'active').length,
      apprenants: this.users.filter(u => u.role === 'Apprenant').length,
      formateurs: this.users.filter(u => u.role === 'Formateur').length,
      administrateurs: this.users.filter(u => u.role === 'Administrateur').length
    };
    return of(stats).pipe(delay(250));
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




