import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Analytics, PerformanceMetric, LearnerActivity } from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsAdminService {
  constructor() {}

  getOverallAnalytics(): Observable<Analytics> {
    const analytics: Analytics = {
      totalUsers: 245,
      activeUsers: 189,
      userGrowth: 15.5,
      totalCourses: 45,
      publishedCourses: 38,
      totalFormations: 12,
      courseEnrollments: 1250,
      averageCompletion: 68,
      totalStudyHours: 12450,
      usersByRole: {
        administrateurs: 5,
        formateurs: 30,
        apprenants: 210
      }
    };
    return of(analytics).pipe(delay(300));
  }

  getPerformanceMetrics(): Observable<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = [
      { label: 'Active Users', value: 189, change: 12.5, trend: 'up' },
      { label: 'Course Completions', value: 85, change: 8.2, trend: 'up' },
      { label: 'Average Rating', value: '4.7/5', change: 0.3, trend: 'up' },
      { label: 'Study Hours', value: 12450, change: 15.8, trend: 'up' }
    ];
    return of(metrics).pipe(delay(300));
  }

  getRecentActivities(limit: number = 10): Observable<LearnerActivity[]> {
    const activities: LearnerActivity[] = [
      {
        userId: '1',
        userName: 'Emma Wilson',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        courseId: 'c1',
        courseName: 'Advanced Angular Development',
        action: 'completed_module',
        date: new Date('2024-12-13T10:30:00'),
        metadata: { moduleName: 'RxJS Advanced Patterns' }
      },
      {
        userId: '2',
        userName: 'Michael Chen',
        userAvatar: 'https://i.pravatar.cc/150?img=12',
        courseId: 'c2',
        courseName: 'Machine Learning Fundamentals',
        action: 'completed_course',
        date: new Date('2024-12-13T09:15:00')
      },
      {
        userId: '3',
        userName: 'Sarah Johnson',
        userAvatar: 'https://i.pravatar.cc/150?img=10',
        courseId: 'c3',
        courseName: 'UX Design Masterclass',
        action: 'enrolled',
        date: new Date('2024-12-13T08:45:00')
      },
      {
        userId: '4',
        userName: 'David Martinez',
        userAvatar: 'https://i.pravatar.cc/150?img=15',
        courseId: 'c4',
        courseName: 'Cybersecurity Essentials',
        action: 'quiz_taken',
        date: new Date('2024-12-12T16:20:00'),
        metadata: { score: 92, maxScore: 100 }
      },
      {
        userId: '5',
        userName: 'Lisa Anderson',
        userAvatar: 'https://i.pravatar.cc/150?img=25',
        courseId: 'c5',
        courseName: 'Digital Marketing Strategy',
        action: 'completed_module',
        date: new Date('2024-12-12T14:10:00'),
        metadata: { moduleName: 'SEO Fundamentals' }
      }
    ];
    return of(activities.slice(0, limit)).pipe(delay(300));
  }

  getUserEngagement(): Observable<any> {
    return of({
      daily: [120, 135, 148, 152, 145, 167, 189],
      weekly: [650, 720, 680, 750, 810, 890, 945],
      monthly: [2800, 3100, 3400, 3650]
    }).pipe(delay(300));
  }

  getCategoryPerformance(): Observable<any[]> {
    const data = [
      { category: 'Développement Web', avgScore: 85, completionRate: 72 },
      { category: 'Data Science', avgScore: 88, completionRate: 70 },
      { category: 'Design', avgScore: 82, completionRate: 68 },
      { category: 'Sécurité', avgScore: 84, completionRate: 65 },
      { category: 'Marketing', avgScore: 80, completionRate: 75 }
    ];
    return of(data).pipe(delay(300));
  }

  getCompletionTrends(): Observable<any> {
    return of({
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      data: [65, 68, 70, 72, 71, 75]
    }).pipe(delay(300));
  }
}




