import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserProfileService } from '../services/user-profile.service';
import { UserNotificationsService } from '../services/user-notifications.service';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../models/user.interfaces';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent implements OnInit {
  isSidebarOpen = true;
  currentUser: UserProfile | null = null;
  unreadNotifications = 0;
  showProfileMenu = false;

  navItems: NavItem[] = [
    { label: 'Tableau de Bord', icon: 'dashboard', route: '/user/dashboard' },
    { label: 'Mes Cours', icon: 'school', route: '/user/courses' },
    { label: 'Coach Virtuel IA', icon: 'psychology', route: '/user/chat' },
    { label: 'Quiz & Exercices', icon: 'quiz', route: '/user/assessments' },
    { label: 'Ma Progression', icon: 'trending_up', route: '/user/progress' },
    { label: 'Notifications', icon: 'notifications', route: '/user/notifications', badge: 0 },
    { label: 'Recherche', icon: 'search', route: '/user/search' },
    { label: 'Support', icon: 'support_agent', route: '/user/support' }
  ];

  constructor(
    private userProfileService: UserProfileService,
    private notificationsService: UserNotificationsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Charger le profil utilisateur
    this.userProfileService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Charger le nombre de notifications non lues
    this.notificationsService.unreadCount$.subscribe(count => {
      this.unreadNotifications = count;
      const notifItem = this.navItems.find(item => item.route === '/user/notifications');
      if (notifItem) {
        notifItem.badge = count;
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.showProfileMenu = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/user/profile']);
    this.showProfileMenu = false;
  }

  goToSettings(): void {
    this.router.navigate(['/user/settings']);
    this.showProfileMenu = false;
  }
}




