import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UserProgress, Achievement, ActivityLog, LearningStats } from '../models/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserProgressService {
  private mockProgress: UserProgress = {
    userId: 'user1',
    overallProgress: 37,
    modulesCompleted: 2,
    totalModules: 5,
    lessonsCompleted: 8,
    totalLessons: 22,
    quizzesCompleted: 3,
    averageQuizScore: 84,
    totalStudyTime: 42.5,
    currentStreak: 5,
    longestStreak: 12,
    weeklyGoalProgress: 78,
    achievements: [
      {
        id: 'ach1',
        title: 'Premier Pas',
        description: 'Complétez votre première leçon',
        icon: 'emoji_events',
        earnedAt: new Date('2024-09-16'),
        category: 'progression'
      },
      {
        id: 'ach2',
        title: 'As du Quiz',
        description: 'Obtenez 100% à un quiz',
        icon: 'psychology',
        earnedAt: new Date('2024-10-05'),
        category: 'quiz'
      },
      {
        id: 'ach3',
        title: 'Marathon',
        description: 'Maintenez une série de 7 jours',
        icon: 'local_fire_department',
        earnedAt: new Date('2024-11-20'),
        category: 'streak'
      },
      {
        id: 'ach4',
        title: 'Module Maîtrisé',
        description: 'Complétez un module entier',
        icon: 'workspace_premium',
        earnedAt: new Date('2024-10-22'),
        category: 'progression'
      }
    ],
    recentActivity: [
      {
        id: 'act1',
        userId: 'user1',
        type: 'lesson_completed',
        title: 'Leçon complétée',
        description: 'Props et State - React Introduction',
        timestamp: new Date('2025-12-13T10:30:00')
      },
      {
        id: 'act2',
        userId: 'user1',
        type: 'quiz_passed',
        title: 'Quiz réussi',
        description: 'JavaScript Fondamentaux - Score: 85%',
        timestamp: new Date('2025-12-10T14:48:00')
      },
      {
        id: 'act3',
        userId: 'user1',
        type: 'exercise_submitted',
        title: 'Exercice soumis',
        description: 'Todo List en React',
        timestamp: new Date('2025-12-12T16:30:00')
      },
      {
        id: 'act4',
        userId: 'user1',
        type: 'chat_session',
        title: 'Session avec le coach IA',
        description: 'Discussion sur les closures JavaScript',
        timestamp: new Date('2025-12-13T10:15:00')
      },
      {
        id: 'act5',
        userId: 'user1',
        type: 'module_completed',
        title: 'Module complété',
        description: 'JavaScript Fondamentaux',
        timestamp: new Date('2025-12-08T18:20:00')
      }
    ]
  };

  private mockStats: LearningStats = {
    weeklyStudyTime: [3.5, 5.2, 4.8, 6.1, 5.5, 7.2, 6.8], // Lundi à Dimanche
    moduleProgress: [
      { moduleName: 'HTML/CSS', progress: 100 },
      { moduleName: 'JavaScript', progress: 100 },
      { moduleName: 'React Intro', progress: 60 },
      { moduleName: 'React Avancé', progress: 0 },
      { moduleName: 'Node.js', progress: 0 }
    ],
    quizPerformance: [
      { quizName: 'HTML Basics', score: 90, date: new Date('2024-09-20') },
      { quizName: 'CSS Flexbox', score: 85, date: new Date('2024-10-05') },
      { quizName: 'JS Fundamentals', score: 85, date: new Date('2024-11-12') },
      { quizName: 'JS Advanced', score: 78, date: new Date('2024-12-01') }
    ],
    skillsProgress: [
      { skill: 'HTML/CSS', level: 90 },
      { skill: 'JavaScript', level: 75 },
      { skill: 'React', level: 45 },
      { skill: 'Backend', level: 10 },
      { skill: 'Bases de données', level: 5 }
    ]
  };

  constructor() {}

  // Récupérer la progression utilisateur
  getUserProgress(): Observable<UserProgress> {
    return of(this.mockProgress).pipe(delay(350));
  }

  // Récupérer les statistiques détaillées
  getLearningStats(): Observable<LearningStats> {
    return of(this.mockStats).pipe(delay(400));
  }

  // Récupérer l'activité récente
  getRecentActivity(limit: number = 10): Observable<ActivityLog[]> {
    const activities = this.mockProgress.recentActivity.slice(0, limit);
    return of(activities).pipe(delay(300));
  }

  // Récupérer les achievements
  getAchievements(): Observable<Achievement[]> {
    return of(this.mockProgress.achievements).pipe(delay(300));
  }

  // Ajouter une nouvelle activité
  logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Observable<ActivityLog> {
    const newActivity: ActivityLog = {
      ...activity,
      id: 'act_' + Date.now(),
      timestamp: new Date()
    };

    this.mockProgress.recentActivity.unshift(newActivity);
    
    // Garder seulement les 20 dernières activités
    if (this.mockProgress.recentActivity.length > 20) {
      this.mockProgress.recentActivity = this.mockProgress.recentActivity.slice(0, 20);
    }

    return of(newActivity).pipe(delay(200));
  }

  // Mettre à jour le temps d'étude
  updateStudyTime(hours: number): Observable<boolean> {
    this.mockProgress.totalStudyTime += hours;
    
    // Mettre à jour le graphique hebdomadaire (dernier jour)
    const today = new Date().getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const dayIndex = today === 0 ? 6 : today - 1; // Convertir pour notre tableau (0 = Lundi)
    this.mockStats.weeklyStudyTime[dayIndex] += hours;

    // Calculer la progression vers l'objectif hebdomadaire
    const weekTotal = this.mockStats.weeklyStudyTime.reduce((sum, h) => sum + h, 0);
    const weeklyGoal = 10; // heures
    this.mockProgress.weeklyGoalProgress = Math.min(Math.round((weekTotal / weeklyGoal) * 100), 100);

    return of(true).pipe(delay(200));
  }

  // Mettre à jour le streak
  updateStreak(): Observable<number> {
    this.mockProgress.currentStreak++;
    if (this.mockProgress.currentStreak > this.mockProgress.longestStreak) {
      this.mockProgress.longestStreak = this.mockProgress.currentStreak;
    }
    
    // Vérifier si on débloque l'achievement "Marathon"
    if (this.mockProgress.currentStreak === 7) {
      const hasAchievement = this.mockProgress.achievements.some(a => a.id === 'ach3');
      if (!hasAchievement) {
        this.mockProgress.achievements.push({
          id: 'ach3',
          title: 'Marathon',
          description: 'Maintenez une série de 7 jours',
          icon: 'local_fire_department',
          earnedAt: new Date(),
          category: 'streak'
        });
      }
    }

    return of(this.mockProgress.currentStreak).pipe(delay(200));
  }

  // Incrémenter les leçons complétées
  incrementLessonsCompleted(): Observable<boolean> {
    this.mockProgress.lessonsCompleted++;
    this.updateOverallProgress();
    return of(true).pipe(delay(200));
  }

  // Incrémenter les modules complétés
  incrementModulesCompleted(): Observable<boolean> {
    this.mockProgress.modulesCompleted++;
    this.updateOverallProgress();
    
    // Débloquer achievement si premier module
    if (this.mockProgress.modulesCompleted === 1) {
      const hasAchievement = this.mockProgress.achievements.some(a => a.id === 'ach4');
      if (!hasAchievement) {
        this.mockProgress.achievements.push({
          id: 'ach4',
          title: 'Module Maîtrisé',
          description: 'Complétez un module entier',
          icon: 'workspace_premium',
          earnedAt: new Date(),
          category: 'progression'
        });
      }
    }

    return of(true).pipe(delay(200));
  }

  // Ajouter un résultat de quiz
  addQuizResult(quizName: string, score: number): Observable<boolean> {
    this.mockProgress.quizzesCompleted++;
    
    // Recalculer la moyenne
    const total = (this.mockProgress.averageQuizScore * (this.mockProgress.quizzesCompleted - 1)) + score;
    this.mockProgress.averageQuizScore = Math.round(total / this.mockProgress.quizzesCompleted);

    // Ajouter au graphique de performance
    this.mockStats.quizPerformance.push({
      quizName,
      score,
      date: new Date()
    });

    // Débloquer achievement si score parfait
    if (score === 100) {
      const hasAchievement = this.mockProgress.achievements.some(a => a.id === 'ach2');
      if (!hasAchievement) {
        this.mockProgress.achievements.push({
          id: 'ach2',
          title: 'As du Quiz',
          description: 'Obtenez 100% à un quiz',
          icon: 'psychology',
          earnedAt: new Date(),
          category: 'quiz'
        });
      }
    }

    return of(true).pipe(delay(200));
  }

  // Mettre à jour la progression globale
  private updateOverallProgress(): void {
    const lessonProgress = (this.mockProgress.lessonsCompleted / this.mockProgress.totalLessons) * 100;
    this.mockProgress.overallProgress = Math.round(lessonProgress);
  }

  // Réinitialiser le streak (si l'utilisateur manque un jour)
  resetStreak(): Observable<boolean> {
    this.mockProgress.currentStreak = 0;
    return of(true).pipe(delay(100));
  }
}




