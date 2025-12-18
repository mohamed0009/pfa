import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../services/trainer.service';
import { TrainerProfile } from '../../models/trainer.interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: TrainerProfile | null = null;

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.trainerService.getTrainerProfile().subscribe(profile => {
      this.profile = profile;
    });
  }

  saveProfile(): void {
    if (this.profile) {
      this.trainerService.updateTrainerProfile(this.profile).subscribe(() => {
        alert('Profil mis à jour avec succès');
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'active': 'Actif',
      'pending': 'En attente',
      'validated': 'Validé',
      'suspended': 'Suspendu'
    };
    return labels[status] || status;
  }
}



