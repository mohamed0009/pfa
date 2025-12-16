import { Injectable } from '@angular/core';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { 
  Notification, 
  AutomaticNotificationRule,
  NotificationType,
  NotificationPriority
} from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class NotificationsEnhancedService {

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  private notifications: Notification[] = [
    {
      id: 'n1',
      type: 'announcement',
      priority: 'high',
      title: 'Nouvelle formation disponible',
      message: 'La formation "Data Science Avancée" est maintenant disponible. Inscrivez-vous dès maintenant !',
      targetAudience: 'apprenants',
      status: 'sent',
      isRead: false,
      createdBy: 'admin1',
      createdAt: new Date('2024-12-12T10:00:00'),
      sentAt: new Date('2024-12-12T10:05:00'),
      readCount: 134,
      totalRecipients: 245
    },
    {
      id: 'n2',
      type: 'alert',
      priority: 'urgent',
      title: 'Maintenance programmée',
      message: 'La plateforme sera en maintenance le 15 décembre de 2h à 4h du matin. Merci de votre compréhension.',
      targetAudience: 'all',
      status: 'scheduled',
      isRead: false,
      createdBy: 'admin1',
      createdAt: new Date('2024-12-13T14:00:00'),
      scheduledFor: new Date('2024-12-14T18:00:00'),
      totalRecipients: 580
    },
    {
      id: 'n3',
      type: 'reminder',
      priority: 'medium',
      title: 'Rappel: Session de formation demain',
      message: 'N\'oubliez pas votre session de formation React prévue demain à 14h.',
      targetAudience: 'specific',
      targetUserIds: ['u1', 'u2', 'u5'],
      status: 'sent',
      isRead: false,
      createdBy: 'system',
      createdAt: new Date('2024-12-13T09:00:00'),
      sentAt: new Date('2024-12-13T09:01:00'),
      readCount: 2,
      totalRecipients: 3
    }
  ];

  private automaticRules: AutomaticNotificationRule[] = [
    {
      id: 'rule1',
      name: 'Rappel formation à venir',
      type: 'training_reminder',
      enabled: true,
      trigger: {
        event: 'session_upcoming',
        condition: 'hours_before',
        value: 24
      },
      template: 'N\'oubliez pas votre session de formation {{courseName}} prévue {{when}}.',
      frequency: 'once_per_session',
      createdBy: 'admin1',
      createdAt: new Date('2024-11-01')
    },
    {
      id: 'rule2',
      name: 'Alerte retard progression',
      type: 'delay_alert',
      enabled: true,
      trigger: {
        event: 'progress_delay',
        condition: 'days_inactive',
        value: 7
      },
      template: 'Vous n\'avez pas progressé depuis {{days}} jours. Reprenez votre formation pour ne pas perdre le rythme !',
      frequency: 'weekly',
      createdBy: 'admin1',
      createdAt: new Date('2024-11-05')
    },
    {
      id: 'rule3',
      name: 'Message de motivation',
      type: 'motivation',
      enabled: true,
      trigger: {
        event: 'module_completed',
        condition: 'completion_percentage',
        value: 50
      },
      template: 'Félicitations ! Vous avez complété 50% de votre formation. Continuez comme ça ! 🎉',
      frequency: 'per_milestone',
      createdBy: 'admin1',
      createdAt: new Date('2024-11-10')
    }
  ];

  constructor() {
    this.notificationsSubject.next(this.notifications);
  }

  // ==================== NOTIFICATIONS ====================

  getNotifications(filters?: {
    type?: NotificationType;
    status?: 'draft' | 'scheduled' | 'sent' | 'failed';
    targetAudience?: string;
  }): Observable<Notification[]> {
    let filtered = [...this.notifications];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(n => n.type === filters.type);
      }
      if (filters.status) {
        filtered = filtered.filter(n => n.status === filters.status);
      }
      if (filters.targetAudience) {
        filtered = filtered.filter(n => n.targetAudience === filters.targetAudience);
      }
    }

    return of(filtered).pipe(delay(300));
  }

  getNotificationById(id: string): Observable<Notification | undefined> {
    return of(this.notifications.find(n => n.id === id)).pipe(delay(200));
  }

  createNotification(notification: Partial<Notification>): Observable<Notification> {
    const newNotification: Notification = {
      id: 'n' + (this.notifications.length + 1),
      type: notification.type || 'announcement',
      priority: notification.priority || 'medium',
      title: notification.title || '',
      message: notification.message || '',
      targetAudience: notification.targetAudience || 'all',
      targetUserIds: notification.targetUserIds,
      scheduledFor: notification.scheduledFor,
      status: notification.scheduledFor ? 'scheduled' : 'draft',
      isRead: false,
      createdBy: 'current-admin',
      createdAt: new Date(),
      totalRecipients: this.calculateRecipients(notification.targetAudience || 'all', notification.targetUserIds)
    };

    this.notifications.push(newNotification);
    this.notificationsSubject.next(this.notifications);
    return of(newNotification).pipe(delay(400));
  }

  sendNotification(id: string): Observable<Notification> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index] = {
        ...this.notifications[index],
        status: 'sent',
        sentAt: new Date(),
        readCount: 0
      };
      this.notificationsSubject.next(this.notifications);
      return of(this.notifications[index]).pipe(delay(500));
    }
    throw new Error('Notification not found');
  }

  scheduleNotification(id: string, scheduledFor: Date): Observable<Notification> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index] = {
        ...this.notifications[index],
        status: 'scheduled',
        scheduledFor
      };
      this.notificationsSubject.next(this.notifications);
      return of(this.notifications[index]).pipe(delay(300));
    }
    throw new Error('Notification not found');
  }

  deleteNotification(id: string): Observable<boolean> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.notificationsSubject.next(this.notifications);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  // ==================== AUTOMATIC RULES ====================

  getAutomaticRules(): Observable<AutomaticNotificationRule[]> {
    return of(this.automaticRules).pipe(delay(300));
  }

  createAutomaticRule(rule: Partial<AutomaticNotificationRule>): Observable<AutomaticNotificationRule> {
    const newRule: AutomaticNotificationRule = {
      id: 'rule' + (this.automaticRules.length + 1),
      name: rule.name || '',
      type: rule.type || 'training_reminder',
      enabled: true,
      trigger: rule.trigger || { event: '', condition: '', value: null },
      template: rule.template || '',
      frequency: rule.frequency,
      createdBy: 'current-admin',
      createdAt: new Date()
    };

    this.automaticRules.push(newRule);
    return of(newRule).pipe(delay(400));
  }

  updateAutomaticRule(id: string, updates: Partial<AutomaticNotificationRule>): Observable<AutomaticNotificationRule> {
    const index = this.automaticRules.findIndex(r => r.id === id);
    if (index !== -1) {
      this.automaticRules[index] = {
        ...this.automaticRules[index],
        ...updates
      };
      return of(this.automaticRules[index]).pipe(delay(300));
    }
    throw new Error('Rule not found');
  }

  toggleAutomaticRule(id: string, enabled: boolean): Observable<AutomaticNotificationRule> {
    const index = this.automaticRules.findIndex(r => r.id === id);
    if (index !== -1) {
      this.automaticRules[index].enabled = enabled;
      return of(this.automaticRules[index]).pipe(delay(250));
    }
    throw new Error('Rule not found');
  }

  deleteAutomaticRule(id: string): Observable<boolean> {
    const index = this.automaticRules.findIndex(r => r.id === id);
    if (index !== -1) {
      this.automaticRules.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  // ==================== STATISTICS ====================

  getNotificationStatistics(): Observable<any> {
    const sent = this.notifications.filter(n => n.status === 'sent');
    const totalSent = sent.reduce((sum, n) => sum + (n.totalRecipients || 0), 0);
    const totalRead = sent.reduce((sum, n) => sum + (n.readCount || 0), 0);

    return of({
      total: this.notifications.length,
      sent: sent.length,
      scheduled: this.notifications.filter(n => n.status === 'scheduled').length,
      draft: this.notifications.filter(n => n.status === 'draft').length,
      failed: this.notifications.filter(n => n.status === 'failed').length,
      totalRecipients: totalSent,
      totalRead: totalRead,
      readRate: totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0,
      activeRules: this.automaticRules.filter(r => r.enabled).length,
      totalRules: this.automaticRules.length
    }).pipe(delay(300));
  }

  // ==================== HELPERS ====================

  private calculateRecipients(audience: string, userIds?: string[]): number {
    switch (audience) {
      case 'all': return 580;
      case 'apprenants': return 450;
      case 'formateurs': return 30;
      case 'administrateurs': return 5;
      case 'specific': return userIds?.length || 0;
      default: return 0;
    }
  }
}




