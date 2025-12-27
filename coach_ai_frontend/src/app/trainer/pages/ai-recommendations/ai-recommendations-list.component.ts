import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface AIRecommendation {
  id: string;
  type: 'FORMATION' | 'MODULE' | 'QUIZ' | 'LAB' | 'RESOURCE';
  title: string;
  description: string;
  justification: string;
  basedOnData: {
    studentCount: number;
    conversationTopics: string[];
    difficultyDetected: string;
    level: string;
    specialty: string;
  };
  suggestedContent?: any;
  targetStudents: string[]; // IDs des apprenants concernés
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

@Component({
  selector: 'app-ai-recommendations-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ai-recommendations-list.component.html',
  styleUrl: './ai-recommendations-list.component.scss'
})
export class AIRecommendationsListComponent implements OnInit {
  recommendations: AIRecommendation[] = [];
  filteredRecommendations: AIRecommendation[] = [];
  selectedFilter: string = 'all';
  isLoading: boolean = true;

  filters = [
    { value: 'all', label: 'Toutes', count: 0 },
    { value: 'pending', label: 'En attente', count: 0 },
    { value: 'approved', label: 'Approuvées', count: 0 },
    { value: 'published', label: 'Publiées', count: 0 },
    { value: 'rejected', label: 'Refusées', count: 0 }
  ];

  private apiUrl = 'http://localhost:8081/api/trainer/ai-recommendations';

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
          type: r.type || 'FORMATION',
          title: r.title || '',
          description: r.description || '',
          justification: r.justification || r.reason || '',
          basedOnData: r.basedOnData || {
            studentCount: r.targetStudents?.length || 0,
            conversationTopics: r.topics || [],
            difficultyDetected: r.difficulty || 'MEDIUM',
            level: r.level || 'INTERMEDIAIRE',
            specialty: r.specialty || ''
          },
          targetStudents: r.targetStudents || [],
          priority: r.priority || 'MEDIUM',
          status: r.status || 'PENDING',
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
        }));
        this.updateFilterCounts();
        this.applyFilter(this.selectedFilter);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recommendations:', error);
        this.isLoading = false;
        this.recommendations = []; // Pas de fallback mock, afficher liste vide
        this.updateFilterCounts();
        this.applyFilter(this.selectedFilter);
      }
    });
  }

  applyFilter(filterValue: string): void {
    this.selectedFilter = filterValue;
    
    if (filterValue === 'all') {
      this.filteredRecommendations = this.recommendations;
    } else {
      this.filteredRecommendations = this.recommendations.filter(r => 
        r.status.toLowerCase() === filterValue
      );
    }
  }

  private updateFilterCounts(): void {
    this.filters[0].count = this.recommendations.length;
    this.filters[1].count = this.recommendations.filter(r => r.status === 'PENDING').length;
    this.filters[2].count = this.recommendations.filter(r => r.status === 'APPROVED').length;
    this.filters[3].count = this.recommendations.filter(r => r.status === 'PUBLISHED').length;
    this.filters[4].count = this.recommendations.filter(r => r.status === 'REJECTED').length;
  }

  viewRecommendation(recommendationId: string): void {
    this.router.navigate(['/trainer/ai-recommendations', recommendationId]);
  }

  approveRecommendation(recommendationId: string, event: Event): void {
    event.stopPropagation();
    
    this.http.post(`${this.apiUrl}/${recommendationId}/approve`, {}).subscribe({
      next: () => {
        const reco = this.recommendations.find(r => r.id === recommendationId);
        if (reco) {
          reco.status = 'APPROVED';
          this.updateFilterCounts();
          this.applyFilter(this.selectedFilter);
        }
        alert('Recommandation approuvée! Elle sera visible pour les apprenants concernés.');
      },
      error: (error) => {
        console.error('Error approving recommendation:', error);
        alert('Erreur lors de l\'approbation');
      }
    });
  }

  rejectRecommendation(recommendationId: string, event: Event): void {
    event.stopPropagation();
    
    if (!confirm('Êtes-vous sûr de vouloir refuser cette recommandation?')) {
      return;
    }

    this.http.post(`${this.apiUrl}/${recommendationId}/reject`, {}).subscribe({
      next: () => {
        const reco = this.recommendations.find(r => r.id === recommendationId);
        if (reco) {
          reco.status = 'REJECTED';
          this.updateFilterCounts();
          this.applyFilter(this.selectedFilter);
        }
      },
      error: (error) => {
        console.error('Error rejecting recommendation:', error);
      }
    });
  }

  publishRecommendation(recommendationId: string, event: Event): void {
    event.stopPropagation();
    
    if (!confirm('Publier cette recommandation ? Elle sera visible pour les apprenants concernés.')) {
      return;
    }

    this.http.post(`${this.apiUrl}/${recommendationId}/publish`, {}).subscribe({
      next: () => {
        const reco = this.recommendations.find(r => r.id === recommendationId);
        if (reco) {
          reco.status = 'PUBLISHED';
          this.updateFilterCounts();
          this.applyFilter(this.selectedFilter);
        }
        alert('Recommandation publiée avec succès! Les apprenants peuvent maintenant la voir.');
      },
      error: (error) => {
        console.error('Error publishing recommendation:', error);
        alert('Erreur lors de la publication');
      }
    });
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'FORMATION': 'Nouvelle Formation',
      'MODULE': 'Module Supplémentaire',
      'QUIZ': 'Quiz de Renforcement',
      'LAB': 'Lab Pratique',
      'RESOURCE': 'Ressource Complémentaire'
    };
    return labels[type] || type;
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'FORMATION': 'school',
      'MODULE': 'view_module',
      'QUIZ': 'quiz',
      'LAB': 'science',
      'RESOURCE': 'library_books'
    };
    return icons[type] || 'lightbulb';
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'LOW': '#6c757d',
      'MEDIUM': '#ffc107',
      'HIGH': '#dc3545'
    };
    return colors[priority] || '#6c757d';
  }

  getDifficultyColor(difficulty: string): string {
    const colors: { [key: string]: string } = {
      'LOW': '#28a745',
      'MEDIUM': '#ffc107',
      'HIGH': '#dc3545'
    };
    return colors[difficulty] || '#6c757d';
  }
}

