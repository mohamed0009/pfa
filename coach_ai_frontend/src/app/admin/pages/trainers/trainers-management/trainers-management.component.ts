import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrainersService } from '../../../services/trainers.service';
import { ContentManagementService } from '../../../services/content-management.service';
import { Trainer, TrainerMetrics, Formation } from '../../../models/admin.interfaces';

@Component({
  selector: 'app-trainers-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trainers-management.component.html',
  styleUrl: './trainers-management.component.scss'
})
export class TrainersManagementComponent implements OnInit, OnDestroy {
  trainers: Trainer[] = [];
  formations: Formation[] = [];
  
  // Stats
  trainerStats = {
    total: 0,
    active: 0,
    pending: 0,
    online: 0,
    totalStudents: 0,
    pendingFormations: 0,
    averageRating: 0
  };
  
  // Auto-refresh pour le statut en ligne
  private refreshInterval: any;

  // Filter
  statusFilter: 'all' | 'pending' | 'active' | 'suspended' = 'all';

  // Modals
  showValidationModal = false;
  showMetricsModal = false;
  showAssignModal = false;
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedTrainer: Trainer | null = null;
  selectedMetrics: TrainerMetrics | null = null;
  selectedFormationIds: string[] = [];
  
  // Form data for create/edit
  trainerForm: Partial<Trainer> = {
    fullName: '',
    email: '',
    bio: '',
    specializations: [],
    avatarUrl: ''
  };
  newSpecialization = '';

  constructor(
    private trainersService: TrainersService,
    private contentService: ContentManagementService
  ) {}

  ngOnInit(): void {
    this.loadTrainers();
    this.loadFormations();
    this.loadStatistics();
    
    // Rafraîchir automatiquement toutes les 30 secondes pour le statut en ligne
    this.refreshInterval = setInterval(() => {
      this.loadTrainers();
      this.loadStatistics();
    }, 30000); // 30 secondes
  }
  
  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadTrainers(): void {
    const status = this.statusFilter === 'all' ? undefined : this.statusFilter;
    this.trainersService.getTrainers(status).subscribe(trainers => {
      this.trainers = trainers;
    });
  }

  loadFormations(): void {
    this.contentService.getFormations().subscribe(formations => {
      this.formations = formations.filter(f => f.status === 'approved');
    });
  }

  loadStatistics(): void {
    this.trainersService.getTrainerStatistics().subscribe(stats => {
      this.trainerStats = stats;
    });
  }

  // Validation
  openValidationModal(trainer: Trainer): void {
    this.selectedTrainer = trainer;
    this.showValidationModal = true;
  }

  validateTrainer(): void {
    if (!this.selectedTrainer) return;

    this.trainersService.validateTrainer(this.selectedTrainer.id).subscribe(() => {
      this.loadTrainers();
      this.loadStatistics();
      this.showValidationModal = false;
      this.selectedTrainer = null;
    });
  }

  suspendTrainer(trainer: Trainer): void {
    if (confirm(`Voulez-vous vraiment suspendre ${trainer.fullName}?`)) {
      this.trainersService.suspendTrainer(trainer.id).subscribe(() => {
        this.loadTrainers();
        this.loadStatistics();
      });
    }
  }

  // Metrics
  viewMetrics(trainer: Trainer): void {
    this.selectedTrainer = trainer;
    this.trainersService.getTrainerMetrics(trainer.id).subscribe(metrics => {
      this.selectedMetrics = metrics || null;
      this.showMetricsModal = true;
    });
  }

  // Assignment
  openAssignModal(trainer: Trainer): void {
    this.selectedTrainer = trainer;
    this.selectedFormationIds = [...trainer.formationsAssigned];
    this.showAssignModal = true;
  }

  toggleFormationAssignment(formationId: string): void {
    const index = this.selectedFormationIds.indexOf(formationId);
    if (index > -1) {
      this.selectedFormationIds.splice(index, 1);
    } else {
      this.selectedFormationIds.push(formationId);
    }
  }

  saveAssignments(): void {
    if (!this.selectedTrainer) return;

    const currentAssignments = this.selectedTrainer.formationsAssigned;
    const toAdd = this.selectedFormationIds.filter(id => !currentAssignments.includes(id));
    const toRemove = currentAssignments.filter(id => !this.selectedFormationIds.includes(id));

    // Add new assignments
    toAdd.forEach(formationId => {
      this.trainersService.assignFormation(this.selectedTrainer!.id, formationId).subscribe();
    });

    // Remove old assignments
    toRemove.forEach(formationId => {
      this.trainersService.unassignFormation(this.selectedTrainer!.id, formationId).subscribe();
    });

    this.showAssignModal = false;
    this.selectedTrainer = null;
    this.loadTrainers();
  }

  // Helpers
  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'suspended': return '#dc2626';
      default: return '#6b7280';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'validated': return 'Validé';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  }

  getFormationName(formationId: string): string {
    return this.formations.find(f => f.id === formationId)?.title || formationId;
  }

  // CRUD Operations
  openCreateModal(): void {
    this.trainerForm = {
      fullName: '',
      email: '',
      bio: '',
      specializations: [],
      avatarUrl: 'https://i.pravatar.cc/150?img=' + (this.trainers.length + 10)
    };
    this.showCreateModal = true;
  }

  openEditModal(trainer: Trainer): void {
    this.selectedTrainer = trainer;
    this.trainerForm = {
      fullName: trainer.fullName,
      email: trainer.email,
      bio: trainer.bio,
      specializations: [...trainer.specializations],
      avatarUrl: trainer.avatarUrl
    };
    this.showEditModal = true;
  }

  openDeleteModal(trainer: Trainer): void {
    this.selectedTrainer = trainer;
    this.showDeleteModal = true;
  }

  createTrainer(): void {
    if (!this.trainerForm.fullName || !this.trainerForm.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.trainersService.createTrainer(this.trainerForm).subscribe(() => {
      this.loadTrainers();
      this.loadStatistics();
      this.showCreateModal = false;
      this.trainerForm = {};
    });
  }

  saveTrainerEdit(): void {
    if (!this.selectedTrainer || !this.trainerForm.fullName || !this.trainerForm.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.trainersService.updateTrainer(this.selectedTrainer.id, this.trainerForm).subscribe(() => {
      this.loadTrainers();
      this.showEditModal = false;
      this.selectedTrainer = null;
      this.trainerForm = {};
    });
  }

  deleteTrainer(): void {
    if (!this.selectedTrainer) return;

    this.trainersService.deleteTrainer(this.selectedTrainer.id).subscribe(() => {
      this.loadTrainers();
      this.loadStatistics();
      this.showDeleteModal = false;
      this.selectedTrainer = null;
    });
  }

  addSpecialization(): void {
    if (this.newSpecialization && this.trainerForm.specializations) {
      this.trainerForm.specializations.push(this.newSpecialization);
      this.newSpecialization = '';
    }
  }

  removeSpecialization(index: number): void {
    if (this.trainerForm.specializations) {
      this.trainerForm.specializations.splice(index, 1);
    }
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.showValidationModal = false;
    this.showMetricsModal = false;
    this.showAssignModal = false;
    this.selectedTrainer = null;
    this.trainerForm = {};
  }
}




