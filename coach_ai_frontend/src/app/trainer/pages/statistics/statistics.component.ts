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
    
    const formationId = this.selectedFormation !== 'all' ? this.selectedFormation : null;
    const period = this.selectedPeriod || '30';
    
    // Utiliser les statistiques du backend
    this.trainerService.getTrainerStats().subscribe(stats => {
      // Récupérer les étudiants à risque
      this.trainerService.getAtRiskStudents().subscribe(atRiskStudents => {
        // Récupérer les statistiques des formations
        this.trainerService.getFormationsStatistics().subscribe(formationsStats => {
          // Construire les données de statistiques
          const formationStats = formationId 
            ? formationsStats.find(f => f.formationId === formationId)
            : null;
          
          this.statistics = {
            totalStudents: stats.totalStudents,
            studentsTrend: 12, // À calculer depuis les données historiques
            averageCompletion: stats.averageStudentProgress,
            completionTrend: 8, // À calculer
            averageScore: 75, // À calculer depuis les quiz scores
            scoreTrend: 5, // À calculer
            averageTimeSpent: 24, // À calculer
            progressionTrend: [
              { date: 'Sem 1', value: 45 },
              { date: 'Sem 2', value: 52 },
              { date: 'Sem 3', value: 58 },
              { date: 'Sem 4', value: stats.averageStudentProgress }
            ],
            difficultyDistribution: {
              easy: 35,
              medium: 45,
              hard: 20
            },
            modulePerformance: [], // À remplir depuis les modules
            atRiskStudents: atRiskStudents.map(s => ({
              id: s.studentId,
              name: s.studentName,
              formation: s.formationName,
              riskLevel: s.riskLevel === 'high' ? 'Élevé' : s.riskLevel === 'medium' ? 'Moyen' : 'Faible',
              reason: s.reasons && s.reasons.length > 0 ? s.reasons[0] : 'Problème de progression'
            }))
          };
          
          this.isLoading = false;
        });
      });
    });
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



