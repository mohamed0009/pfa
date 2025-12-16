import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  quickLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'À Propos', path: '#about' },
    { label: 'Formations', path: '#services' },
    { label: 'Blog', path: '#blog' },
    { label: 'Contact', path: '#contact' }
  ];

  services = [
    { label: 'Parcours Personnalisés', path: '#services' },
    { label: 'Coach Virtuel IA', path: '#services' },
    { label: 'Évaluations & Certifications', path: '#services' },
    { label: 'Formations Entreprises', path: '#services' },
    { label: 'Ateliers Pratiques', path: '#services' }
  ];

  socialLinks = [
    { icon: 'facebook', url: '#' },
    { icon: 'twitter', url: '#' },
    { icon: 'instagram', url: '#' },
    { icon: 'linkedin', url: '#' }
  ];
}





