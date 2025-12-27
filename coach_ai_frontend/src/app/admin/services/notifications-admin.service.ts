import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Notification } from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class NotificationsAdminService {
  private apiUrl = 'http://localhost:8081/api/admin/notifications';
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  constructor(private http: HttpClient) {
    // Initialiser le BehaviorSubject avec les notifications mockées
    // Note: Les notifications seront remplacées par les données du backend
  }

  private notifications: Notification[] = [
    {
      id: 'n1',
      type: 'alert',
      priority: 'high',
      title: 'Alerte de Retard',
      message: 'Emma Wilson a 2 semaines de retard sur "Développement Angular Avancé"',
      targetAudience: 'specific',
      targetUserIds: ['1'],
      status: 'sent',
      isRead: false,
      createdBy: 'system',
      createdAt: new Date('2024-12-13T10:00:00'),
      sentAt: new Date('2024-12-13T10:00:00'),
      totalRecipients: 1,
      readCount: 0
    },
    {
      id: 'n2',
      type: 'alert',
      priority: 'high',
      title: 'Baisse de Performance Détectée',
      message: 'Le score moyen de Sarah Johnson a chuté de 15% la semaine dernière',
      targetAudience: 'specific',
      targetUserIds: ['3'],
      status: 'sent',
      isRead: false,
      createdBy: 'system',
      createdAt: new Date('2024-12-12T15:30:00'),
      sentAt: new Date('2024-12-12T15:30:00'),
      totalRecipients: 1,
      readCount: 0
    },
    {
      id: 'n3',
      type: 'reminder',
      priority: 'medium',
      title: 'Alerte d\'Inactivité',
      message: 'David Martinez n\'a pas accédé à la plateforme depuis 7 jours',
      targetAudience: 'specific',
      targetUserIds: ['4'],
      status: 'sent',
      isRead: false,
      createdBy: 'system',
      createdAt: new Date('2024-12-11T09:00:00'),
      sentAt: new Date('2024-12-11T09:00:00'),
      totalRecipients: 1,
      readCount: 0
    },
    {
      id: 'n4',
      type: 'announcement',
      priority: 'low',
      title: 'Nouvelle Formation Publiée',
      message: 'La formation React Native est maintenant disponible',
      targetAudience: 'apprenants',
      status: 'sent',
      isRead: true,
      createdBy: 'admin1',
      createdAt: new Date('2024-12-10T14:20:00'),
      sentAt: new Date('2024-12-10T14:20:00'),
      totalRecipients: 245,
      readCount: 189
    },
    {
      id: 'n5',
      type: 'update',
      priority: 'low',
      title: 'Jalon Atteint',
      message: 'Michael Chen a complété tous les modules de Machine Learning Fundamentals',
      targetAudience: 'specific',
      targetUserIds: ['2'],
      status: 'sent',
      isRead: true,
      createdBy: 'system',
      createdAt: new Date('2024-12-10T11:45:00'),
      sentAt: new Date('2024-12-10T11:45:00'),
      totalRecipients: 1,
      readCount: 1
    }
  ];

  getNotifications(filters?: { type?: string; priority?: string; status?: string }): Observable<Notification[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.type) params = params.set('type', filters.type);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.status) params = params.set('status', filters.status);
    }
    
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map((notifs: any[]) => notifs.map(n => ({
        id: n.id || '',
        type: (n.type || 'info') as Notification['type'],
        priority: (n.priority || 'medium') as Notification['priority'],
        title: n.title || '',
        message: n.message || '',
        targetAudience: n.targetAudience || 'specific',
        targetUserIds: n.targetUserIds || [],
        status: n.status || 'sent',
        isRead: n.isRead || false,
        createdBy: n.createdBy || 'system',
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
        sentAt: n.sentAt ? new Date(n.sentAt) : new Date(),
        totalRecipients: n.totalRecipients || 0,
        readCount: n.readCount || 0
      }))),
      catchError((error) => {
        console.error('Error fetching notifications:', error);
        return of(this.notifications).pipe(delay(300));
      })
    );
  }

  getNotificationById(id: string): Observable<Notification | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((n: any) => ({
        id: n.id || '',
        type: (n.type || 'info') as Notification['type'],
        priority: (n.priority || 'medium') as Notification['priority'],
        title: n.title || '',
        message: n.message || '',
        targetAudience: n.targetAudience || 'specific',
        targetUserIds: n.targetUserIds || [],
        status: n.status || 'sent',
        isRead: n.isRead || false,
        createdBy: n.createdBy || 'system',
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
        sentAt: n.sentAt ? new Date(n.sentAt) : new Date(),
        totalRecipients: n.totalRecipients || 0,
        readCount: n.readCount || 0
      })),
      catchError((error) => {
        console.error('Error fetching notification:', error);
        return of(undefined);
      })
    );
  }

  createNotification(notification: Partial<Notification>): Observable<any> {
    return this.http.post<any>(this.apiUrl, notification).pipe(
      map((response: any) => ({
        id: response.id || '',
        message: response.message || 'Notification created successfully',
        totalRecipients: response.totalRecipients || 0
      })),
      catchError((error) => {
        console.error('Error creating notification:', error);
        return throwError(() => error);
      })
    );
  }

  markAsRead(id: string): Observable<boolean> {
    // Backend endpoint for marking as read would be implemented here
    return of(true).pipe(delay(200));
  }

  getUnreadCount(): Observable<number> {
    return this.getNotifications().pipe(
      map(notifications => notifications.filter(n => !n.isRead).length),
      catchError(() => of(0))
    );
  }
  
  /**
   * Recherche des utilisateurs/formateurs par nom ou email
   */
  searchUsers(query: string, role?: string): Observable<any[]> {
    let params = new HttpParams().set('query', query);
    if (role) {
      params = params.set('role', role);
    }
    
    return this.http.get<any[]>(`${this.apiUrl}/search-users`, { params }).pipe(
      map((users: any[]) => users.map(u => ({
        id: u.id,
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        role: u.role || '',
        avatarUrl: u.avatarUrl || ''
      }))),
      catchError((error) => {
        console.error('Error searching users:', error);
        return of([]);
      })
    );
  }
  
  /**
   * Récupère les statistiques des notifications
   */
  getNotificationStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      catchError((error) => {
        console.error('Error fetching notification stats:', error);
        return of({
          total: 0,
          sent: 0,
          scheduled: 0,
          read: 0,
          unread: 0,
          readRate: 0,
          activeRules: 0
        });
      })
    );
  }
}




