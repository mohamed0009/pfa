import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationsEnhancedService } from '../../../services/notifications-enhanced.service';
import { 
  Notification, 
  AutomaticNotificationRule,
  NotificationType,
  NotificationPriority
} from '../../../models/admin.interfaces';

@Component({
  selector: 'app-notifications-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications-management.component.html',
  styleUrl: './notifications-management.component.scss'
})
export class NotificationsManagementComponent implements OnInit {
  notifications: Notification[] = [];
  automaticRules: AutomaticNotificationRule[] = [];
  
  // Stats
  notifStats = {
    total: 0,
    sent: 0,
    scheduled: 0,
    totalRecipients: 0,
    readRate: 0,
    activeRules: 0
  };

  // Tabs
  activeTab: 'compose' | 'sent' | 'scheduled' | 'rules' = 'compose';

  // Composer
  newNotification: Partial<Notification> = {
    type: 'announcement',
    priority: 'medium',
    targetAudience: 'all'
  };

  constructor(private notificationsService: NotificationsEnhancedService) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadAutomaticRules();
    this.loadStatistics();
  }

  loadNotifications(): void {
    this.notificationsService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  loadAutomaticRules(): void {
    this.notificationsService.getAutomaticRules().subscribe(rules => {
      this.automaticRules = rules;
    });
  }

  loadStatistics(): void {
    this.notificationsService.getNotificationStatistics().subscribe(stats => {
      this.notifStats = stats;
    });
  }

  // Composer
  createAndSendNotification(): void {
    if (!this.newNotification.title || !this.newNotification.message) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    this.notificationsService.createNotification(this.newNotification).subscribe(notification => {
      this.notificationsService.sendNotification(notification.id).subscribe(() => {
        alert('Notification envoyée avec succès!');
        this.resetComposer();
        this.loadNotifications();
        this.loadStatistics();
        this.activeTab = 'sent';
      });
    });
  }

  createAndScheduleNotification(scheduledFor: Date): void {
    if (!this.newNotification.title || !this.newNotification.message) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    this.newNotification.scheduledFor = scheduledFor;
    this.notificationsService.createNotification(this.newNotification).subscribe(() => {
      alert('Notification planifiée avec succès!');
      this.resetComposer();
      this.loadNotifications();
      this.loadStatistics();
      this.activeTab = 'scheduled';
    });
  }

  saveDraft(): void {
    if (!this.newNotification.title) {
      alert('Le titre est requis');
      return;
    }

    this.notificationsService.createNotification(this.newNotification).subscribe(() => {
      alert('Brouillon sauvegardé');
      this.resetComposer();
      this.loadNotifications();
    });
  }

  resetComposer(): void {
    this.newNotification = {
      type: 'announcement',
      priority: 'medium',
      targetAudience: 'all'
    };
  }

  // Automatic Rules
  toggleRule(rule: AutomaticNotificationRule): void {
    this.notificationsService.toggleAutomaticRule(rule.id, !rule.enabled).subscribe(() => {
      this.loadAutomaticRules();
      this.loadStatistics();
    });
  }

  deleteRule(rule: AutomaticNotificationRule): void {
    if (confirm(`Supprimer la règle "${rule.name}"?`)) {
      this.notificationsService.deleteAutomaticRule(rule.id).subscribe(() => {
        this.loadAutomaticRules();
        this.loadStatistics();
      });
    }
  }

  // Helpers
  getTypeLabel(type: NotificationType): string {
    const labels: Record<NotificationType, string> = {
      'announcement': 'Annonce',
      'alert': 'Alerte',
      'reminder': 'Rappel',
      'motivation': 'Motivation',
      'update': 'Mise à jour'
    };
    return labels[type] || type;
  }

  getPriorityLabel(priority: NotificationPriority): string {
    const labels: Record<NotificationPriority, string> = {
      'urgent': 'Urgent',
      'high': 'Haute',
      'medium': 'Moyenne',
      'low': 'Basse'
    };
    return labels[priority] || priority;
  }

  get sentNotifications(): Notification[] {
    return this.notifications.filter(n => n.status === 'sent');
  }

  get scheduledNotifications(): Notification[] {
    return this.notifications.filter(n => n.status === 'scheduled');
  }
}




