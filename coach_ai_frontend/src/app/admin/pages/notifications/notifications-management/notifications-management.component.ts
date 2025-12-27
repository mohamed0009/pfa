import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationsAdminService } from '../../../services/notifications-admin.service';
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
  
  // User search
  searchQuery: string = '';
  searchRole: 'all' | 'TRAINER' | 'USER' | 'ADMIN' = 'all';
  searchResults: any[] = [];
  selectedUsers: any[] = [];
  isSearching: boolean = false;
  showUserSearch: boolean = false;

  constructor(private notificationsService: NotificationsAdminService) {}

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
    // TODO: Implement automatic rules when backend is ready
    this.automaticRules = [];
  }

  loadStatistics(): void {
    this.notificationsService.getNotificationStats().subscribe(stats => {
      this.notifStats = {
        total: stats.total || 0,
        sent: stats.sent || 0,
        scheduled: stats.scheduled || 0,
        totalRecipients: 0,
        readRate: stats.readRate || 0,
        activeRules: stats.activeRules || 0
      };
    });
  }
  
  // User search
  searchUsers(): void {
    if (!this.searchQuery || this.searchQuery.trim().length < 2) {
      this.searchResults = [];
      return;
    }
    
    this.isSearching = true;
    this.notificationsService.searchUsers(this.searchQuery, this.searchRole === 'all' ? undefined : this.searchRole).subscribe({
      next: (users) => {
        this.searchResults = users;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.isSearching = false;
        this.searchResults = [];
      }
    });
  }
  
  selectUser(user: any): void {
    if (!this.selectedUsers.find(u => u.id === user.id)) {
      this.selectedUsers.push(user);
    }
    this.searchQuery = '';
    this.searchResults = [];
  }
  
  removeSelectedUser(userId: string): void {
    this.selectedUsers = this.selectedUsers.filter(u => u.id !== userId);
  }
  
  toggleUserSearch(): void {
    this.showUserSearch = !this.showUserSearch;
    if (!this.showUserSearch) {
      this.searchQuery = '';
      this.searchResults = [];
    }
  }

  // Composer
  createAndSendNotification(): void {
    if (!this.newNotification.title || !this.newNotification.message) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }
    
    // Si des utilisateurs spécifiques sont sélectionnés, utiliser leur audience
    const notificationToSend: Partial<Notification> = {
      ...this.newNotification,
      targetAudience: this.selectedUsers.length > 0 ? 'specific' : this.newNotification.targetAudience,
      targetUserIds: this.selectedUsers.length > 0 ? this.selectedUsers.map(u => u.id) : undefined
    };

    this.notificationsService.createNotification(notificationToSend).subscribe({
      next: (response) => {
        const recipientsCount = response.totalRecipients || 0;
        alert(`Notification envoyée avec succès à ${recipientsCount} destinataire(s)!`);
        this.resetComposer();
        this.loadNotifications();
        this.loadStatistics();
        this.activeTab = 'sent';
      },
      error: (error) => {
        console.error('Error sending notification:', error);
        const errorMessage = error?.error?.error || error?.error?.message || 'Erreur lors de l\'envoi de la notification';
        alert('Erreur: ' + errorMessage);
      }
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
    this.selectedUsers = [];
    this.searchQuery = '';
    this.searchResults = [];
    this.showUserSearch = false;
  }

  // Automatic Rules
  toggleRule(rule: AutomaticNotificationRule): void {
    // TODO: Implement when backend is ready
    rule.enabled = !rule.enabled;
    this.loadStatistics();
  }

  deleteRule(rule: AutomaticNotificationRule): void {
    if (confirm(`Supprimer la règle "${rule.name}"?`)) {
      // TODO: Implement when backend is ready
      this.automaticRules = this.automaticRules.filter(r => r.id !== rule.id);
      this.loadStatistics();
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




