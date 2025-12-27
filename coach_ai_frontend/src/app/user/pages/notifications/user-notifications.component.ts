import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserNotificationsService } from '../../services/user-notifications.service';
import { UserNotification } from '../../models/user.interfaces';

@Component({
  selector: 'app-user-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="notifications-page">
      <div class="page-header">
        <h1>Notifications</h1>
        <button class="btn btn-secondary" (click)="markAllAsRead()" *ngIf="unreadCount > 0">
          <span class="material-icons">done_all</span>
          Tout marquer comme lu
        </button>
      </div>

      <div class="notifications-list">
        <div 
          class="notification-item" 
          *ngFor="let notif of notifications"
          [class.unread]="!notif.readAt"
          [class]="'notif-' + notif.priority"
          (click)="markAsRead(notif)">
          <span class="notification-icon material-icons">{{ getNotifIcon(notif.type) }}</span>
          <div class="notification-content">
            <div class="notification-header">
              <h3>{{ notif.title }}</h3>
              <span class="notification-badge admin-badge" *ngIf="notif.createdBy === 'admin'">
                <span class="material-icons">admin_panel_settings</span>
                Admin
              </span>
            </div>
            <p>{{ notif.message }}</p>
            <span class="notification-time">{{ notif.createdAt | date:'short' }}</span>
          </div>
          <button class="btn-delete" (click)="deleteNotification(notif, $event)">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div *ngIf="notifications.length === 0" class="empty-state">
          <span class="material-icons">notifications_off</span>
          <p>Aucune notification</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-page { max-width: 900px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .notifications-list { background: white; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden; }
    .notification-item { display: flex; gap: 16px; padding: 20px; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: all 0.3s ease; position: relative; }
    .notification-item:hover { background: #f9fafb; }
    .notification-item:hover .btn-delete { opacity: 1; }
    .notification-item.unread { background: rgba(16, 185, 129, 0.05); }
    .notification-item.notif-high { border-left: 3px solid #ef4444; }
    .notification-item.notif-medium { border-left: 3px solid #f59e0b; }
    .notification-icon { font-size: 32px; color: #10b981; flex-shrink: 0; }
    .notification-content { flex: 1; min-width: 0; }
    .notification-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
    .notification-content h3 { font-size: 1rem; font-weight: 700; margin: 0; flex: 1; }
    .notification-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .admin-badge { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; }
    .admin-badge .material-icons { font-size: 14px; }
    .notification-content p { font-size: 0.9rem; color: #6b7280; margin-bottom: 8px; line-height: 1.6; }
    .notification-time { font-size: 0.75rem; color: #9ca3af; }
    .btn-delete { background: none; border: none; cursor: pointer; padding: 6px; opacity: 0; transition: all 0.3s ease; border-radius: 50%; }
    .btn-delete:hover { background: rgba(239, 68, 68, 0.1); }
    .btn-delete .material-icons { font-size: 20px; color: #dc2626; }
    .empty-state { text-align: center; padding: 60px 20px; color: #6b7280; }
    .empty-state .material-icons { font-size: 64px; margin-bottom: 16px; }
    .btn { padding: 10px 20px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-secondary:hover { background: #e5e7eb; }
  `]
})
export class UserNotificationsComponent implements OnInit {
  notifications: UserNotification[] = [];
  unreadCount = 0;

  constructor(private notificationsService: UserNotificationsService) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.notificationsService.unreadCount$.subscribe(count => this.unreadCount = count);
  }

  loadNotifications(): void {
    this.notificationsService.getNotifications().subscribe(n => this.notifications = n);
  }

  markAsRead(notif: UserNotification): void {
    if (!notif.readAt) {
      this.notificationsService.markAsRead(notif.id).subscribe(() => {
        this.loadNotifications();
      });
    }
    if (notif.actionUrl) {
      window.location.href = notif.actionUrl;
    }
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe(() => this.loadNotifications());
  }

  deleteNotification(notif: UserNotification, event: Event): void {
    event.stopPropagation();
    this.notificationsService.deleteNotification(notif.id).subscribe(() => this.loadNotifications());
  }

  getNotifIcon(type: string): string {
    const icons: any = {
      'reminder': 'schedule',
      'new_content': 'auto_stories',
      'motivation': 'favorite',
      'alert': 'notification_important',
      'achievement': 'emoji_events'
    };
    return icons[type] || 'notifications';
  }
}




