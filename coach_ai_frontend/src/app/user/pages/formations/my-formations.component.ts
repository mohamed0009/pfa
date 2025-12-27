import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormationsService } from '../../services/formations.service';
import { FormationEnrollment, FormationProgress, Formation } from '../../models/formation.interfaces';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

type TabType = 'en_cours' | 'sauvegarde' | 'termine';

@Component({
  selector: 'app-my-formations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-formations.component.html',
  styleUrl: './my-formations.component.scss'
})
export class MyFormationsComponent implements OnInit, OnDestroy {
  enrollments: FormationEnrollment[] = [];
  availableFormations: Formation[] = [];
  isLoading = true;
  isLoadingProgress = false;
  activeTab: TabType = 'en_cours';
  expandedFormationId: string | null = null;
  errorMessage: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private formationsService: FormationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge toutes les données nécessaires
   */
  loadAllData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      enrollments: this.formationsService.getEnrolledFormations(),
      available: this.formationsService.getAvailableFormations()
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: ({ enrollments, available }) => {
        this.enrollments = enrollments;
        this.filterAvailableFormations(available);
        this.loadAllProgresses();
      },
      error: (error) => {
        console.error('Error loading formations:', error);
        this.errorMessage = 'Erreur lors du chargement des formations. Veuillez réessayer.';
      }
    });
  }

  /**
   * Filtre les formations disponibles (non inscrites)
   */
  private filterAvailableFormations(formations: Formation[]): void {
    const enrolledIds = new Set(this.enrollments.map(e => e.formationId));
    this.availableFormations = formations.filter(f => !enrolledIds.has(f.id));
  }

  /**
   * Charge la progression pour toutes les formations
   */
  private loadAllProgresses(): void {
    if (this.enrollments.length === 0) return;

    this.isLoadingProgress = true;
    const progressObservables = this.enrollments
      .filter(e => e.id)
      .map(enrollment => 
        this.formationsService.getFormationProgress(enrollment.id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => {
              // Mettre à jour la progression dans l'enrollment
              const index = this.enrollments.findIndex(e => e.formationId === enrollment.formationId);
              if (index !== -1) {
                this.formationsService.getFormationProgress(enrollment.id)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (progress) => {
                      this.enrollments[index].progress = progress;
                    },
                    error: () => {
                      // Ignorer les erreurs silencieusement pour ne pas bloquer l'affichage
                    }
                  });
              }
            })
          )
      );

    if (progressObservables.length > 0) {
      forkJoin(progressObservables)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoadingProgress = false)
        )
        .subscribe({
          next: (progresses) => {
            // Les progressions sont mises à jour dans le finalize
          },
          error: () => {
            this.isLoadingProgress = false;
          }
        });
    } else {
      this.isLoadingProgress = false;
    }
  }

  /**
   * Continue une formation (redirection)
   */
  continueFormation(formationId: string): void {
    this.router.navigate(['/user/formations', formationId]);
  }

  /**
   * Calcule le pourcentage de progression
   */
  getProgressPercentage(enrollment: FormationEnrollment): number {
    if (!enrollment.progress) return 0;
    return Math.round(enrollment.progress.overallProgress || 0);
  }

  /**
   * Obtient le badge de statut
   */
  getStatusBadge(enrollment: FormationEnrollment): string {
    const progress = this.getProgressPercentage(enrollment);
    if (progress === 100) return 'Terminé';
    if (progress > 0) return 'En cours';
    return 'Non commencé';
  }

  /**
   * Obtient la couleur du statut
   */
  getStatusColor(enrollment: FormationEnrollment): string {
    const progress = this.getProgressPercentage(enrollment);
    if (progress === 100) return '#10b981';
    if (progress > 0) return '#3b82f6';
    return '#6b7280';
  }

  /**
   * Filtre les formations par onglet
   */
  getFormationsByTab(): FormationEnrollment[] {
    switch (this.activeTab) {
      case 'en_cours':
        return this.enrollments.filter(e => {
          const progress = this.getProgressPercentage(e);
          return progress > 0 && progress < 100;
        });
      case 'termine':
        return this.enrollments.filter(e => {
          const progress = this.getProgressPercentage(e);
          return progress === 100;
        });
      case 'sauvegarde':
        return this.enrollments.filter(e => {
          const progress = this.getProgressPercentage(e);
          return progress === 0;
        });
      default:
        return this.enrollments;
    }
  }

  /**
   * Change l'onglet actif
   */
  setActiveTab(tab: TabType): void {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.expandedFormationId = null;
    }
  }

  /**
   * Inscription à une formation disponible
   */
  enrollInAvailableFormation(formationId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.formationsService.enrollInFormation(formationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enrollment) => {
          // Rediriger vers la page de la formation pour commencer les modules
          this.router.navigate(['/user/formations', formationId]);
        },
        error: (error) => {
          console.error('Error enrolling in formation:', error);
          this.isLoading = false;
          this.errorMessage = error?.error?.message || error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
        }
      });
  }

  /**
   * Obtient le nom complet du formateur
   */
  getTrainerName(formation: Formation): string {
    if (!formation.trainer) return 'Coach IA';
    const firstName = formation.trainer.firstName || '';
    const lastName = formation.trainer.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Coach IA';
  }

  /**
   * Vérifie si une formation est en cours
   */
  isFormationInProgress(enrollment: FormationEnrollment): boolean {
    const progress = this.getProgressPercentage(enrollment);
    return progress > 0 && progress < 100;
  }

  /**
   * Vérifie si une formation est terminée
   */
  isFormationCompleted(enrollment: FormationEnrollment): boolean {
    return this.getProgressPercentage(enrollment) === 100;
  }

  /**
   * Obtient le nombre de formations par onglet
   */
  getTabCount(tab: TabType): number {
    switch (tab) {
      case 'en_cours':
        return this.enrollments.filter(e => this.isFormationInProgress(e)).length;
      case 'termine':
        return this.enrollments.filter(e => this.isFormationCompleted(e)).length;
      case 'sauvegarde':
        return this.enrollments.filter(e => this.getProgressPercentage(e) === 0).length + this.availableFormations.length;
      default:
        return 0;
    }
  }
}
