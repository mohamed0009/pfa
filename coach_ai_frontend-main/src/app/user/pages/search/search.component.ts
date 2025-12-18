import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { SearchResult, Favorite } from '../../models/user.interfaces';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="search-page">
      <div class="search-header">
        <h1>Recherche</h1>
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery"
            (input)="performSearch()"
            placeholder="Rechercher des cours, modules, quiz, ressources..."
            class="search-input">
        </div>
      </div>

      <div class="search-content">
        <div class="search-results" *ngIf="searchResults.length > 0">
          <h2>Résultats ({{ searchResults.length }})</h2>
          <div class="results-list">
            <div class="result-item" *ngFor="let result of searchResults" [routerLink]="result.url">
              <div class="result-icon">
                <span class="material-icons">{{ getResultIcon(result.type) }}</span>
              </div>
              <div class="result-content">
                <h3>{{ result.title }}</h3>
                <p>{{ result.description }}</p>
                <div class="result-meta">
                  <span class="result-type">{{ result.type }}</span>
                  <span class="result-category">{{ result.category }}</span>
                </div>
              </div>
              <button class="btn-favorite" (click)="toggleFavorite(result, $event)">
                <span class="material-icons">{{ isFavorited(result.id) ? 'favorite' : 'favorite_border' }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="favorites-section" *ngIf="!searchQuery && favorites.length > 0">
          <h2>⭐ Mes Favoris</h2>
          <div class="favorites-list">
            <div class="favorite-item" *ngFor="let fav of favorites">
              <span class="material-icons">{{ getResultIcon(fav.targetType) }}</span>
              <div>
                <h4>{{ fav.targetTitle }}</h4>
                <span class="fav-type">{{ fav.targetType }}</span>
              </div>
              <button class="btn-remove" (click)="removeFavorite(fav.targetId)">
                <span class="material-icons">close</span>
              </button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="searchQuery && searchResults.length === 0">
          <span class="material-icons">search_off</span>
          <p>Aucun résultat trouvé pour "{{ searchQuery }}"</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-page { max-width: 1000px; margin: 0 auto; }
    .search-header { margin-bottom: 32px; }
    .search-bar { position: relative; display: flex; align-items: center; background: white; border-radius: 16px; padding: 16px 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .search-bar .material-icons { color: #6b7280; font-size: 24px; margin-right: 12px; }
    .search-input { flex: 1; border: none; font-size: 1rem; outline: none; }
    .search-results h2, .favorites-section h2 { margin-bottom: 20px; }
    .results-list, .favorites-list { display: flex; flex-direction: column; gap: 12px; }
    .result-item, .favorite-item { background: white; padding: 20px; border-radius: 12px; display: flex; gap: 16px; align-items: center; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .result-item:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .result-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(16, 185, 129, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .result-icon .material-icons { color: #10b981; font-size: 28px; }
    .result-content { flex: 1; min-width: 0; }
    .result-content h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 8px; }
    .result-content p { font-size: 0.9rem; color: #6b7280; margin-bottom: 12px; }
    .result-meta { display: flex; gap: 12px; }
    .result-type, .result-category, .fav-type { padding: 4px 12px; background: #f3f4f6; border-radius: 8px; font-size: 0.75rem; font-weight: 600; color: #374151; }
    .btn-favorite, .btn-remove { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.3s ease; }
    .btn-favorite:hover { background: rgba(239, 68, 68, 0.1); }
    .btn-favorite .material-icons { color: #ef4444; font-size: 24px; }
    .btn-remove .material-icons { color: #dc2626; font-size: 20px; }
    .favorite-item .material-icons { color: #10b981; font-size: 28px; }
    .favorite-item h4 { font-weight: 700; margin-bottom: 4px; }
    .empty-state { text-align: center; padding: 60px 20px; color: #6b7280; }
    .empty-state .material-icons { font-size: 64px; margin-bottom: 16px; }
    h1 { margin-bottom: 20px; }
  `]
})
export class SearchComponent {
  searchQuery = '';
  searchResults: SearchResult[] = [];
  favorites: Favorite[] = [];
  favoritedIds: Set<string> = new Set();

  constructor(private searchService: SearchService) {
    this.loadFavorites();
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.searchService.search(this.searchQuery).subscribe(results => {
        this.searchResults = results;
      });
    } else {
      this.searchResults = [];
    }
  }

  loadFavorites(): void {
    this.searchService.getFavorites().subscribe(favs => {
      this.favorites = favs;
      this.favoritedIds = new Set(favs.map(f => f.targetId));
    });
  }

  isFavorited(id: string): boolean {
    return this.favoritedIds.has(id);
  }

  toggleFavorite(result: SearchResult, event: Event): void {
    event.stopPropagation();
    this.searchService.toggleFavorite(result.type as any, result.id, result.title).subscribe(() => {
      this.loadFavorites();
    });
  }

  removeFavorite(targetId: string): void {
    this.searchService.removeFromFavorites(targetId).subscribe(() => {
      this.loadFavorites();
    });
  }

  getResultIcon(type: string): string {
    const icons: any = {
      'module': 'school',
      'lesson': 'play_lesson',
      'quiz': 'quiz',
      'resource': 'description',
      'conversation': 'chat'
    };
    return icons[type] || 'article';
  }
}




