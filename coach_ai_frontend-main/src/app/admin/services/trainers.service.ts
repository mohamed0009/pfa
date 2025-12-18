import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Trainer, TrainerActivity, TrainerMetrics } from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TrainersService {

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

  constructor() {}

  getTrainers(status?: 'pending' | 'validated' | 'active' | 'suspended'): Observable<Trainer[]> {
    let filtered = this.trainers;
    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }
    return of(filtered).pipe(delay(300));
  }

  getTrainerById(id: string): Observable<Trainer | undefined> {
    return of(this.trainers.find(t => t.id === id)).pipe(delay(200));
  }

  validateTrainer(id: string): Observable<Trainer> {
    const index = this.trainers.findIndex(t => t.id === id);
    if (index !== -1) {
      this.trainers[index] = {
        ...this.trainers[index],
        status: 'validated',
        validatedAt: new Date(),
        validatedBy: 'current-admin'
      };
      return of(this.trainers[index]).pipe(delay(400));
    }
    throw new Error('Trainer not found');
  }

  suspendTrainer(id: string): Observable<Trainer> {
    const index = this.trainers.findIndex(t => t.id === id);
    if (index !== -1) {
      this.trainers[index].status = 'suspended';
      return of(this.trainers[index]).pipe(delay(300));
    }
    throw new Error('Trainer not found');
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
    return of(this.metrics[trainerId]).pipe(delay(200));
  }

  getTrainerStatistics(): Observable<any> {
    return of({
      total: this.trainers.length,
      active: this.trainers.filter(t => t.status === 'active').length,
      pending: this.trainers.filter(t => t.status === 'pending').length,
      suspended: this.trainers.filter(t => t.status === 'suspended').length,
      totalStudents: this.trainers.reduce((sum, t) => sum + t.studentsCount, 0),
      totalCoursesCreated: this.trainers.reduce((sum, t) => sum + t.coursesCreated, 0),
      averageRating: this.trainers
        .filter(t => t.rating > 0)
        .reduce((sum, t) => sum + t.rating, 0) / this.trainers.filter(t => t.rating > 0).length
    }).pipe(delay(300));
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




