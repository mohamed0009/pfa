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
  selector: 'app-trainer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './trainer-layout.component.html',
  styleUrl: './trainer-layout.component.scss'
})
export class TrainerLayoutComponent implements OnInit {
  isSidebarCollapsed = false;
  currentUser$!: Observable<AuthUser | null>;
  notifications = 0;

  navItems: NavItem[] = [
    { label: 'Tableau de Bord', icon: 'dashboard', route: '/trainer/dashboard' },
    { label: 'Mon Profil', icon: 'person', route: '/trainer/profile' },
    { label: 'Contenus Pédagogiques', icon: 'auto_stories', route: '/trainer/content', badge: 0 },
    { label: 'Assistant IA', icon: 'psychology', route: '/trainer/ai-assistant' },
    { label: 'Mes Apprenants', icon: 'people', route: '/trainer/students' },
    { label: 'Évaluation', icon: 'assignment', route: '/trainer/evaluation', badge: 0 },
    { label: 'Communication', icon: 'chat', route: '/trainer/communication' },
    { label: 'Parcours Personnalisés', icon: 'route', route: '/trainer/learning-paths' },
    { label: 'Statistiques', icon: 'analytics', route: '/trainer/statistics' }
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

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
  }
}
