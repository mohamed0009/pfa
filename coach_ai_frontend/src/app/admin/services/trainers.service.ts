import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, catchError } from 'rxjs';
import { Trainer, TrainerActivity, TrainerMetrics } from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TrainersService {
  private apiUrl = 'http://localhost:8081/api/admin/trainers';

  constructor(private http: HttpClient) {}

  private trainers: Trainer[] = [
    {
      id: 'trainer1',
      fullName: 'Dr. Sophie Martin',
      email: 'sophie.martin@coachiapro.fr',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      status: 'active',
      specializations: ['Machine Learning', 'Python', 'Data Science'],
      bio: 'Experte en IA avec 10 ans d\'expérience dans l\'enseignement',
      formationsAssigned: ['f2'],
      studentsCount: 189,
      coursesCreated: 24,
      rating: 4.8,
      joinedAt: new Date('2024-01-10'),
      validatedAt: new Date('2024-01-12'),
      validatedBy: 'admin1'
    },
    {
      id: 'trainer2',
      fullName: 'Marc Dubois',
      email: 'marc.dubois@coachiapro.fr',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
      status: 'active',
      specializations: ['React', 'JavaScript', 'Web Development'],
      bio: 'Développeur full stack et formateur passionné',
      formationsAssigned: ['f1'],
      studentsCount: 245,
      coursesCreated: 31,
      rating: 4.9,
      joinedAt: new Date('2023-12-05'),
      validatedAt: new Date('2023-12-07'),
      validatedBy: 'admin1'
    },
    {
      id: 'trainer3',
      fullName: 'Amina Khalil',
      email: 'amina.khalil@coachiapro.fr',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
      status: 'pending',
      specializations: ['Marketing Digital', 'SEO', 'Growth Hacking'],
      bio: 'Consultante en marketing digital avec 8 ans d\'expérience',
      formationsAssigned: [],
      studentsCount: 0,
      coursesCreated: 5,
      rating: 0,
      joinedAt: new Date('2024-12-10')
    }
  ];

  private activities: TrainerActivity[] = [
    {
      id: 'act1',
      trainerId: 'trainer1',
      type: 'content_created',
      description: 'Création du cours "Introduction au Machine Learning"',
      timestamp: new Date('2024-12-12T10:00:00')
    },
    {
      id: 'act2',
      trainerId: 'trainer2',
      type: 'student_interaction',
      description: 'Réponse à 15 questions d\'étudiants',
      timestamp: new Date('2024-12-13T09:30:00')
    }
  ];

  private metrics: Record<string, TrainerMetrics> = {
    'trainer1': {
      trainerId: 'trainer1',
      studentsActive: 172,
      averageProgress: 68,
      contentCreated: 24,
      contentPending: 2,
      studentSatisfaction: 4.8,
      responseTime: 2.3
    },
    'trainer2': {
      trainerId: 'trainer2',
      studentsActive: 223,
      averageProgress: 74,
      contentCreated: 31,
      contentPending: 1,
      studentSatisfaction: 4.9,
      responseTime: 1.8
    }
  };

  getTrainers(status?: 'pending' | 'validated' | 'active' | 'suspended'): Observable<Trainer[]> {
    const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
    return this.http.get<any[]>(url).pipe(
      map((trainers: any[]) => trainers.map(trainer => ({
        id: trainer.id,
        fullName: `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim() || trainer.email,
        email: trainer.email,
        avatarUrl: trainer.avatarUrl || '',
        status: trainer.status?.toLowerCase() || 'active',
        specializations: [], // À récupérer depuis un autre endpoint si disponible
        bio: trainer.bio || '',
        formationsAssigned: [], // À calculer depuis les formations
        studentsCount: trainer.studentsCount || 0,
        coursesCreated: trainer.coursesCount || 0,
        rating: 0, // À calculer depuis les reviews
        joinedAt: trainer.joinedAt ? new Date(trainer.joinedAt) : new Date(),
        validatedAt: trainer.validatedAt ? new Date(trainer.validatedAt) : undefined,
        validatedBy: trainer.validatedBy?.id || '',
        isOnline: trainer.isOnline || false,
        pendingFormations: trainer.pendingFormations || 0,
        pendingFormationsList: trainer.pendingFormationsList || [],
        totalFormations: trainer.totalFormations || 0,
        publishedFormations: trainer.publishedFormations || 0
      }))),
      catchError((error) => {
        console.error('Error fetching trainers:', error);
        return of([]);
      })
    );
  }

  getTrainerById(id: string): Observable<Trainer | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((trainer: any) => ({
        id: trainer.id,
        fullName: `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim() || trainer.email,
        email: trainer.email,
        avatarUrl: trainer.avatarUrl || '',
        status: trainer.status?.toLowerCase() || 'active',
        specializations: [],
        bio: trainer.bio || '',
        formationsAssigned: [],
        studentsCount: 0,
        coursesCreated: 0,
        rating: 0,
        joinedAt: trainer.joinedAt ? new Date(trainer.joinedAt) : new Date(),
        validatedAt: trainer.validatedAt ? new Date(trainer.validatedAt) : undefined,
        validatedBy: trainer.validatedBy?.id || ''
      })),
      catchError((error) => {
        console.error('Error fetching trainer:', error);
        return of(undefined);
      })
    );
  }

  validateTrainer(id: string): Observable<Trainer> {
    return this.http.post<any>(`${this.apiUrl}/${id}/validate`, {}).pipe(
      map((trainer: any) => ({
        id: trainer.id,
        fullName: `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim() || trainer.email,
        email: trainer.email,
        avatarUrl: trainer.avatarUrl || '',
        status: trainer.status?.toLowerCase() || 'active',
        specializations: [],
        bio: trainer.bio || '',
        formationsAssigned: [],
        studentsCount: 0,
        coursesCreated: 0,
        rating: 0,
        joinedAt: trainer.joinedAt ? new Date(trainer.joinedAt) : new Date(),
        validatedAt: trainer.validatedAt ? new Date(trainer.validatedAt) : new Date(),
        validatedBy: trainer.validatedBy?.id || ''
      })),
      catchError((error) => {
        console.error('Error validating trainer:', error);
        throw new Error('Trainer not found');
      })
    );
  }

  suspendTrainer(id: string): Observable<Trainer> {
    return this.http.post<any>(`${this.apiUrl}/${id}/suspend`, {}).pipe(
      map((trainer: any) => ({
        id: trainer.id,
        fullName: `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim() || trainer.email,
        email: trainer.email,
        avatarUrl: trainer.avatarUrl || '',
        status: trainer.status?.toLowerCase() || 'suspended',
        specializations: [],
        bio: trainer.bio || '',
        formationsAssigned: [],
        studentsCount: 0,
        coursesCreated: 0,
        rating: 0,
        joinedAt: trainer.joinedAt ? new Date(trainer.joinedAt) : new Date(),
        validatedAt: trainer.validatedAt ? new Date(trainer.validatedAt) : undefined,
        validatedBy: trainer.validatedBy?.id || ''
      })),
      catchError((error) => {
        console.error('Error suspending trainer:', error);
        throw new Error('Trainer not found');
      })
    );
  }

  assignFormation(trainerId: string, formationId: string): Observable<Trainer> {
    const index = this.trainers.findIndex(t => t.id === trainerId);
    if (index !== -1) {
      if (!this.trainers[index].formationsAssigned.includes(formationId)) {
        this.trainers[index].formationsAssigned.push(formationId);
      }
      return of(this.trainers[index]).pipe(delay(350));
    }
    throw new Error('Trainer not found');
  }

  unassignFormation(trainerId: string, formationId: string): Observable<Trainer> {
    const index = this.trainers.findIndex(t => t.id === trainerId);
    if (index !== -1) {
      this.trainers[index].formationsAssigned = 
        this.trainers[index].formationsAssigned.filter(f => f !== formationId);
      return of(this.trainers[index]).pipe(delay(300));
    }
    throw new Error('Trainer not found');
  }

  getTrainerActivities(trainerId: string): Observable<TrainerActivity[]> {
    return of(this.activities.filter(a => a.trainerId === trainerId)).pipe(delay(250));
  }

  getTrainerMetrics(trainerId: string): Observable<TrainerMetrics | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${trainerId}/metrics`).pipe(
      map((metrics: any) => ({
        trainerId: metrics.trainerId,
        studentsActive: metrics.studentsActive || 0,
        averageProgress: metrics.averageProgress || 0,
        contentCreated: metrics.contentCreated || 0,
        contentPending: metrics.contentPending || 0,
        studentSatisfaction: metrics.studentSatisfaction || 0,
        responseTime: metrics.responseTime || 0
      })),
      catchError((error) => {
        console.error('Error fetching trainer metrics:', error);
        return of(undefined);
      })
    );
  }

  getTrainerStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map((stats: any) => ({
        total: stats.total || 0,
        active: stats.active || 0,
        pending: stats.pending || 0,
        suspended: stats.suspended || 0,
        online: stats.online || 0,
        totalStudents: stats.totalStudents || 0,
        pendingFormations: stats.pendingFormations || 0,
        averageRating: stats.averageRating || 0
      })),
      catchError((error) => {
        console.error('Error fetching trainer statistics:', error);
        return of({
          total: 0,
          active: 0,
          pending: 0,
          suspended: 0,
          online: 0,
          totalStudents: 0,
          pendingFormations: 0,
          averageRating: 0
        });
      })
    );
  }

  // CRUD Operations
  createTrainer(trainer: Partial<Trainer>): Observable<Trainer> {
    const newTrainer: Trainer = {
      id: 'trainer' + (this.trainers.length + 1),
      fullName: trainer.fullName || '',
      email: trainer.email || '',
      avatarUrl: trainer.avatarUrl || 'https://i.pravatar.cc/150?img=' + (this.trainers.length + 10),
      status: 'pending',
      specializations: trainer.specializations || [],
      bio: trainer.bio || '',
      formationsAssigned: [],
      studentsCount: 0,
      coursesCreated: 0,
      rating: 0,
      joinedAt: new Date()
    };
    this.trainers.push(newTrainer);
    return of(newTrainer).pipe(delay(400));
  }

  updateTrainer(id: string, updates: Partial<Trainer>): Observable<Trainer> {
    const index = this.trainers.findIndex(t => t.id === id);
    if (index !== -1) {
      this.trainers[index] = { ...this.trainers[index], ...updates };
      return of(this.trainers[index]).pipe(delay(300));
    }
    throw new Error('Trainer not found');
  }

  deleteTrainer(id: string): Observable<boolean> {
    const index = this.trainers.findIndex(t => t.id === id);
    if (index !== -1) {
      this.trainers.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }
}




