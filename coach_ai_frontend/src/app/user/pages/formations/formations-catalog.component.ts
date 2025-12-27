import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormationsService } from '../../services/formations.service';
import { Formation } from '../../models/formation.interfaces';

@Component({
  selector: 'app-formations-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './formations-catalog.component.html',
  styleUrl: './formations-catalog.component.scss'
})
export class FormationsCatalogComponent implements OnInit {
  formations: Formation[] = [];
  filteredFormations: Formation[] = [];
  selectedCategory: string = 'all';
  selectedLevel: string = 'all';
  searchQuery: string = '';
  isLoading: boolean = true;

  categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'Développement', label: 'Développement' },
    { value: 'Programmation', label: 'Programmation' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Business', label: 'Business' }
  ];

  levels = [
    { value: 'all', label: 'Tous les niveaux' },
    { value: 'DEBUTANT', label: 'Débutant' },
    { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
    { value: 'AVANCE', label: 'Avancé' }
  ];

  constructor(
    private formationsService: FormationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.isLoading = true;
    this.formationsService.getAllFormations().subscribe({
      next: (formations) => {
        this.formations = formations;
        this.filteredFormations = formations;
        this.isLoading = false;
        console.log('Formations loaded:', formations);
      },
      error: (error) => {
        console.error('Error loading formations:', error);
        this.isLoading = false;
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  filterByLevel(level: string): void {
    this.selectedLevel = level;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let results = [...this.formations];

    // Filtre par catégorie
    if (this.selectedCategory !== 'all') {
      results = results.filter(f => f.category === this.selectedCategory);
    }

    // Filtre par niveau
    if (this.selectedLevel !== 'all') {
      results = results.filter(f => f.level === this.selectedLevel);
    }

    // Filtre par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      results = results.filter(f =>
        f.title.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query)
      );
    }

    this.filteredFormations = results;
  }

  viewFormationDetails(formationId: string): void {
    this.router.navigate(['/user/formations', formationId]);
  }

  getLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'DEBUTANT': 'Débutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'AVANCE': 'Avancé'
    };
    return labels[level] || level;
  }

  getTrainerFullName(formation: Formation): string {
    if (!formation.trainer) return 'Formateur';
    return `${formation.trainer.firstName} ${formation.trainer.lastName}`;
  }

  getFormationThumbnail(formation: Formation): string {
    // Si la formation a une image, l'utiliser
    if (formation.thumbnail && formation.thumbnail.trim() !== '') {
      return formation.thumbnail;
    }
    
    // Sinon, retourner une image par défaut basée sur la catégorie
    const categoryImages: { [key: string]: string } = {
      'Développement': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop',
      'Programmation': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
      'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
      'Business': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=200&fit=crop'
    };
    
    return categoryImages[formation.category] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop';
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  getQuizzesCount(formation: Formation): number {
    if (formation.quizzesCount) {
      return formation.quizzesCount;
    }
    if (formation.modules && formation.modules.length > 0) {
      return formation.modules.filter(m => m.quiz).length;
    }
    return 0;
  }
}

