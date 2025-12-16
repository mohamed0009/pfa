import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersAdminService } from '../../../services/users-admin.service';
import { User, UserRole, UserStatus } from '../../../models/admin.interfaces';

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

  constructor(private usersService: UsersAdminService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
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
    this.selectedUser = null;
    this.modalMode = 'create';
    this.showUserModal = true;
  }

  openEditModal(user: User): void {
    this.selectedUser = { ...user };
    this.modalMode = 'edit';
    this.showUserModal = true;
  }

  openViewModal(user: User): void {
    this.selectedUser = user;
    this.modalMode = 'view';
    this.showUserModal = true;
  }

  closeModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
  }

  // CRUD operations
  saveUser(): void {
    if (!this.selectedUser) return;

    if (this.modalMode === 'create') {
      this.usersService.createUser(this.selectedUser).subscribe(() => {
        this.loadUsers();
        this.loadStats();
        this.closeModal();
      });
    } else if (this.modalMode === 'edit') {
      this.usersService.updateUser(this.selectedUser.id, this.selectedUser).subscribe(() => {
        this.loadUsers();
        this.closeModal();
      });
    }
  }

  confirmDelete(user: User): void {
    this.selectedUser = user;
    this.showDeleteConfirm = true;
  }

  deleteUser(): void {
    if (!this.selectedUser) return;

    this.usersService.deleteUser(this.selectedUser.id).subscribe(() => {
      this.loadUsers();
      this.loadStats();
      this.showDeleteConfirm = false;
      this.selectedUser = null;
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    this.usersService.updateUser(user.id, { status: newStatus }).subscribe(() => {
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




