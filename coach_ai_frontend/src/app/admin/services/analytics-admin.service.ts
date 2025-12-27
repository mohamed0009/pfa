import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Analytics, PerformanceMetric, LearnerActivity } from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsAdminService {
  private apiUrl = 'http://localhost:8081/api/admin/analytics';
  
  constructor(private http: HttpClient) {}

  getOverallAnalytics(): Observable<Analytics> {
    return this.http.get<any>(`${this.apiUrl}/overall`).pipe(
      map((data: any) => ({
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        userGrowth: data.userGrowth || 0,
        totalCourses: data.totalCourses || 0,
        publishedCourses: data.publishedCourses || 0,
        totalFormations: data.totalFormations || 0,
        courseEnrollments: data.courseEnrollments || 0,
        averageCompletion: data.averageCompletion || 0,
        totalStudyHours: data.totalStudyHours || 0,
        usersByRole: data.usersByRole || {
          administrateurs: 0,
          formateurs: 0,
          apprenants: 0
        }
      })),
      catchError((error) => {
        console.error('Error fetching analytics:', error);
        // Fallback to mock data
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
      })
    );
  }

  getPerformanceMetrics(): Observable<PerformanceMetric[]> {
    return this.http.get<any[]>(`${this.apiUrl}/performance-metrics`).pipe(
      map((data: any[]) => data.map(m => ({
        label: m.label || '',
        value: m.value || 0,
        change: m.change || 0,
        trend: m.trend || 'up'
      }))),
      catchError((error) => {
        console.error('Error fetching performance metrics:', error);
        // Fallback to mock data
        const metrics: PerformanceMetric[] = [
          { label: 'Active Users', value: 189, change: 12.5, trend: 'up' },
          { label: 'Course Completions', value: 85, change: 8.2, trend: 'up' },
          { label: 'Average Rating', value: '4.7/5', change: 0.3, trend: 'up' },
          { label: 'Study Hours', value: 12450, change: 15.8, trend: 'up' }
        ];
        return of(metrics).pipe(delay(300));
      })
    );
  }

  getRecentActivities(limit: number = 10): Observable<LearnerActivity[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recent-activities?limit=${limit}`).pipe(
      map((data: any[]) => data.map(a => ({
        userId: a.userId || '',
        userName: a.userName || '',
        userAvatar: a.userAvatar || '',
        courseId: a.courseId || '',
        courseName: a.courseName || '',
        action: a.action || 'info',
        date: a.date ? new Date(a.date) : new Date(),
        metadata: a.metadata || {}
      }))),
      catchError((error) => {
        console.error('Error fetching recent activities:', error);
        // Fallback to mock data
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
          }
        ];
        return of(activities.slice(0, limit)).pipe(delay(300));
      })
    );
  }

  getUserEngagement(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user-engagement`).pipe(
      catchError((error) => {
        console.error('Error fetching user engagement:', error);
        return of({
          daily: [120, 135, 148, 152, 145, 167, 189],
          weekly: [650, 720, 680, 750, 810, 890, 945],
          monthly: [2800, 3100, 3400, 3650]
        }).pipe(delay(300));
      })
    );
  }

  getCategoryPerformance(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/category-performance`).pipe(
      catchError((error) => {
        console.error('Error fetching category performance:', error);
        const data = [
          { category: 'Développement Web', avgScore: 85, completionRate: 72 },
          { category: 'Data Science', avgScore: 88, completionRate: 70 },
          { category: 'Design', avgScore: 82, completionRate: 68 },
          { category: 'Sécurité', avgScore: 84, completionRate: 65 },
          { category: 'Marketing', avgScore: 80, completionRate: 75 }
        ];
        return of(data).pipe(delay(300));
      })
    );
  }

  getCompletionTrends(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/completion-trends`).pipe(
      catchError((error) => {
        console.error('Error fetching completion trends:', error);
        return of({
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
          data: [65, 68, 70, 72, 71, 75]
        }).pipe(delay(300));
      })
    );
  }
}




