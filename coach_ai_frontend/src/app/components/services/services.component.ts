import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicFormationsService, PublicFormation } from '../../services/public-formations.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  formations: PublicFormation[] = [];
  isLoading = true;

  constructor(
    private publicFormationsService: PublicFormationsService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.isLoading = true;
    this.publicFormationsService.getPublicFormations().subscribe({
      next: (formations) => {
        this.formations = formations;
        this.isLoading = false;
      },
      error: (error) => {
        this.logger.error('Error loading formations', error);
        this.isLoading = false;
      }
    });
  }

  getFormationFeatures(formation: PublicFormation): string[] {
    return [
      `${formation.modulesCount || 0} modules`,
      `${formation.quizzesCount || 0} quiz`,
      'Certification incluse'
    ];
  }

  getFormationImage(formation: PublicFormation): string {
    return formation.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop';
  }

  getFormationDuration(formation: PublicFormation): string {
    if (formation.duration > 0) {
      return `${formation.duration} heures`;
    }
    return 'À votre rythme';
  }
}





