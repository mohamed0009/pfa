import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../../services/trainer.service';
import { FormationTemplateService } from '../../../services/formation-template.service';
import { TrainerFormation } from '../../../models/trainer.interfaces';

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './formations.component.html',
  styleUrls: ['./formations.component.scss']
})
export class FormationsComponent implements OnInit {
  formations: TrainerFormation[] = [];
  filteredFormations: TrainerFormation[] = [];
  isLoading = true;
  searchTerm = '';
  selectedStatus = 'all';
  
  // Modal de création
  showCreateModal = false;
  isCreating = false;
  newFormation = {
    title: '',
    description: '',
    level: 'DEBUTANT' as 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE',
    category: '',
    duration: 0,
    thumbnail: ''
  };

  // Modal d'édition
  showEditModal = false;
  isUpdating = false;
  editingFormation: TrainerFormation | null = null;
  editFormation = {
    title: '',
    description: '',
    level: 'DEBUTANT' as 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE',
    category: '',
    duration: 0,
    thumbnail: ''
  };

  // Modal de création depuis template
  showTemplateModal = false;
  isCreatingFromTemplate = false;
  selectedTemplate: 'javascript' | null = null;

  constructor(
    private trainerService: TrainerService,
    private formationTemplateService: FormationTemplateService
  ) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  private loadFormations(): void {
    this.isLoading = true;
    this.trainerService.getFormations().subscribe({
      next: (formations) => {
        this.formations = formations;
        this.filteredFormations = formations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading formations:', error);
        this.formations = [];
        this.filteredFormations = [];
        this.isLoading = false;
      }
    });
  }

  filterFormations(): void {
    this.filteredFormations = this.formations.filter(formation => {
      const matchesSearch = formation.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (formation.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || formation.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  getStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      'draft': 'Brouillon',
      'pending': 'En attente',
      'approved': 'Approuvé',
      'published': 'Publié',
      'rejected': 'Rejeté',
      'archived': 'Archivé'
    };
    return badges[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'draft': '#6b7280',
      'pending': '#f59e0b',
      'approved': '#10b981',
      'published': '#3b82f6',
      'rejected': '#ef4444',
      'archived': '#9ca3af'
    };
    return colors[status] || '#6b7280';
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newFormation = {
      title: '',
      description: '',
      level: 'DEBUTANT',
      category: '',
      duration: 0,
      thumbnail: ''
    };
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newFormation = {
      title: '',
      description: '',
      level: 'DEBUTANT',
      category: '',
      duration: 0,
      thumbnail: ''
    };
  }

  createFormation(): void {
    if (!this.newFormation.title.trim()) {
      alert('Le titre est requis');
      return;
    }

    this.isCreating = true;
    const formationData: any = {
      title: this.newFormation.title,
      description: this.newFormation.description,
      level: this.newFormation.level,
      category: this.newFormation.category,
      duration: this.newFormation.duration,
      thumbnail: this.newFormation.thumbnail
    };

    this.trainerService.createFormation(formationData).subscribe({
      next: (formation) => {
        this.formations.unshift(formation);
        this.filteredFormations = [...this.formations];
        this.closeCreateModal();
        this.isCreating = false;
      },
      error: (error) => {
        console.error('Error creating formation:', error);
        alert('Erreur lors de la création de la formation');
        this.isCreating = false;
      }
    });
  }

  openEditModal(formation: TrainerFormation, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.editingFormation = formation;
    this.editFormation = {
      title: formation.title,
      description: formation.description || '',
      level: (formation.level as any) || 'DEBUTANT',
      category: formation.category || '',
      duration: formation.duration || 0,
      thumbnail: formation.thumbnail || ''
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingFormation = null;
    this.editFormation = {
      title: '',
      description: '',
      level: 'DEBUTANT',
      category: '',
      duration: 0,
      thumbnail: ''
    };
  }

  updateFormation(): void {
    if (!this.editFormation.title.trim() || !this.editingFormation) {
      alert('Le titre est requis');
      return;
    }

    this.isUpdating = true;
    const formationData: any = {
      title: this.editFormation.title,
      description: this.editFormation.description,
      level: this.editFormation.level,
      category: this.editFormation.category,
      duration: this.editFormation.duration,
      thumbnail: this.editFormation.thumbnail
    };

    this.trainerService.updateFormation(this.editingFormation.id, formationData).subscribe({
      next: (updatedFormation) => {
        const index = this.formations.findIndex(f => f.id === updatedFormation.id);
        if (index !== -1) {
          this.formations[index] = updatedFormation;
          this.filteredFormations = [...this.formations];
        }
        this.closeEditModal();
        this.isUpdating = false;
      },
      error: (error) => {
        console.error('Error updating formation:', error);
        alert('Erreur lors de la modification de la formation');
        this.isUpdating = false;
      }
    });
  }

  deleteFormation(formation: TrainerFormation, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer la formation "${formation.title}" ?\n\nCette action est irréversible et supprimera également tous les modules associés.`)) {
      return;
    }

    this.trainerService.deleteFormation(formation.id).subscribe({
      next: () => {
        this.formations = this.formations.filter(f => f.id !== formation.id);
        this.filteredFormations = this.filteredFormations.filter(f => f.id !== formation.id);
      },
      error: (error) => {
        console.error('Error deleting formation:', error);
        alert('Erreur lors de la suppression de la formation');
      }
    });
  }

  // ==================== CRÉATION DEPUIS TEMPLATE ====================

  openTemplateModal(): void {
    this.showTemplateModal = true;
    this.selectedTemplate = null;
  }

  closeTemplateModal(): void {
    this.showTemplateModal = false;
    this.selectedTemplate = null;
  }

  createFormationFromTemplate(templateType: 'javascript'): void {
    if (!templateType) {
      alert('Veuillez sélectionner un template');
      return;
    }

    this.isCreatingFromTemplate = true;
    this.selectedTemplate = templateType;

    // Récupérer le template
    const template = this.formationTemplateService.getJavaScriptFormationTemplate();

    // Créer la formation complète
    this.formationTemplateService.createFormationFromTemplate(template).subscribe({
      next: (formation) => {
        const totalCourses = template.modules.reduce((sum, m) => sum + m.courses.length, 0);
        const totalLessons = template.modules.reduce((sum, m) => sum + m.courses.reduce((s, c) => s + c.lessons.length, 0), 0);
        const totalQuizzes = template.modules.filter(m => m.quiz).length;
        
        alert(`Formation "${formation.title}" créée avec succès !\n\n` +
              `✓ ${template.modules.length} modules\n` +
              `✓ ${totalCourses} cours\n` +
              `✓ ${totalLessons} leçons\n` +
              `✓ ${totalQuizzes} quiz`);
        this.loadFormations();
        this.closeTemplateModal();
        this.isCreatingFromTemplate = false;
      },
      error: (error: any) => {
        console.error('Error creating formation from template:', error);
        alert('Erreur lors de la création de la formation depuis le template');
        this.isCreatingFromTemplate = false;
      }
    });
  }
}
