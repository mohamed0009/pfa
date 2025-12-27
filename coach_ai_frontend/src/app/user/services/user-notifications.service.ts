import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';
import { UserNotification } from '../models/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserNotificationsService {
  private apiUrl = 'http://localhost:8081/api/user/notifications';
  private notificationsSubject = new BehaviorSubject<UserNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.getNotifications().subscribe();
  }

  private mockNotifications: UserNotification[] = [
    {
      id: 'notif1',
      userId: 'user1',
      type: 'new_content',
      title: 'Nouveau contenu disponible',
      message: 'Le module "React Avancé" est maintenant accessible !',
      createdAt: new Date('2025-12-13T09:00:00'),
      priority: 'medium',
      actionUrl: '/user/learning-path'
    },
    {
      id: 'notif2',
      userId: 'user1',
      type: 'reminder',
      title: 'Rappel de session d\'étude',
      message: 'Il est temps de continuer votre parcours d\'apprentissage',
      createdAt: new Date('2025-12-13T18:00:00'),
      readAt: new Date('2025-12-13T18:15:00'),
      priority: 'low',
      actionUrl: '/user/dashboard'
    },
    {
      id: 'notif3',
      userId: 'user1',
      type: 'achievement',
      title: '🎉 Nouveau succès débloqué !',
      message: 'Vous avez maintenu une série de 5 jours consécutifs',
      createdAt: new Date('2025-12-13T00:00:00'),
      priority: 'high',
      actionUrl: '/user/progress'
    },
    {
      id: 'notif4',
      userId: 'user1',
      type: 'motivation',
      title: 'Continuez sur votre lancée !',
      message: 'Vous êtes à 78% de votre objectif hebdomadaire. Encore un petit effort !',
      createdAt: new Date('2025-12-12T20:00:00'),
      readAt: new Date('2025-12-12T20:30:00'),
      priority: 'medium'
    },
    {
      id: 'notif5',
      userId: 'user1',
      type: 'new_content',
      message: 'Un nouveau quiz a été généré pour tester vos connaissances en React Hooks',
      title: 'Quiz personnalisé disponible',
      createdAt: new Date('2025-12-12T14:00:00'),
      readAt: new Date('2025-12-12T15:00:00'),
      priority: 'medium',
      actionUrl: '/user/quiz/quiz3'
    },
    {
      id: 'notif6',
      userId: 'user1',
      type: 'alert',
      title: 'Exercice évalué',
      message: 'Votre exercice "Todo List en React" a été corrigé. Score: 82/100',
      createdAt: new Date('2025-12-11T09:00:00'),
      readAt: new Date('2025-12-11T09:30:00'),
      priority: 'high',
      actionUrl: '/user/exercises/ex1'
    }
  ];

  // Récupérer toutes les notifications
  getNotifications(): Observable<UserNotification[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((notifs: any[]) => {
        const notifications: UserNotification[] = notifs.map(notif => ({
          id: notif.id,
          userId: notif.userId || '',
          type: notif.type || 'info',
          title: notif.title || '',
          message: notif.message || '',
          createdAt: notif.createdAt ? new Date(notif.createdAt) : new Date(),
          readAt: notif.readAt ? new Date(notif.readAt) : undefined,
          priority: notif.priority || 'medium',
          actionUrl: notif.actionUrl,
          createdBy: notif.createdBy || 'system' // Source de la notification
        }));
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
        return notifications;
      }),
      catchError((error) => {
        console.error('Error fetching notifications:', error);
        return of(this.mockNotifications);
      })
    );
  }

  // Récupérer les notifications non lues
  getUnreadNotifications(): Observable<UserNotification[]> {
    return this.getNotifications().pipe(
      map(notifications => notifications.filter(n => !n.readAt))
    );
  }

  // Marquer une notification comme lue
  markAsRead(notificationId: string): Observable<boolean> {
    return this.http.put<any>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      map(() => {
        this.loadNotifications();
        return true;
      }),
      catchError((error) => {
        console.error('Error marking notification as read:', error);
        return throwError(() => error);
      })
    );
  }

  // Marquer toutes comme lues
  markAllAsRead(): Observable<boolean> {
    this.mockNotifications.forEach(n => {
      if (!n.readAt) {
        n.readAt = new Date();
      }
    });
    this.notificationsSubject.next([...this.mockNotifications]);
    this.updateUnreadCount();
    return of(true).pipe(delay(300));
  }

  // Supprimer une notification
  deleteNotification(notificationId: string): Observable<boolean> {
    const index = this.mockNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.mockNotifications.splice(index, 1);
      this.notificationsSubject.next([...this.mockNotifications]);
      this.updateUnreadCount();
    }
    return of(true).pipe(delay(200));
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount(): Observable<number> {
    return this.http.get<{count: number}>(`${this.apiUrl}/unread/count`).pipe(
      map(response => {
        this.unreadCountSubject.next(response.count);
        return response.count;
      }),
      catchError((error) => {
        console.error('Error fetching unread count:', error);
        const count = this.notificationsSubject.value.filter(n => !n.readAt).length;
        return of(count);
      })
    );
  }

  // Mettre à jour le compteur de non lues
  private updateUnreadCount(notifications?: UserNotification[]): void {
    const notifs = notifications || this.notificationsSubject.value;
    const count = notifs.filter(n => !n.readAt).length;
    this.unreadCountSubject.next(count);
  }

  // Ajouter une nouvelle notification (simulation)
  addNotification(notification: Omit<UserNotification, 'id' | 'createdAt'>): Observable<UserNotification> {
    const newNotif: UserNotification = {
      ...notification,
      id: 'notif_' + Date.now(),
      createdAt: new Date()
    };

    this.mockNotifications.unshift(newNotif);
    this.notificationsSubject.next([...this.mockNotifications]);
    this.updateUnreadCount();

    return of(newNotif).pipe(delay(200));
  }

  // Filtrer par type
  getNotificationsByType(type: UserNotification['type']): Observable<UserNotification[]> {
    const filtered = this.mockNotifications.filter(n => n.type === type);
    return of(filtered).pipe(delay(250));
  }

  // Filtrer par priorité
  getNotificationsByPriority(priority: 'low' | 'medium' | 'high'): Observable<UserNotification[]> {
    const filtered = this.mockNotifications.filter(n => n.priority === priority);
    return of(filtered).pipe(delay(250));
  }
}




