import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentManagementService } from '../../../services/content-management.service';
import { Formation, Module, Course, ContentValidation, ContentStatus } from '../../../models/admin.interfaces';

@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-management.component.html',
  styleUrl: './content-management.component.scss'
})
export class ContentManagementComponent implements OnInit {
  formations: Formation[] = [];
  pendingValidations: ContentValidation[] = [];
  
  // Current view
  selectedFormation: Formation | null = null;
  selectedModule: Module | null = null;
  modules: Module[] = [];
  courses: Course[] = [];
  
  // Stats
  contentStats = {
    totalFormations: 0,
    activeFormations: 0,
    pendingFormations: 0,
    totalCourses: 0,
    approvedCourses: 0,
    pendingCourses: 0
  };

  // Filters
  viewMode: 'list' | 'hierarchy' = 'hierarchy';
  statusFilter: ContentStatus | 'all' = 'all';
  
  // Modals
  showFormationModal = false;
  showModuleModal = false;
  showCourseModal = false;
  showValidationModal = false;
  selectedValidation: ContentValidation | null = null;
  validationFeedback = '';

  constructor(private contentService: ContentManagementService) {}

  ngOnInit(): void {
    this.loadFormations();
    this.loadStats();
    this.loadPendingValidations();
  }

  loadFormations(): void {
    this.contentService.getFormations().subscribe(formations => {
      this.formations = formations;
    });
  }

  loadStats(): void {
    this.contentService.getContentStats().subscribe(stats => {
      this.contentStats = stats;
    });
  }

  loadPendingValidations(): void {
    this.contentService.getPendingValidations().subscribe(validations => {
      this.pendingValidations = validations;
    });
  }

  // Hierarchy navigation
  selectFormation(formation: Formation): void {
    this.selectedFormation = formation;
    this.selectedModule = null;
    this.loadModules(formation.id);
  }

  selectModule(module: Module): void {
    this.selectedModule = module;
    this.loadCourses(module.id);
  }

  backToFormations(): void {
    this.selectedFormation = null;
    this.selectedModule = null;
    this.modules = [];
    this.courses = [];
  }

  backToModules(): void {
    this.selectedModule = null;
    this.courses = [];
  }

  loadModules(formationId: string): void {
    this.contentService.getModulesByFormation(formationId).subscribe(modules => {
      this.modules = modules;
    });
  }

  loadCourses(moduleId: string): void {
    this.contentService.getCoursesByModule(moduleId).subscribe(courses => {
      this.courses = courses;
    });
  }

  // Validation workflow
  openValidation(validation: ContentValidation): void {
    this.selectedValidation = validation;
    this.showValidationModal = true;
  }

  approveContent(): void {
    if (!this.selectedValidation) return;

    this.contentService.validateContent(
      this.selectedValidation.id,
      true,
      this.validationFeedback
    ).subscribe(() => {
      this.loadPendingValidations();
      this.loadFormations();
      this.loadStats();
      this.closeValidationModal();
    });
  }

  rejectContent(): void {
    if (!this.selectedValidation || !this.validationFeedback) {
      alert('Veuillez fournir un feedback pour le rejet');
      return;
    }

    this.contentService.validateContent(
      this.selectedValidation.id,
      false,
      this.validationFeedback
    ).subscribe(() => {
      this.loadPendingValidations();
      this.loadFormations();
      this.loadStats();
      this.closeValidationModal();
    });
  }

  closeValidationModal(): void {
    this.showValidationModal = false;
    this.selectedValidation = null;
    this.validationFeedback = '';
  }

  // CRUD modals
  openCreateFormationModal(): void {
    this.showFormationModal = true;
  }

  closeFormationModal(): void {
    this.showFormationModal = false;
  }

  openCreateModuleModal(): void {
    if (!this.selectedFormation) {
      alert('Veuillez sélectionner une formation d\'abord');
      return;
    }
    this.showModuleModal = true;
  }

  closeModuleModal(): void {
    this.showModuleModal = false;
  }

  openCreateCourseModal(): void {
    if (!this.selectedModule) {
      alert('Veuillez sélectionner un module d\'abord');
      return;
    }
    this.showCourseModal = true;
  }

  closeCourseModal(): void {
    this.showCourseModal = false;
  }

  // Helpers
  getStatusBadgeClass(status: ContentStatus): string {
    switch (status) {
      case 'approved': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'rejected': return 'badge-danger';
      case 'draft': return 'badge-secondary';
      case 'archived': return 'badge-muted';
      default: return '';
    }
  }

  getStatusLabel(status: ContentStatus): string {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      case 'draft': return 'Brouillon';
      case 'archived': return 'Archivé';
      default: return status;
    }
  }

  getContentName(validation: ContentValidation): string {
    if (validation.contentType === 'formation') {
      const formation = this.formations.find(f => f.id === validation.contentId);
      return formation?.title || 'Formation';
    } else if (validation.contentType === 'cours') {
      return 'Cours'; // Would need to look up in courses array
    }
    return 'Contenu';
  }
}




