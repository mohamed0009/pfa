import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';
import { PersonalizedLearningPath, TrainerFormation } from '../../models/trainer.interfaces';

@Component({
  selector: 'app-learning-paths',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './learning-paths.component.html',
  styleUrls: ['./learning-paths.component.scss']
})
export class LearningPathsComponent implements OnInit {
  paths: PersonalizedLearningPath[] = [];
  filteredPaths: PersonalizedLearningPath[] = [];
  formations: TrainerFormation[] = [];
  
  filterType = 'all';
  selectedFormation = 'all';
  searchTerm = '';
  
  showAIPanel = false;
  aiRecommendations: any[] = [];
  isLoading = false;

  constructor(
    private trainerService: TrainerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadAIRecommendations();
  }

  loadData(): void {
    this.isLoading = true;

    this.trainerService.getFormations().subscribe((formations: TrainerFormation[]) => {
      this.formations = formations;
    });

    this.trainerService.getPersonalizedPaths().subscribe(paths => {
      this.paths = paths;
      this.filteredPaths = paths;
      this.isLoading = false;
    });
  }

  loadAIRecommendations(): void {
    this.trainerService.getAIPathSuggestions().subscribe(recommendations => {
      this.aiRecommendations = recommendations.map(r => ({
        id: r.id,
        studentName: r.studentName,
        suggestion: r.suggestion,
        icon: r.priority === 'high' ? 'priority_high' : 'lightbulb'
      }));
      
      if (this.aiRecommendations.length > 0) {
        this.showAIPanel = true;
      }
    });
  }

  applyFilters(): void {
    this.filteredPaths = this.paths.filter(path => {
      const matchesType = this.filterType === 'all' || path.status === this.filterType;
      const matchesFormation = this.selectedFormation === 'all' || path.formationId === this.selectedFormation;
      const matchesSearch = path.studentName.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesType && matchesFormation && matchesSearch;
    });
  }

  createPath(): void {
    console.log('Creating new learning path');
    // TODO: Implement create path dialog
  }

  viewPath(id: string): void {
    this.router.navigate(['/trainer/learning-paths', id]);
  }

  adjustPath(id: string): void {
    console.log('Adjusting path:', id);
    // TODO: Implement adjust path dialog
  }

  applyRecommendation(id: string): void {
    console.log('Applying recommendation:', id);
    this.aiRecommendations = this.aiRecommendations.filter(r => r.id !== id);
    
    if (this.aiRecommendations.length === 0) {
      this.showAIPanel = false;
    }
  }

  dismissRecommendation(id: string): void {
    this.aiRecommendations = this.aiRecommendations.filter(r => r.id !== id);
    
    if (this.aiRecommendations.length === 0) {
      this.showAIPanel = false;
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'active': 'Actif',
      'draft': 'Brouillon',
      'completed': 'Complété'
    };
    return labels[status] || status;
  }
}



