import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserProfileService } from '../../services/user-profile.service';
import { UserProgressService } from '../../services/user-progress.service';
import { LearningPathService } from '../../services/learning-path.service';
import { UserNotificationsService } from '../../services/user-notifications.service';
import { UserProfile, UserProgress, Recommendation, UserNotification, Lesson } from '../../models/user.interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: UserProfile | null = null;
  userProgress: UserProgress | null = null;
  recommendations: Recommendation[] = [];
  recentNotifications: UserNotification[] = [];
  nextLesson: Lesson | null = null;
  
  // Quick stats
  studyTimeToday = 2.5;
  weeklyGoalPercentage = 78;
  Math = Math;

  constructor(
    private userProfileService: UserProfileService,
    private progressService: UserProgressService,
    private learningPathService: LearningPathService,
    private notificationsService: UserNotificationsService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadProgress();
    this.loadRecommendations();
    this.loadRecentNotifications();
    this.loadNextLesson();
  }

  loadUserData(): void {
    this.userProfileService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadProgress(): void {
    this.progressService.getUserProgress().subscribe(progress => {
      this.userProgress = progress;
    });
  }

  loadRecommendations(): void {
    this.learningPathService.getRecommendations().subscribe(recs => {
      this.recommendations = recs.slice(0, 3);
    });
  }

  loadRecentNotifications(): void {
    this.notificationsService.getUnreadNotifications().subscribe(notifs => {
      this.recentNotifications = notifs.slice(0, 3);
    });
  }

  loadNextLesson(): void {
    this.learningPathService.getNextLesson().subscribe(lesson => {
      this.nextLesson = lesson;
    });
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 75) return '#10b981';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'achievement': return 'emoji_events';
      case 'new_content': return 'auto_stories';
      case 'reminder': return 'schedule';
      case 'motivation': return 'favorite';
      case 'alert': return 'notification_important';
      default: return 'notifications';
    }
  }

  getDayGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }
}




