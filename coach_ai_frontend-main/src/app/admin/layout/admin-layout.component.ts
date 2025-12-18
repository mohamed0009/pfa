import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Observable } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  isSidebarCollapsed = false;
  currentUser$!: Observable<AuthUser | null>;
  notifications = 5;

  navItems: NavItem[] = [
    { label: 'Tableau de Bord', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Utilisateurs', icon: 'people', route: '/admin/users' },
    { label: 'Contenus Pédagogiques', icon: 'auto_stories', route: '/admin/content', badge: 3 },
    { label: 'Supervision IA', icon: 'psychology', route: '/admin/ai-supervision' },
    { label: 'Formateurs', icon: 'school', route: '/admin/trainers', badge: 1 },
    { label: 'Notifications', icon: 'notifications', route: '/admin/notifications' },
    { label: 'Support', icon: 'support_agent', route: '/admin/support' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser;
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onLogout(): void {
    this.authService.logout();
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}





