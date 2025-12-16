import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsAdminService } from '../../services/notifications-admin.service';
import { Notification } from '../../models/admin.interfaces';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Notifications</h1>
      <div class="notifications-list">
        <div class="notification-item" *ngFor="let notification of notifications" 
             [attr.data-type]="notification.type"
             [class.unread]="!notification.isRead">
          <span class="material-icons">{{ getNotificationIcon(notification.type) }}</span>
          <div class="notification-content">
            <h3>{{ notification.title }}</h3>
            <p>{{ notification.message }}</p>
            <span class="time">{{ notification.createdAt | date: 'short' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../styles/variables';
    
    .page-container {
      max-width: 900px;
      
      h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 24px;
      }
    }
    
    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .notification-item {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      gap: 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border-left: 4px solid transparent;
      
      &.unread {
        background: rgba($primary-green, 0.05);
      }
      
      &[data-type="warning"] {
        border-left-color: #f59e0b;
      }
      
      &[data-type="error"] {
        border-left-color: #dc2626;
      }
      
      &[data-type="success"] {
        border-left-color: #10b981;
      }
      
      .material-icons {
        font-size: 32px;
        color: $primary-green;
      }
      
      .notification-content {
        flex: 1;
        
        h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        p {
          color: $text-secondary;
          margin-bottom: 8px;
        }
        
        .time {
          font-size: 0.85rem;
          color: $text-muted;
        }
      }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationsService: NotificationsAdminService) {}

  ngOnInit(): void {
    this.notificationsService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'success': return 'check_circle';
      default: return 'info';
    }
  }
}





