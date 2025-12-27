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
  editedProfile: Partial<TrainerProfile> = {};
  isEditing: boolean = false;
  isSaving: boolean = false;
  selectedFile: File | null = null;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.trainerService.getTrainerProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.editedProfile = { ...profile };
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Erreur lors du chargement du profil';
      }
    });
  }

  startEditing(): void {
    this.isEditing = true;
    this.editedProfile = { ...this.profile! };
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editedProfile = { ...this.profile! };
    this.selectedFile = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Prévisualiser l'image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editedProfile.avatarUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveProfile(): void {
    if (!this.profile) return;
    
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const updates: Partial<TrainerProfile> = {
      firstName: this.editedProfile.firstName,
      lastName: this.editedProfile.lastName,
      phone: this.editedProfile.phone,
      bio: this.editedProfile.bio,
      avatarUrl: this.editedProfile.avatarUrl,
      specializations: this.editedProfile.specializations
    };

    this.trainerService.updateTrainerProfile(updates).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.isEditing = false;
        this.isSaving = false;
        this.selectedFile = null;
        this.successMessage = 'Profil mis à jour avec succès !';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isSaving = false;
        this.errorMessage = 'Erreur lors de la mise à jour du profil. Veuillez réessayer.';
      }
    });
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

  addSpecialization(spec: string): void {
    if (spec && spec.trim() && this.editedProfile.specializations) {
      if (!this.editedProfile.specializations.includes(spec.trim())) {
        this.editedProfile.specializations = [...this.editedProfile.specializations, spec.trim()];
      }
    }
  }

  removeSpecialization(spec: string): void {
    if (this.editedProfile.specializations) {
      this.editedProfile.specializations = this.editedProfile.specializations.filter(s => s !== spec);
    }
  }
}
