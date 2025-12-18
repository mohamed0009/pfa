import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsersAdminService } from '../../../services/users-admin.service';
import { User } from '../../../models/admin.interfaces';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container" *ngIf="user">
      <div class="page-header">
        <button class="btn-back" routerLink="/admin/users">
          <span class="material-icons">arrow_back</span>
          Back to Users
        </button>
      </div>

      <div class="user-profile-card">
        <img [src]="user.avatarUrl" [alt]="user.fullName" class="profile-avatar">
        <h1>{{ user.fullName }}</h1>
        <p>{{ user.email }}</p>
        <span class="status-badge" [attr.data-status]="user.status">{{ user.status }}</span>
      </div>

      <div class="details-grid">
        <div class="detail-card">
          <h3>Training</h3>
          <p>{{ user.training }}</p>
        </div>
        <div class="detail-card">
          <h3>Level</h3>
          <p>{{ user.level }}</p>
        </div>
        <div class="detail-card">
          <h3>Courses Enrolled</h3>
          <p>{{ user.coursesEnrolled }}</p>
        </div>
        <div class="detail-card">
          <h3>Courses Completed</h3>
          <p>{{ user.coursesCompleted }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../../styles/variables';
    
    .page-container {
      max-width: 1000px;
    }
    
    .btn-back {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      color: $primary-green;
      font-weight: 600;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 0.3s ease;
      margin-bottom: 24px;
      
      &:hover {
        background: rgba($primary-green, 0.1);
      }
    }
    
    .user-profile-card {
      background: white;
      border-radius: 16px;
      padding: 48px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 24px;
      
      .profile-avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid $primary-green;
        margin-bottom: 20px;
      }
      
      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: $dark-text;
        margin-bottom: 8px;
      }
      
      p {
        color: $text-secondary;
        margin-bottom: 16px;
      }
      
      .status-badge {
        display: inline-block;
        padding: 6px 16px;
        border-radius: 20px;
        font-weight: 600;
        
        &[data-status="active"] {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
      }
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .detail-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      
      h3 {
        font-size: 0.9rem;
        font-weight: 600;
        color: $text-secondary;
        margin-bottom: 8px;
      }
      
      p {
        font-size: 1.5rem;
        font-weight: 700;
        color: $dark-text;
      }
    }
  `]
})
export class UserDetailsComponent implements OnInit {
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersAdminService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.usersService.getUserById(userId).subscribe(user => {
        this.user = user || null;
      });
    }
  }
}





