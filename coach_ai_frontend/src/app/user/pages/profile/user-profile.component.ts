import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserProfileService } from '../../services/user-profile.service';
import { CertificatesService, Certificate } from '../../services/certificates.service';
import { UserProfile } from '../../models/user.interfaces';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profile-page">
      <h1>Mon Profil</h1>
      
      <div class="profile-card" *ngIf="profile">
        <!-- Mode Affichage -->
        <div *ngIf="!isEditing" class="profile-view">
          <div class="profile-header">
            <div class="avatar-container">
              <img [src]="profile.avatarUrl" [alt]="profile.firstName" class="profile-avatar">
              <button class="edit-avatar-btn" (click)="triggerFileInput()" title="Modifier la photo">
                <span class="material-icons">camera_alt</span>
              </button>
              <input 
                type="file" 
                #fileInput 
                accept="image/*" 
                (change)="onFileSelected($event)"
                style="display: none;">
            </div>
            <div>
              <h2>{{ profile.firstName }} {{ profile.lastName }}</h2>
              <p>{{ profile.email }}</p>
            </div>
          </div>
          
          <div class="profile-info">
            <div class="info-item">
              <label>Formation</label>
              <p>{{ profile.formation }}</p>
            </div>
            <div class="info-item">
              <label>Niveau</label>
              <p>{{ profile.niveau }}</p>
            </div>
            <div class="info-item">
              <label>Rythme d'apprentissage</label>
              <p>{{ profile.preferences?.learningPace || 'Non défini' }}</p>
            </div>
            <div class="info-item">
              <label>Objectif hebdomadaire</label>
              <p>{{ profile.preferences?.weeklyGoalHours || 0 }} heures</p>
            </div>
          </div>
          
          <div class="profile-actions">
            <button class="btn btn-secondary" (click)="showPasswordModal = true">
              <span class="material-icons">lock</span>
              Changer le mot de passe
            </button>
            <button class="btn btn-primary" (click)="startEditing()">
              <span class="material-icons">edit</span>
              Modifier le profil
            </button>
          </div>
        </div>

        <!-- Mode Édition -->
        <div *ngIf="isEditing" class="profile-edit">
          <form (ngSubmit)="saveProfile()" #profileForm="ngForm">
            <div class="form-group">
              <label>Photo de profil</label>
              <div class="avatar-edit-container">
                <img [src]="editedProfile.avatarUrl || profile.avatarUrl" [alt]="editedProfile.firstName" class="profile-avatar-edit">
                <div class="avatar-actions">
                  <button type="button" class="btn btn-secondary" (click)="triggerFileInput()">
                    <span class="material-icons">photo_camera</span>
                    Changer la photo
                  </button>
                  <input 
                    type="file" 
                    #fileInput 
                    accept="image/*" 
                    (change)="onFileSelected($event)"
                    style="display: none;">
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="firstName">Prénom *</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName"
                  [(ngModel)]="editedProfile.firstName" 
                  required>
              </div>
              
              <div class="form-group">
                <label for="lastName">Nom *</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName"
                  [(ngModel)]="editedProfile.lastName" 
                  required>
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                [(ngModel)]="editedProfile.email" 
                disabled>
              <small class="form-hint">L'email ne peut pas être modifié</small>
            </div>

            <div class="form-group">
              <label for="formation">Formation</label>
              <input 
                type="text" 
                id="formation" 
                name="formation"
                [(ngModel)]="editedProfile.formation">
            </div>

            <div class="form-group">
              <label for="niveau">Niveau</label>
              <select id="niveau" name="niveau" [(ngModel)]="editedProfile.niveau">
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
              </select>
            </div>

            <div class="form-group">
              <label for="learningPace">Rythme d'apprentissage</label>
              <select id="learningPace" name="learningPace" [(ngModel)]="editedProfile.preferences!.learningPace">
                <option value="Lent">Lent</option>
                <option value="Modéré">Modéré</option>
                <option value="Rapide">Rapide</option>
              </select>
            </div>

            <div class="form-group">
              <label for="weeklyGoalHours">Objectif hebdomadaire (heures)</label>
              <input 
                type="number" 
                id="weeklyGoalHours" 
                name="weeklyGoalHours"
                [(ngModel)]="editedProfile.preferences!.weeklyGoalHours" 
                min="1" 
                max="40">
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="cancelEditing()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="!profileForm.valid || isSaving">
                <span *ngIf="isSaving" class="spinner"></span>
                <span *ngIf="!isSaving">Enregistrer</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Message de succès/erreur -->
      <div class="alert alert-success" *ngIf="successMessage">
        {{ successMessage }}
      </div>
      <div class="alert alert-error" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>
      
      <!-- Password Change Modal -->
      <div class="modal-overlay" *ngIf="showPasswordModal" (click)="showPasswordModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Changer le mot de passe</h2>
            <button class="btn-close" (click)="showPasswordModal = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="changePassword()" #passwordForm="ngForm">
              <div class="form-group">
                <label>Mot de passe actuel *</label>
                <input 
                  type="password" 
                  [(ngModel)]="passwordData.currentPassword" 
                  name="currentPassword"
                  class="form-control"
                  required
                  placeholder="Entrez votre mot de passe actuel">
              </div>
              
              <div class="form-group">
                <label>Nouveau mot de passe *</label>
                <input 
                  type="password" 
                  [(ngModel)]="passwordData.newPassword" 
                  name="newPassword"
                  class="form-control"
                  required
                  minlength="6"
                  placeholder="Au moins 6 caractères">
              </div>
              
              <div class="form-group">
                <label>Confirmer le nouveau mot de passe *</label>
                <input 
                  type="password" 
                  [(ngModel)]="passwordData.confirmPassword" 
                  name="confirmPassword"
                  class="form-control"
                  required
                  placeholder="Répétez le nouveau mot de passe">
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="showPasswordModal = false">
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!passwordForm.valid || isSaving">
                  <span *ngIf="isSaving" class="spinner"></span>
                  <span *ngIf="!isSaving">Changer le mot de passe</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Contenu Accomplissements -->
      <div *ngIf="activeTab === 'accomplissements'" class="accomplishments-card">
        <h2>Mes Certificats</h2>
        <p class="subtitle">Formations complétées avec succès</p>

        <div *ngIf="isLoadingCertificates" class="loading-state">
          <div class="spinner"></div>
          <p>Chargement de vos certificats...</p>
        </div>

        <div *ngIf="!isLoadingCertificates && certificates.length > 0" class="certificates-list">
          <div *ngFor="let cert of certificates" class="certificate-card">
            <div class="certificate-icon">
              <span class="material-icons">verified</span>
            </div>
            <div class="certificate-info">
              <h3>{{ cert.formationTitle }}</h3>
              <p class="certificate-number">N° {{ cert.certificateNumber }}</p>
              <p class="certificate-date">Délivré le {{ cert.issuedAt | date:'longDate' }}</p>
            </div>
            <div class="certificate-actions">
              <button class="btn btn-secondary" (click)="downloadCertificate(cert)">
                <span class="material-icons">download</span>
                Télécharger PDF
              </button>
              <button class="btn btn-primary" (click)="shareCertificate(cert)">
                <span class="material-icons">share</span>
                Partager
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="!isLoadingCertificates && certificates.length === 0" class="empty-state">
          <span class="material-icons">emoji_events</span>
          <h3>Aucun certificat obtenu</h3>
          <p>Terminez vos formations pour obtenir vos premiers certificats !</p>
          <button class="btn btn-primary" [routerLink]="['/user/my-formations']">
            <span class="material-icons">school</span>
            Voir mes formations
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { 
      max-width: 900px; 
      margin: 0 auto; 
      padding: 24px;
    }
    
    h1 { 
      margin-bottom: 32px; 
      font-size: 2rem;
      font-weight: 700;
    }
    
    .profile-card { 
      background: white; 
      padding: 32px; 
      border-radius: 16px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.05); 
    }
    
    .profile-header { 
      display: flex; 
      gap: 24px; 
      align-items: center; 
      margin-bottom: 32px; 
      padding-bottom: 24px; 
      border-bottom: 1px solid #f3f4f6; 
    }
    
    .avatar-container {
      position: relative;
      display: inline-block;
    }
    
    .profile-avatar { 
      width: 120px; 
      height: 120px; 
      border-radius: 50%; 
      object-fit: cover;
      border: 4px solid #e5e7eb;
    }
    
    .edit-avatar-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #10b981;
      color: white;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .edit-avatar-btn:hover {
      background: #059669;
      transform: scale(1.1);
    }
    
    .profile-avatar-edit {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #e5e7eb;
    }
    
    .avatar-edit-container {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .avatar-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .profile-info { 
      display: grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap: 24px; 
      margin-bottom: 32px;
    }
    
    .info-item label { 
      font-weight: 600; 
      color: #374151; 
      display: block; 
      margin-bottom: 8px; 
    }
    
    .info-item p { 
      color: #6b7280; 
      font-size: 1rem;
    }
    
    h2 { 
      font-size: 1.75rem; 
      font-weight: 700; 
      margin-bottom: 4px;
    }
    
    .profile-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 24px;
      border-top: 1px solid #f3f4f6;
    }
    
    .form-group {
      margin-bottom: 24px;
    }
    
    .form-group label {
      display: block;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }
    
    .form-group input,
    .form-group select {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }
    
    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    .form-group input:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }
    
    .form-hint {
      display: block;
      margin-top: 4px;
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 24px;
      border-top: 1px solid #f3f4f6;
      margin-top: 32px;
    }
    
    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: #10b981;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    
    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }
    
    .btn-secondary:hover {
      background: #e5e7eb;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .alert {
      padding: 16px 20px;
      border-radius: 8px;
      margin-top: 24px;
      font-weight: 500;
    }
    
    .alert-success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #10b981;
    }
    
    .alert-error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #ef4444;
    }
    
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .profile-info {
        grid-template-columns: 1fr;
      }
      
      .profile-header {
        flex-direction: column;
        text-align: center;
      }
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      border-radius: 16px;
      padding: 0;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }
    
    .btn-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: background 0.3s ease;
    }
    
    .btn-close:hover {
      background: #f3f4f6;
    }
    
    .modal-body {
      padding: 24px;
    }
    
    .btn-link {
      background: none;
      border: none;
      color: #10b981;
      cursor: pointer;
      font-size: 0.875rem;
      text-decoration: underline;
      padding: 0;
    }
    
    .btn-link:hover {
      color: #059669;
    }
    
    .password-field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .form-text {
      display: block;
      margin-top: 4px;
      font-size: 0.875rem;
      color: #6b7280;
    }

    // Onglets
    .profile-tabs {
      display: flex;
      gap: 0;
      border-bottom: 2px solid #e0e0e0;
      margin-bottom: 32px;
      background: white;
      border-radius: 8px 8px 0 0;
      padding: 0 24px;

      .tab {
        padding: 16px 24px;
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        font-size: 1rem;
        font-weight: 600;
        color: #6b7280;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
        bottom: -2px;

        .material-icons {
          font-size: 20px;
        }

        &:hover {
          color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        &.active {
          color: #1f2937;
          border-bottom-color: #10b981;
          background: transparent;
        }
      }
    }

    // Accomplissements
    .accomplishments-card {
      background: white;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);

      h2 {
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .subtitle {
        color: #6b7280;
        margin-bottom: 32px;
      }

      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(16, 185, 129, 0.2);
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        p {
          color: #6b7280;
        }
      }

      .certificates-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .certificate-card {
        display: flex;
        gap: 24px;
        padding: 24px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #10b981;
        }

        .certificate-icon {
          flex-shrink: 0;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;

          .material-icons {
            font-size: 36px;
          }
        }

        .certificate-info {
          flex: 1;

          h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }

          .certificate-number {
            font-size: 0.9rem;
            color: #6b7280;
            margin-bottom: 4px;
          }

          .certificate-date {
            font-size: 0.85rem;
            color: #9ca3af;
          }
        }

        .certificate-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
      }

      .empty-state {
        text-align: center;
        padding: 80px 20px;

        .material-icons {
          font-size: 80px;
          color: #d1d5db;
          margin-bottom: 24px;
        }

        h3 {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 12px;
        }

        p {
          color: #6b7280;
          margin-bottom: 32px;
        }
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  editedProfile: Partial<UserProfile> = {};
  isEditing: boolean = false;
  isSaving: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  selectedFile: File | null = null;
  
  // Password change
  showPasswordModal: boolean = false;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Accomplissements
  activeTab: 'profil' | 'accomplissements' = 'profil';
  certificates: Certificate[] = [];
  isLoadingCertificates = false;

  constructor(
    private profileService: UserProfileService,
    private certificatesService: CertificatesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier si on doit afficher l'onglet accomplissements
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'accomplissements') {
        this.activeTab = 'accomplissements';
        this.loadCertificates();
      }
    });

    this.profileService.getUserProfile().subscribe({
      next: (p) => {
        this.profile = p;
        this.editedProfile = { ...p };
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Erreur lors du chargement du profil';
      }
    });
  }

  loadCertificates(): void {
    this.isLoadingCertificates = true;
    this.certificatesService.getMyCertificates().subscribe({
      next: (certs) => {
        this.certificates = certs;
        this.isLoadingCertificates = false;
      },
      error: (error) => {
        console.error('Error loading certificates:', error);
        this.isLoadingCertificates = false;
      }
    });
  }

  setActiveTab(tab: 'profil' | 'accomplissements'): void {
    this.activeTab = tab;
    if (tab === 'accomplissements') {
      this.loadCertificates();
    }
  }

  downloadCertificate(certificate: Certificate): void {
    this.certificatesService.downloadCertificate(certificate.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificat-${certificate.certificateNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error downloading certificate:', error);
        alert('Erreur lors du téléchargement du certificat');
      }
    });
  }

  shareCertificate(certificate: Certificate): void {
    const shareUrl = this.certificatesService.shareCertificate(certificate.certificateNumber);
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Lien de partage copié dans le presse-papiers !');
    }).catch(() => {
      // Fallback pour les navigateurs qui ne supportent pas clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Lien de partage copié dans le presse-papiers !');
    });
  }

  startEditing(): void {
    this.isEditing = true;
    this.editedProfile = { 
      ...this.profile!,
      preferences: this.profile!.preferences || {
        language: 'fr',
        notificationsEnabled: true,
        emailUpdates: true,
        theme: 'light',
        learningPace: 'Modéré',
        weeklyGoalHours: 10
      }
    };
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

    // Si une nouvelle image a été sélectionnée, convertir en base64 ou URL
    // Pour l'instant, on utilise directement la preview (base64)
    // Dans un vrai projet, vous devriez uploader le fichier vers un serveur
    
    const updates: Partial<UserProfile> = {
      firstName: this.editedProfile.firstName,
      lastName: this.editedProfile.lastName,
      formation: this.editedProfile.formation,
      niveau: this.editedProfile.niveau,
      avatarUrl: this.editedProfile.avatarUrl,
      preferences: this.editedProfile.preferences
    };

    this.profileService.updateProfile(updates).subscribe({
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
  
  changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }
    
    if (this.passwordData.newPassword.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }
    
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    this.profileService.changePassword(
      this.passwordData.currentPassword,
      this.passwordData.newPassword
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.showPasswordModal = false;
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.successMessage = 'Mot de passe modifié avec succès !';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.isSaving = false;
        const errorMessage = error?.error?.error || error?.error?.message || 'Erreur lors du changement de mot de passe';
        this.errorMessage = errorMessage;
      }
    });
  }
}
