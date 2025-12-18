import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { SearchResult, SearchFilters, Favorite } from '../models/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private mockSearchResults: SearchResult[] = [
    {
      id: 'res1',
      type: 'module',
      title: 'JavaScript Fondamentaux',
      description: 'Découvrez les concepts de base de JavaScript ES6+',
      url: '/user/learning-path/mod2',
      relevance: 95,
      category: 'Formation',
      metadata: { niveau: 'Intermédiaire', duration: '20h' }
    },
    {
      id: 'res2',
      type: 'lesson',
      title: 'Fonctions et Closures',
      description: 'Maîtriser les fonctions, arrow functions et closures',
      url: '/user/lessons/lesson4',
      relevance: 92,
      category: 'Leçon',
      metadata: { moduleTitle: 'JavaScript Fondamentaux' }
    },
    {
      id: 'res3',
      type: 'quiz',
      title: 'Quiz : React Composants',
      description: 'Évaluez votre compréhension des composants React',
      url: '/user/quiz/quiz2',
      relevance: 88,
      category: 'Quiz',
      metadata: { difficulty: 'Moyen', questionsCount: 12 }
    },
    {
      id: 'res4',
      type: 'resource',
      title: 'Documentation : React Hooks',
      description: 'Guide complet sur les hooks React',
      url: '/resources/react-hooks',
      relevance: 85,
      category: 'Ressource',
      metadata: { type: 'documentation' }
    },
    {
      id: 'res5',
      type: 'lesson',
      title: 'Props et State',
      description: 'Gérez les données dans vos composants React',
      url: '/user/lessons/lesson6',
      relevance: 82,
      category: 'Leçon',
      metadata: { moduleTitle: 'React Introduction' }
    },
    {
      id: 'res6',
      type: 'conversation',
      title: 'Introduction à JavaScript',
      description: 'Discussion sur les closures et les fonctions',
      url: '/user/chat/conv1',
      relevance: 78,
      category: 'Conversation IA',
      metadata: { messagesCount: 12 }
    }
  ];

  private mockFavorites: Favorite[] = [
    {
      id: 'fav1',
      userId: 'user1',
      targetType: 'lesson',
      targetId: 'lesson4',
      targetTitle: 'Fonctions et Closures',
      addedAt: new Date('2025-12-10')
    },
    {
      id: 'fav2',
      userId: 'user1',
      targetType: 'quiz',
      targetId: 'quiz1',
      targetTitle: 'Quiz : JavaScript Fondamentaux',
      addedAt: new Date('2025-12-09')
    },
    {
      id: 'fav3',
      userId: 'user1',
      targetType: 'resource',
      targetId: 'res5',
      targetTitle: 'Documentation : React Hooks',
      addedAt: new Date('2025-12-11')
    }
  ];

  constructor() {}

  // Recherche globale
  search(query: string, filters?: SearchFilters): Observable<SearchResult[]> {
    if (!query || query.trim() === '') {
      return of([]).pipe(delay(200));
    }

    let results = this.mockSearchResults.filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase())
    );

    // Appliquer les filtres
    if (filters) {
      if (filters.type && filters.type.length > 0) {
        results = results.filter(r => filters.type!.includes(r.type));
      }
      
      if (filters.niveau && filters.niveau.length > 0) {
        results = results.filter(r => 
          r.metadata?.niveau && filters.niveau!.includes(r.metadata.niveau)
        );
      }
    }

    // Trier par pertinence
    results.sort((a, b) => b.relevance - a.relevance);

    return of(results).pipe(delay(400));
  }

  // Recherche rapide (autocomplete)
  quickSearch(query: string): Observable<SearchResult[]> {
    if (!query || query.trim() === '' || query.length < 2) {
      return of([]).pipe(delay(100));
    }

    const results = this.mockSearchResults
      .filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5); // Limiter à 5 résultats pour l'autocomplete

    return of(results).pipe(delay(200));
  }

  // Recherche par type
  searchByType(type: SearchResult['type']): Observable<SearchResult[]> {
    const results = this.mockSearchResults.filter(r => r.type === type);
    return of(results).pipe(delay(300));
  }

  // Obtenir les résultats suggérés (basé sur l'historique et le comportement)
  getSuggestions(): Observable<SearchResult[]> {
    // Retourner les résultats les plus pertinents
    const suggestions = this.mockSearchResults
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 4);
    
    return of(suggestions).pipe(delay(300));
  }

  // Gestion des Favoris

  // Récupérer tous les favoris
  getFavorites(): Observable<Favorite[]> {
    return of(this.mockFavorites).pipe(delay(300));
  }

  // Vérifier si un élément est favori
  isFavorite(targetId: string): Observable<boolean> {
    const isFav = this.mockFavorites.some(f => f.targetId === targetId);
    return of(isFav).pipe(delay(150));
  }

  // Ajouter aux favoris
  addToFavorites(targetType: Favorite['targetType'], targetId: string, targetTitle: string): Observable<Favorite> {
    const newFavorite: Favorite = {
      id: 'fav_' + Date.now(),
      userId: 'user1',
      targetType,
      targetId,
      targetTitle,
      addedAt: new Date()
    };

    this.mockFavorites.unshift(newFavorite);
    return of(newFavorite).pipe(delay(200));
  }

  // Retirer des favoris
  removeFromFavorites(targetId: string): Observable<boolean> {
    const index = this.mockFavorites.findIndex(f => f.targetId === targetId);
    if (index !== -1) {
      this.mockFavorites.splice(index, 1);
      return of(true).pipe(delay(200));
    }
    return of(false).pipe(delay(200));
  }

  // Toggle favori
  toggleFavorite(targetType: Favorite['targetType'], targetId: string, targetTitle: string): Observable<boolean> {
    const index = this.mockFavorites.findIndex(f => f.targetId === targetId);
    
    if (index !== -1) {
      // Retirer des favoris
      this.mockFavorites.splice(index, 1);
      return of(false).pipe(delay(200));
    } else {
      // Ajouter aux favoris
      const newFavorite: Favorite = {
        id: 'fav_' + Date.now(),
        userId: 'user1',
        targetType,
        targetId,
        targetTitle,
        addedAt: new Date()
      };
      this.mockFavorites.unshift(newFavorite);
      return of(true).pipe(delay(200));
    }
  }

  // Récupérer les favoris par type
  getFavoritesByType(type: Favorite['targetType']): Observable<Favorite[]> {
    const filtered = this.mockFavorites.filter(f => f.targetType === type);
    return of(filtered).pipe(delay(250));
  }
}




