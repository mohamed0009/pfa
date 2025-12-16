import { Injectable } from '@angular/core';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { Notification } from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class NotificationsAdminService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

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

  constructor() {
    this.notificationsSubject.next(this.notifications);
  }

  getNotifications(): Observable<Notification[]> {
    return of(this.notifications).pipe(delay(300));
  }

  getNotificationById(id: string): Observable<Notification | undefined> {
    return of(this.notifications.find(n => n.id === id)).pipe(delay(200));
  }

  markAsRead(id: string): Observable<boolean> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      this.notificationsSubject.next(this.notifications);
      return of(true).pipe(delay(200));
    }
    return of(false);
  }

  getUnreadCount(): Observable<number> {
    const count = this.notifications.filter(n => !n.isRead).length;
    return of(count).pipe(delay(100));
  }
}




