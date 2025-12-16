import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../services/trainer.service';
import { TrainerFormation, FormationStatistics } from '../../models/trainer.interfaces';

interface StatisticsData {
  totalStudents: number;
  studentsTrend: number;
  averageCompletion: number;
  completionTrend: number;
  averageScore: number;
  scoreTrend: number;
  averageTimeSpent: number;
  progressionTrend: Array<{ date: string; value: number }>;
  difficultyDistribution: { easy: number; medium: number; hard: number };
  modulePerformance: Array<{
    title: string;
    enrolledStudents: number;
    completionRate: number;
    averageScore: number;
    averageTime: number;
    status: string;
  }>;
  atRiskStudents: Array<{
    id: string;
    name: string;
    formation: string;
    riskLevel: string;
    reason: string;
  }>;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  formations: TrainerFormation[] = [];
  selectedFormation = 'all';
  selectedPeriod = '30';
  
  statistics: StatisticsData | null = null;
  isLoading = false;

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadFormations();
    this.loadStatistics();
  }

  loadFormations(): void {
    this.trainerService.getFormations().subscribe((formations: TrainerFormation[]) => {
      this.formations = formations;
    });
  }

  loadStatistics(): void {
    this.isLoading = true;
    
    // Simulate API call with mock data
    setTimeout(() => {
      this.statistics = {
        totalStudents: 156,
        studentsTrend: 12,
        averageCompletion: 68,
        completionTrend: 8,
        averageScore: 75,
        scoreTrend: 5,
        averageTimeSpent: 24,
        progressionTrend: [
          { date: 'Sem 1', value: 45 },
          { date: 'Sem 2', value: 52 },
          { date: 'Sem 3', value: 58 },
          { date: 'Sem 4', value: 68 }
        ],
        difficultyDistribution: {
          easy: 35,
          medium: 45,
          hard: 20
        },
        modulePerformance: [
          {
            title: 'Introduction à la Programmation',
            enrolledStudents: 89,
            completionRate: 78,
            averageScore: 82,
            averageTime: 12,
            status: 'excellent'
          },
          {
            title: 'Structures de Données',
            enrolledStudents: 67,
            completionRate: 65,
            averageScore: 71,
            averageTime: 18,
            status: 'good'
          },
          {
            title: 'Algorithmes Avancés',
            enrolledStudents: 45,
            completionRate: 52,
            averageScore: 68,
            averageTime: 25,
            status: 'needs_improvement'
          }
        ],
        atRiskStudents: [
          {
            id: '1',
            name: 'Marie Dupont',
            formation: 'Développement Web',
            riskLevel: 'Élevé',
            reason: 'Retard de 2 semaines'
          },
          {
            id: '2',
            name: 'Jean Martin',
            formation: 'Data Science',
            riskLevel: 'Moyen',
            reason: 'Score en baisse'
          }
        ]
      };
      this.isLoading = false;
    }, 1000);
  }

  exportStatistics(): void {
    console.log('Exporting statistics...');
    // Implement export functionality
  }

  contactStudent(studentId: string): void {
    console.log('Contacting student:', studentId);
    // Implement contact functionality
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'excellent': 'Excellent',
      'good': 'Bon',
      'needs_improvement': 'À améliorer'
    };
    return labels[status] || status;
  }
}



