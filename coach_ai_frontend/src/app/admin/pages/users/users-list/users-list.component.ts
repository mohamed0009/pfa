import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersAdminService } from '../../../services/users-admin.service';
import { ContentManagementService } from '../../../services/content-management.service';
import { User, UserRole, UserStatus, Formation } from '../../../models/admin.interfaces';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  
  // Filters
  searchQuery = '';
  selectedRole: UserRole | 'all' = 'all';
  selectedStatus: UserStatus | 'all' = 'all';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Modal state
  showUserModal = false;
  showDeleteConfirm = false;
  selectedUser: User | null = null;
  modalMode: 'create' | 'edit' | 'view' = 'view';
  
  // Stats
  userStats = {
    total: 0,
    active: 0,
    apprenants: 0,
    formateurs: 0,
    administrateurs: 0
  };
  
  // Formations list
  formations: Formation[] = [];
  newPassword: string = '';
  showPasswordField: boolean = false;

  constructor(
    private usersService: UsersAdminService,
    private contentService: ContentManagementService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
    this.loadFormations();
  }
  
  loadFormations(): void {
    this.contentService.getFormations().subscribe(formations => {
      this.formations = formations.filter(f => f.status === 'published' || f.status === 'approved');
    });
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe(users => {
      this.users = users;
      this.applyFilters();
    });
  }

  loadStats(): void {
    this.usersService.getUserStats().subscribe(stats => {
      this.userStats = stats;
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.training.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(u => u.status === this.selectedStatus);
    }

    this.filteredUsers = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  // Modal actions
  openCreateModal(): void {
    this.selectedUser = {
      id: '',
      fullName: '',
      email: '',
      role: 'Apprenant',
      status: 'active',
      training: '',
      level: 'Débutant',
      avatarUrl: '',
      coursesEnrolled: 0,
      coursesCompleted: 0,
      lastActive: new Date(),
      createdAt: new Date()
    };
    this.newPassword = '';
    this.showPasswordField = true;
    this.modalMode = 'create';
    this.showUserModal = true;
  }

  openEditModal(user: User): void {
    this.selectedUser = { ...user };
    this.newPassword = '';
    this.showPasswordField = false;
    this.modalMode = 'edit';
    this.showUserModal = true;
  }
  
  togglePasswordField(): void {
    this.showPasswordField = !this.showPasswordField;
    if (!this.showPasswordField) {
      this.newPassword = '';
    }
  }

  openViewModal(user: User): void {
    this.selectedUser = user;
    this.modalMode = 'view';
    this.showUserModal = true;
  }

  closeModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
    this.newPassword = '';
    this.showPasswordField = false;
  }

  // CRUD operations
  saveUser(): void {
    if (!this.selectedUser) return;
    
    // Validation
    if (!this.selectedUser.fullName || !this.selectedUser.email) {
      alert('Veuillez remplir le nom complet et l\'email');
      return;
    }
    
    if (this.modalMode === 'create') {
      // Pour la création, inclure le mot de passe si fourni
      const userData: any = { ...this.selectedUser };
      
      // Le mot de passe est requis pour la création
      if (!this.newPassword || this.newPassword.trim() === '') {
        alert('⚠️ Le mot de passe est requis pour créer un utilisateur');
        return;
      }
      
      userData.password = this.newPassword;
      
      console.log('Creating user with data:', { ...userData, password: '***' }); // Log sans le mot de passe
      
      this.usersService.createUser(userData).subscribe({
        next: (createdUser) => {
          console.log('User created successfully:', createdUser);
          this.loadUsers();
          this.loadStats();
          this.closeModal();
          alert('✅ Utilisateur créé avec succès !');
        },
        error: (error) => {
          console.error('Error creating user:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          const errorMessage = error?.error?.error || error?.error?.message || error?.message || 'Erreur lors de la création de l\'utilisateur';
          alert('❌ Erreur: ' + errorMessage);
        }
      });
    } else if (this.modalMode === 'edit') {
      // Pour la modification, inclure le mot de passe si fourni
      const updateData: any = { ...this.selectedUser };
      if (this.newPassword && this.newPassword.trim() !== '') {
        updateData.password = this.newPassword;
      }
      delete updateData.id; // Ne pas envoyer l'ID dans les données de mise à jour
      
      this.usersService.updateUser(this.selectedUser.id, updateData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
          alert('✅ Utilisateur modifié avec succès !');
        },
        error: (error) => {
          console.error('Error updating user:', error);
          const errorMessage = error?.error?.error || error?.error?.message || 'Erreur lors de la modification de l\'utilisateur';
          alert('❌ Erreur: ' + errorMessage);
        }
      });
    }
  }

  confirmDelete(user: User): void {
    this.selectedUser = user;
    this.showDeleteConfirm = true;
  }

  deleteUser(): void {
    if (!this.selectedUser) return;

    this.usersService.deleteUser(this.selectedUser.id).subscribe({
      next: (success) => {
        if (success) {
          this.loadUsers();
          this.loadStats();
          this.showDeleteConfirm = false;
          this.selectedUser = null;
          alert('✅ Utilisateur supprimé avec succès !');
        } else {
          alert('❌ Erreur lors de la suppression de l\'utilisateur');
        }
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        alert('❌ Erreur lors de la suppression de l\'utilisateur');
      }
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    this.usersService.updateUserStatus(user.id, newStatus).subscribe(() => {
      this.loadUsers();
    });
  }

  resetPassword(user: User): void {
    if (confirm(`Voulez-vous vraiment réinitialiser le mot de passe de ${user.fullName}?`)) {
      // Mock password reset
      alert(`Un email de réinitialisation a été envoyé à ${user.email}`);
    }
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  // Helpers
  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'Administrateur': return 'badge-admin';
      case 'Formateur': return 'badge-trainer';
      case 'Apprenant': return 'badge-learner';
      default: return '';
    }
  }

  getStatusBadgeClass(status: UserStatus): string {
    switch (status) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-secondary';
      case 'pending': return 'badge-warning';
      case 'suspended': return 'badge-danger';
      default: return '';
    }
  }
}




