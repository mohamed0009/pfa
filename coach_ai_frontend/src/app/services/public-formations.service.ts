import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoggerService } from './logger.service';

export interface PublicFormation {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  thumbnail?: string;
  modulesCount?: number;
  quizzesCount?: number;
  enrolledCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PublicFormationsService {
  private apiUrl = 'http://localhost:8081/api/public';

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {}

  getPublicFormations(): Observable<PublicFormation[]> {
    return this.http.get<any[]>(`${this.apiUrl}/formations`).pipe(
      map((formations: any[]) => formations.map(f => ({
        id: f.id,
        title: f.title,
        description: f.description,
        category: f.category || 'Formation',
        level: f.level ? (f.level === 'DEBUTANT' ? 'Débutant' : f.level === 'INTERMEDIAIRE' ? 'Intermédiaire' : 'Avancé') : 'Tous niveaux',
        duration: f.duration || 0,
        thumbnail: f.thumbnail,
        modulesCount: f.modulesCount || 0,
        quizzesCount: f.quizzesCount || 0,
        enrolledCount: f.enrolledCount || 0
      }))),
      catchError((error) => {
        this.logger.error('Error fetching public formations', error);
        return of([]);
      })
    );
  }

  getPublicCourses(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8081/api/courses`).pipe(
      map((courses: any[]) => courses.slice(0, 6)), // Limiter à 6 cours
      catchError((error) => {
        this.logger.error('Error fetching public courses', error);
        return of([]);
      })
    );
  }
}

