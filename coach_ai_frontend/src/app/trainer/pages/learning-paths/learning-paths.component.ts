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

    // Charger les parcours personnalisés depuis l'API
    this.trainerService.getPersonalizedPaths().subscribe({
      next: (paths) => {
        this.paths = paths || [];
        this.filteredPaths = this.paths;
        this.isLoading = false;
        console.log('Parcours chargés:', this.paths.length);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des parcours:', error);
        this.paths = [];
        this.filteredPaths = [];
        this.isLoading = false;
      }
    });
  }

  loadAIRecommendations(): void {
    // Charger les recommandations ML depuis le nouveau endpoint
    this.trainerService.getMLRecommendations().subscribe({
      next: (recommendations) => {
        // Convertir les recommandations ML en parcours personnalisés
        const mlPaths: PersonalizedLearningPath[] = recommendations.map(rec => {
          const student = rec.students && rec.students.length > 0 ? rec.students[0] : null;
          const studentName = student?.name || student?.firstName + ' ' + student?.lastName || 'Étudiant';
          
          return {
            id: rec.id,
            studentId: student?.id || '',
            studentName: studentName,
            formationId: '',
            formationName: rec.title,
            formationTitle: rec.title,
            baseFormationId: '',
            status: rec.status === 'PENDING' ? 'draft' : 'active',
            completionRate: 0,
            modulesCount: 0,
            estimatedTime: 0,
            averageScore: 0,
            createdBy: 'system',
            createdAt: rec.createdAt,
            updatedAt: rec.createdAt,
            adjustments: [{
              id: rec.id + '-adj',
              reason: rec.justification || rec.description,
              courseTitle: rec.title,
              confidenceScore: rec.confidence,
              conversationExcerpt: rec.justification,
              predictedDifficulty: rec.level
            }],
            modules: [],
            confidenceScore: rec.confidence,
            predictedDifficulty: rec.level
          };
        });
        
        // Ajouter les parcours ML aux parcours existants
        this.paths = [...mlPaths, ...this.paths];
        this.filteredPaths = this.paths;
        
        // Mettre à jour les recommandations AI pour le panel
        this.aiRecommendations = recommendations.map(r => ({
          id: r.id,
          studentName: r.students && r.students.length > 0 ? r.students[0].name : 'Étudiant',
          suggestion: r.justification || r.description,
          icon: r.priority === 'HIGH' ? 'priority_high' : 'lightbulb',
          confidenceScore: r.confidence || 0,
          courseTitle: r.title || '',
          conversationExcerpt: r.justification || '',
          studentId: r.students && r.students.length > 0 ? r.students[0].id : '',
          specialty: r.specialty || '',
          level: r.level || ''
        }));
        
        if (this.aiRecommendations.length > 0) {
          this.showAIPanel = true;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des recommandations ML:', error);
        // Fallback sur l'ancienne méthode
        this.trainerService.getAIPathSuggestions().subscribe(recommendations => {
          this.aiRecommendations = recommendations.map(r => ({
            id: r.id,
            studentName: r.studentName,
            suggestion: r.suggestion,
            icon: r.priority === 'high' ? 'priority_high' : 'lightbulb',
            confidenceScore: r.confidenceScore || 0,
            courseTitle: r.courseTitle || '',
            conversationExcerpt: r.conversationExcerpt || '',
            studentId: r.studentId || '',
            courseId: r.courseId || ''
          }));
          
          if (this.aiRecommendations.length > 0) {
            this.showAIPanel = true;
          }
        });
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
    this.isLoading = true;
    
    this.trainerService.applyRecommendation(id, {
      duration: 40,
      objectives: ['Formation recommandée basée sur l\'analyse ML']
    }).subscribe({
      next: (response) => {
        console.log('Recommandation appliquée:', response);
        // Retirer la recommandation de la liste
        this.aiRecommendations = this.aiRecommendations.filter(r => r.id !== id);
        
        if (this.aiRecommendations.length === 0) {
          this.showAIPanel = false;
        }
        
        this.isLoading = false;
        alert('La recommandation a été appliquée avec succès! Une formation a été créée et est en attente d\'approbation par l\'administrateur.');
        
        // Recharger les données
        this.loadData();
      },
      error: (error) => {
        console.error('Erreur lors de l\'application de la recommandation:', error);
        this.isLoading = false;
        alert('Erreur lors de l\'application de la recommandation. Veuillez réessayer.');
      }
    });
  }

  dismissRecommendation(id: string): void {
    this.aiRecommendations = this.aiRecommendations.filter(r => r.id !== id);
    
    if (this.aiRecommendations.length === 0) {
      this.showAIPanel = false;
    }
  }

  applyPath(pathId: string): void {
    const path = this.paths.find(p => p.id === pathId);
    if (path) {
      // Si c'est une recommandation ML (statut draft), appliquer via l'API
      if (path.status === 'draft' && path.adjustments && path.adjustments.length > 0) {
        this.isLoading = true;
        this.trainerService.applyRecommendation(pathId, {
          duration: path.estimatedTime || 40,
          objectives: [`Formation recommandée pour ${path.studentName} basée sur l'analyse ML`]
        }).subscribe({
          next: (response) => {
            console.log('Recommandation appliquée:', response);
            // Mettre à jour le statut localement
            path.status = 'active';
            path.updatedAt = new Date();
            this.applyFilters();
            this.isLoading = false;
            alert(`La formation "${path.formationTitle}" a été créée avec succès! Elle est maintenant en attente d'approbation par l'administrateur.`);
            // Recharger les données
            this.loadData();
          },
          error: (error) => {
            console.error('Erreur lors de l\'application de la recommandation:', error);
            this.isLoading = false;
            alert('Erreur lors de l\'application de la recommandation. Veuillez réessayer.');
          }
        });
      } else {
        // Pour les parcours normaux, juste mettre à jour le statut
        path.status = 'active';
        path.updatedAt = new Date();
        console.log('Parcours appliqué:', path.studentName, path.formationTitle);
        this.applyFilters();
        alert(`Le parcours "${path.formationTitle}" pour ${path.studentName} a été appliqué avec succès!`);
      }
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'active': 'Actif',
      'draft': 'Brouillon',
      'completed': 'Complété',
      'pending': 'En attente',
      'archived': 'Archivé'
    };
    return labels[status] || status;
  }

  generateRecommendations(): void {
    if (confirm('Voulez-vous générer des recommandations ML pour tous les étudiants ? Cela peut prendre quelques instants.')) {
      this.isLoading = true;
      this.trainerService.generateAllRecommendations().subscribe({
        next: (response) => {
          console.log('Recommandations générées:', response);
          this.isLoading = false;
          alert(`${response.count} recommandation(s) générée(s) avec succès!`);
          // Recharger les données
          this.loadData();
          this.loadAIRecommendations();
        },
        error: (error) => {
          console.error('Erreur lors de la génération des recommandations:', error);
          this.isLoading = false;
          alert('Erreur lors de la génération des recommandations. Veuillez réessayer.');
        }
      });
    }
  }
}



