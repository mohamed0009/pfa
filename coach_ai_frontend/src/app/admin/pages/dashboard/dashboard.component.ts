import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsAdminService } from '../../services/analytics-admin.service';
import { UsersAdminService } from '../../services/users-admin.service';
import { CoursesAdminService } from '../../services/courses-admin.service';
import { Analytics, PerformanceMetric, LearnerActivity } from '../../models/admin.interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  analytics: Analytics | null = null;
  performanceMetrics: PerformanceMetric[] = [];
  recentActivities: LearnerActivity[] = [];
  loading = true;

  constructor(
    private analyticsService: AnalyticsAdminService,
    private usersService: UsersAdminService,
    private coursesService: CoursesAdminService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Load analytics
    this.analyticsService.getOverallAnalytics().subscribe(data => {
      this.analytics = data;
    });

    // Load performance metrics
    this.analyticsService.getPerformanceMetrics().subscribe(metrics => {
      this.performanceMetrics = metrics;
    });

    // Load recent activities
    this.analyticsService.getRecentActivities(8).subscribe(activities => {
      this.recentActivities = activities;
      this.loading = false;
    });
  }

  getActivityIcon(action: string): string {
    switch (action) {
      case 'enrolled': return 'person_add';
      case 'completed_module': return 'check_circle';
      case 'completed_course': return 'emoji_events';
      case 'quiz_taken': return 'quiz';
      default: return 'info';
    }
  }

  getActivityColor(action: string): string {
    switch (action) {
      case 'enrolled': return 'blue';
      case 'completed_module': return 'green';
      case 'completed_course': return 'gold';
      case 'quiz_taken': return 'purple';
      default: return 'gray';
    }
  }

  getTrendIcon(trend: string): string {
    return trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat';
  }

  getTrendClass(trend: string): string {
    return trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-stable';
  }
}





