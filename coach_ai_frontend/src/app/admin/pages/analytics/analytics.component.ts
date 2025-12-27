import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsAdminService } from '../../services/analytics-admin.service';
import { Analytics, PerformanceMetric, LearnerActivity } from '../../models/admin.interfaces';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Learning Analytics</h1>
      <div *ngIf="analytics" class="analytics-grid">
        <div class="stat-card">
          <h3>Total Users</h3>
          <p class="stat-value">{{ analytics.totalUsers }}</p>
        </div>
        <div class="stat-card">
          <h3>Active Users</h3>
          <p class="stat-value">{{ analytics.activeUsers }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Courses</h3>
          <p class="stat-value">{{ analytics.totalCourses }}</p>
        </div>
        <div class="stat-card">
          <h3>Average Completion</h3>
          <p class="stat-value">{{ analytics.averageCompletion | number:'1.0-0' }}%</p>
        </div>
      </div>
      <div *ngIf="performanceMetrics.length > 0" class="metrics-section">
        <h2>Performance Metrics</h2>
        <div class="metrics-grid">
          <div class="metric-card" *ngFor="let metric of performanceMetrics">
            <h4>{{ metric.label }}</h4>
            <p class="metric-value">{{ metric.value }}</p>
            <span class="metric-change" [class.up]="metric.trend === 'up'" [class.down]="metric.trend === 'down'">
              {{ metric.change > 0 ? '+' : '' }}{{ metric.change }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      
      h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 24px;
      }
      
      .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }
      
      .stat-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        
        h3 {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #10b981;
        }
      }
      
      .metrics-section {
        margin-top: 32px;
        
        h2 {
          font-size: 1.5rem;
          margin-bottom: 20px;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .metric-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          
          h4 {
            font-size: 0.85rem;
            color: #666;
            margin-bottom: 8px;
          }
          
          .metric-value {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .metric-change {
            font-size: 0.85rem;
            font-weight: 600;
            
            &.up {
              color: #10b981;
            }
            
            &.down {
              color: #ef4444;
            }
          }
        }
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  analytics: Analytics | null = null;
  performanceMetrics: PerformanceMetric[] = [];
  recentActivities: LearnerActivity[] = [];

  constructor(private analyticsService: AnalyticsAdminService) {}

  ngOnInit(): void {
    this.loadAnalytics();
    this.loadPerformanceMetrics();
    this.loadRecentActivities();
  }

  loadAnalytics(): void {
    this.analyticsService.getOverallAnalytics().subscribe(analytics => {
      this.analytics = analytics;
    });
  }

  loadPerformanceMetrics(): void {
    this.analyticsService.getPerformanceMetrics().subscribe(metrics => {
      this.performanceMetrics = metrics;
    });
  }

  loadRecentActivities(): void {
    this.analyticsService.getRecentActivities(10).subscribe(activities => {
      this.recentActivities = activities;
    });
  }
}





