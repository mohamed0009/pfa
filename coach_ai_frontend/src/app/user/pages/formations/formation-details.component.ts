import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormationsService } from '../../services/formations.service';
import { CoursesService } from '../../services/courses.service';
import { Formation } from '../../models/formation.interfaces';

@Component({
  selector: 'app-formation-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './formation-details.component.html',
  styleUrl: './formation-details.component.scss'
})
export class FormationDetailsComponent implements OnInit {
  formation: Formation | null = null;
  isLoading: boolean = true;
  isEnrolled: boolean = false;
  expandedModuleIndex: number | null = 0; // Premier module ouvert par défaut

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationsService: FormationsService,
    private coursesService: CoursesService
  ) {}

  ngOnInit(): void {
    const formationId = this.route.snapshot.paramMap.get('id');
    if (formationId) {
      this.loadFormation(formationId);
    }
  }

  loadFormation(id: string): void {
    this.isLoading = true;
    this.formationsService.getFormationById(id).subscribe({
      next: (formation: Formation) => {
        this.formation = formation;
        this.isLoading = false;
        console.log('Formation loaded:', formation);
        
        // Vérifier si inscrit
        this.checkEnrollment();
      },
      error: (error: any) => {
        console.error('Error loading formation:', error);
        this.isLoading = false;
      }
    });
  }

  checkEnrollment(): void {
    if (!this.formation) return;
    
    this.formationsService.isEnrolledInFormation(this.formation.id).subscribe({
      next: (enrolled: boolean) => {
        this.isEnrolled = enrolled;
        // Si inscrit, ouvrir automatiquement le premier module
        if (enrolled && this.formation && this.formation.modules && this.formation.modules.length > 0) {
          this.expandedModuleIndex = 0;
        }
      }
    });
  }

  enrollInFormation(): void {
    if (!this.formation) return;

    // Si déjà inscrit, permettre l'accès directement aux modules
    if (this.isEnrolled) {
      this.startFirstModule();
      return;
    }

    this.formationsService.enrollInFormation(this.formation.id).subscribe({
      next: (enrollment) => {
        console.log('Enrolled successfully:', enrollment);
        this.isEnrolled = true;
        // Recharger la formation pour mettre à jour le statut
        this.loadFormation(this.formation!.id);
        // Commencer le premier module
        setTimeout(() => {
          this.startFirstModule();
        }, 500);
      },
      error: (error) => {
        console.error('Error enrolling in formation:', error);
        
        // Extraire le message d'erreur
        let errorMessage = 'Erreur lors de l\'inscription à la formation';
        if (error?.error) {
          if (error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Si déjà inscrit ou si l'enrollment existe déjà, permettre l'accès
        if (errorMessage.toLowerCase().includes('déjà inscrit') || 
            errorMessage.toLowerCase().includes('already enrolled') ||
            errorMessage.toLowerCase().includes('déjà')) {
          this.isEnrolled = true;
          this.loadFormation(this.formation!.id);
          this.startFirstModule();
        } else if (error?.status === 200 && error?.error) {
          // Parfois l'API retourne 200 avec l'enrollment existant
          this.isEnrolled = true;
          this.loadFormation(this.formation!.id);
          this.startFirstModule();
        } else {
          // Afficher l'erreur à l'utilisateur
          alert(errorMessage);
        }
      }
    });
  }

  /**
   * Commence le premier module de la formation
   */
  startFirstModule(): void {
    if (!this.formation) return;
    
    // Si pas de modules, afficher un message
    if (!this.formation.modules || this.formation.modules.length === 0) {
      alert('Cette formation n\'a pas encore de modules disponibles.');
      return;
    }
    
    // Ouvrir le premier module
    this.expandedModuleIndex = 0;
    
    // Scroller vers les modules
    setTimeout(() => {
      const modulesSection = document.querySelector('.modules-section');
      if (modulesSection) {
        modulesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
    
    // Dans la nouvelle architecture, les modules contiennent directement le contenu
    // Pas besoin de vérifier les courses
  }

  toggleModule(index: number): void {
    this.expandedModuleIndex = this.expandedModuleIndex === index ? null : index;
  }

  isModuleExpanded(index: number): boolean {
    return this.expandedModuleIndex === index;
  }

  goToModule(moduleId: string): void {
    if (this.isEnrolled) {
      this.router.navigate(['/user/formations', this.formation?.id, 'modules', moduleId]);
    } else {
      alert('Veuillez vous inscrire à la formation pour accéder aux modules');
    }
  }

  continueFormation(): void {
    if (!this.formation) return;
    
    // Si pas de modules, rediriger vers les formations en cours
    if (!this.formation.modules || this.formation.modules.length === 0) {
      this.router.navigate(['/user/my-formations']);
      return;
    }
    
    // Dans la nouvelle architecture, rediriger vers le premier module
    const firstModule = this.formation.modules[0];
    if (firstModule && !firstModule.isLocked) {
      this.router.navigate(['/user/formations', this.formation.id, 'modules', firstModule.id]);
    } else {
      this.router.navigate(['/user/my-formations']);
    }
  }

  getLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'DEBUTANT': 'Débutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'AVANCE': 'Avancé'
    };
    return labels[level] || level;
  }

  getTrainerFullName(): string {
    if (!this.formation?.trainer) return '';
    return `${this.formation.trainer.firstName} ${this.formation.trainer.lastName}`;
  }

  getTotalLessons(): number {
    // Dans la nouvelle architecture, chaque module a 1 texte + 1 vidéo + 1 lab + 1 quiz = 4 éléments
    if (!this.formation?.modules) return 0;
    return this.formation.modules.length * 4;
  }
}

