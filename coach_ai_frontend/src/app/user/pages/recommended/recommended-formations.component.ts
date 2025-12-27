import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface RecommendedFormation {
  id: string;
  formationId: string;
  formationTitle: string;
  formationDescription: string;
  formationThumbnail: string;
  formationLevel: string;
  formationDuration: number;
  trainerName: string;
  trainerAvatar?: string;
  reason: string; // Raison de la recommandation
  basedOn: string[]; // ["Vous avez terminé HTML", "Niveau actuel: Débutant+"]
  recommendedBy: string; // Nom du formateur
  recommendedAt: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'viewed' | 'enrolled' | 'dismissed';
}

@Component({
  selector: 'app-recommended-formations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recommended-formations.component.html',
  styleUrl: './recommended-formations.component.scss'
})
export class RecommendedFormationsComponent implements OnInit {
  recommendations: RecommendedFormation[] = [];
  isLoading: boolean = true;

  private apiUrl = 'http://localhost:8081/api/user/recommendations';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (recommendations) => {
        // Mapper les données backend vers le format frontend
        this.recommendations = recommendations.map((r: any) => ({
          id: r.id || '',
          formationId: r.formation?.id || r.course?.id || '',
          formationTitle: r.formation?.title || r.course?.title || '',
          formationDescription: r.formation?.description || r.course?.description || '',
          formationThumbnail: r.formation?.thumbnail || r.course?.thumbnail || '',
          formationLevel: r.formation?.level?.toString() || r.course?.level?.toString() || 'DEBUTANT',
          formationDuration: r.formation?.duration || r.course?.duration || 0,
          trainerName: r.trainer?.firstName + ' ' + r.trainer?.lastName || 'Formateur',
          trainerAvatar: r.trainer?.avatarUrl || '',
          reason: r.reason || r.justification || '',
          basedOn: r.basedOn || [],
          recommendedBy: r.trainer?.firstName + ' ' + r.trainer?.lastName || 'Formateur',
          recommendedAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          priority: (r.priority || 'medium').toLowerCase(),
          status: (r.status || 'pending').toLowerCase()
        }));
        this.isLoading = false;
        console.log('Recommendations loaded:', this.recommendations);
      },
      error: (error) => {
        console.error('Error loading recommendations:', error);
        this.isLoading = false;
        this.recommendations = []; // Pas de fallback mock, afficher liste vide
      }
    });
  }

  viewFormation(formationId: string, recommendationId: string): void {
    // Marquer comme vue
    this.markAsViewed(recommendationId);
    this.router.navigate(['/user/formations', formationId]);
  }

  dismissRecommendation(recommendationId: string): void {
    this.http.post(`${this.apiUrl}/${recommendationId}/dismiss`, {}).subscribe({
      next: () => {
        this.recommendations = this.recommendations.filter(r => r.id !== recommendationId);
      },
      error: (error) => {
        console.error('Error dismissing recommendation:', error);
      }
    });
  }

  private markAsViewed(recommendationId: string): void {
    this.http.post(`${this.apiUrl}/${recommendationId}/view`, {}).subscribe({
      next: () => {
        const reco = this.recommendations.find(r => r.id === recommendationId);
        if (reco) {
          reco.status = 'viewed';
        }
      }
    });
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Suggéré',
      'medium': 'Recommandé',
      'high': 'Fortement recommandé'
    };
    return labels[priority] || priority;
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'low': '#6c757d',
      'medium': '#ffc107',
      'high': '#dc3545'
    };
    return colors[priority] || '#6c757d';
  }

  getLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'DEBUTANT': 'Débutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'AVANCE': 'Avancé'
    };
    return labels[level] || level;
  }
}

