import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrainerProfile, TrainerStats, AtRiskStudent, FormationStatistics } from '../../models/trainer.interfaces';
import { TrainerService } from '../../services/trainer.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  trainerProfile: TrainerProfile | null = null;
  stats: TrainerStats | null = null;
  atRiskStudents: AtRiskStudent[] = [];
  recentFormations: FormationStatistics[] = [];
  isLoading = true;

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.trainerService.getTrainerProfile().subscribe(profile => {
      this.trainerProfile = profile;
    });

    this.trainerService.getTrainerStats().subscribe(stats => {
      this.stats = stats;
      this.isLoading = false;
    });

    this.trainerService.getAtRiskStudents().subscribe(students => {
      this.atRiskStudents = students;
    });

    this.trainerService.getFormationsStatistics().subscribe(formations => {
      this.recentFormations = formations.slice(0, 5);
    });
  }

  getRiskLevelColor(level: string): string {
    const colors: Record<string, string> = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };
    return colors[level] || '#6b7280';
  }

  getPerformanceColor(performance: string): string {
    const colors: Record<string, string> = {
      'excellent': '#10b981',
      'good': '#3b82f6',
      'average': '#f59e0b',
      'poor': '#ef4444'
    };
    return colors[performance] || '#6b7280';
  }
}



