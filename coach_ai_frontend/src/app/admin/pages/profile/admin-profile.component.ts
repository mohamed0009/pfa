import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  role: string;
  status: string;
  createdAt: Date;
  lastActive: Date;
}

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss']
})
export class AdminProfileComponent implements OnInit {
  profile: AdminProfile | null = null;
  editedProfile: Partial<AdminProfile> = {};
  isEditing: boolean = false;
  isSaving: boolean = false;
  selectedFile: File | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  private apiUrl = 'http://localhost:8081/api/admin/profile';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (user: any) => {
        this.profile = {
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          avatarUrl: user.avatarUrl || '',
          phone: user.phone || '',
          bio: user.bio || '',
          role: user.role || 'ADMIN',
          status: user.status || 'ACTIVE',
          createdAt: user.joinedAt ? new Date(user.joinedAt) : new Date(),
          lastActive: user.lastActive ? new Date(user.lastActive) : new Date()
        };
        this.editedProfile = { ...this.profile };
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        // Fallback to current user from auth service
        this.authService.currentUser.subscribe((user: any) => {
          if (user) {
            this.profile = {
              id: user.id || '',
              email: user.email || '',
              firstName: user.fullName?.split(' ')[0] || '',
              lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
              avatarUrl: user.avatarUrl || '',
              role: 'ADMIN',
              status: 'ACTIVE',
              createdAt: new Date(),
              lastActive: new Date()
            };
            this.editedProfile = { ...this.profile };
          }
        });
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

    const updates: any = {
      firstName: this.editedProfile.firstName,
      lastName: this.editedProfile.lastName,
      phone: this.editedProfile.phone,
      bio: this.editedProfile.bio,
      avatarUrl: this.editedProfile.avatarUrl
    };

    this.http.put<any>(this.apiUrl, updates).subscribe({
      next: (updatedProfile) => {
        this.profile = {
          ...this.profile!,
          ...updatedProfile,
          createdAt: this.profile!.createdAt,
          lastActive: new Date()
        };
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
      'ACTIVE': 'Actif',
      'INACTIVE': 'Inactif',
      'PENDING': 'En attente',
      'SUSPENDED': 'Suspendu'
    };
    return labels[status] || status;
  }
}

