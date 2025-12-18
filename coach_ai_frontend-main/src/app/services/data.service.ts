import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TherapyService, Testimonial, TeamMember, BlogArticle, Statistic, User } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private therapyServices: TherapyService[] = [
    {
      id: 1,
      title: 'Parcours Personnalisé IA',
      description: 'Formation adaptée à votre niveau et vos objectifs. L\'IA analyse vos compétences et crée un parcours unique pour optimiser votre progression.',
      features: [
        'Analyse de compétences en temps réel',
        'Exercices adaptatifs personnalisés',
        'Recommandations intelligentes'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      duration: 'À votre rythme',
      format: '100% En ligne'
    },
    {
      id: 2,
      title: 'Coach Virtuel Interactif',
      description: 'Accompagnement personnalisé 24/7 avec votre coach IA. Posez vos questions, recevez des explications claires et des retours immédiats sur vos exercices.',
      features: [
        'Assistance instantanée 24/7',
        'Feedback personnalisé en temps réel',
        'Explications adaptées à votre niveau'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop',
      duration: 'Disponible en permanence',
      format: 'Chat & Vidéo'
    },
    {
      id: 3,
      title: 'Évaluations & Certifications',
      description: 'Validez vos compétences avec des quiz adaptatifs et des projets pratiques. Obtenez des certifications reconnues pour valoriser votre parcours professionnel.',
      features: [
        'Quiz génératifs personnalisés',
        'Projets pratiques réels',
        'Certifications professionnelles'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop',
      duration: 'Selon progression',
      format: 'Évaluations continues'
    }
  ];

  private testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah M.',
      therapyType: 'Développement Web',
      rating: 5,
      comment: 'Le parcours personnalisé m\'a permis de passer de débutante à développeuse confirmée en 6 mois. Le coach IA s\'adapte parfaitement à mon rythme et mes besoins.',
      date: '2024-11-15',
      avatarUrl: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 2,
      name: 'Marc D.',
      therapyType: 'Data Science',
      rating: 5,
      comment: 'L\'accompagnement IA est exceptionnel. J\'ai pu reconvertir ma carrière grâce aux exercices pratiques et au feedback immédiat. Je recommande vivement !',
      date: '2024-11-10',
      avatarUrl: 'https://i.pravatar.cc/150?img=2'
    },
    {
      id: 3,
      name: 'Fatima B.',
      therapyType: 'Marketing Digital',
      rating: 5,
      comment: 'Une plateforme révolutionnaire ! Le coach virtuel comprend mes difficultés et s\'adapte automatiquement. J\'ai obtenu ma certification en temps record.',
      date: '2024-10-28',
      avatarUrl: 'https://i.pravatar.cc/150?img=3'
    },
    {
      id: 4,
      name: 'Thomas L.',
      therapyType: 'Gestion de Projet',
      rating: 5,
      comment: 'J\'étais sceptique au début mais l\'IA a vraiment transformé ma façon d\'apprendre. Les simulations sont ultra-réalistes et très formatives.',
      date: '2024-10-20',
      avatarUrl: 'https://i.pravatar.cc/150?img=4'
    },
    {
      id: 5,
      name: 'Amina K.',
      therapyType: 'Intelligence Artificielle',
      rating: 5,
      comment: 'Formation complète et progressive. L\'IA détecte mes points faibles et propose automatiquement des exercices ciblés. Résultats spectaculaires !',
      date: '2024-10-15',
      avatarUrl: 'https://i.pravatar.cc/150?img=5'
    },
    {
      id: 6,
      name: 'Karim R.',
      therapyType: 'Cybersécurité',
      rating: 5,
      comment: 'Le meilleur investissement pour ma carrière. Le suivi personnalisé et les projets concrets m\'ont permis de décrocher mon poste de rêve.',
      date: '2024-10-08',
      avatarUrl: 'https://i.pravatar.cc/150?img=6'
    }
  ];

  private teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Dr. Sophie Martin',
      title: 'Experte en IA Éducative',
      specialization: ['Machine Learning', 'Pédagogie Adaptative', 'Analyse de Données'],
      bio: 'Dr. Martin dirige la conception des algorithmes d\'apprentissage adaptatif. Plus de 12 ans d\'expérience en IA appliquée à l\'éducation.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      credentials: 'PhD en Intelligence Artificielle'
    },
    {
      id: 2,
      name: 'Ahmed Benali',
      title: 'Architecte Pédagogique',
      specialization: ['Design Pédagogique', 'Gamification', 'UX Learning'],
      bio: 'Ahmed conçoit des parcours d\'apprentissage engageants et efficaces. Expert en gamification et motivation des apprenants.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      credentials: 'Master en Sciences de l\'Éducation'
    },
    {
      id: 3,
      name: 'Marie Dubois',
      title: 'Spécialiste en Analyse d\'Apprentissage',
      specialization: ['Learning Analytics', 'Data Visualization', 'KPI Formation'],
      bio: 'Marie analyse les données d\'apprentissage pour optimiser continuellement l\'efficacité de nos parcours de formation.',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
      credentials: 'PhD en Sciences des Données'
    },
    {
      id: 4,
      name: 'Jean-Luc Moreau',
      title: 'Expert en Formation Professionnelle',
      specialization: ['Développement des Compétences', 'Coaching', 'Certification'],
      bio: 'Jean-Luc accompagne les apprenants dans leur développement professionnel et la validation de leurs compétences.',
      imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      credentials: 'Certifié Coach Professionnel'
    },
    {
      id: 5,
      name: 'Nadia Khalil',
      title: 'Responsable Contenu Pédagogique',
      specialization: ['Création de Contenu', 'Multimédia', 'Accessibilité'],
      bio: 'Nadia supervise la création de contenus pédagogiques interactifs et accessibles pour tous les niveaux.',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      credentials: 'Master en Ingénierie Pédagogique'
    },
    {
      id: 6,
      name: 'Pierre Lefort',
      title: 'Développeur Senior IA',
      specialization: ['NLP', 'Chatbots', 'Systèmes Conversationnels'],
      bio: 'Pierre développe les capacités conversationnelles du coach virtuel IA pour un accompagnement naturel et efficace.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      credentials: 'Ingénieur IA & NLP'
    }
  ];

  private blogArticles: BlogArticle[] = [
    {
      id: 1,
      title: '5 Pratiques Simples pour Optimiser Votre Apprentissage avec l\'IA',
      excerpt: 'Découvrez comment tirer le meilleur parti de votre coach virtuel IA. Des astuces pratiques pour une progression rapide et efficace.',
      category: 'Conseils',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
      readTime: '5 min de lecture',
      date: '2024-12-01'
    },
    {
      id: 2,
      title: 'Comment le Machine Learning Personnalise Votre Formation',
      excerpt: 'Comprendre les algorithmes qui adaptent votre parcours en temps réel. L\'IA au service de votre développement professionnel.',
      category: 'Technologie',
      imageUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&h=400&fit=crop',
      readTime: '7 min de lecture',
      date: '2024-11-28'
    },
    {
      id: 3,
      title: 'Intégrer l\'Apprentissage Continu dans Votre Routine Quotidienne',
      excerpt: 'L\'apprentissage ne doit pas être compliqué. Découvrez comment progresser 15 minutes par jour avec votre coach IA.',
      category: 'Productivité',
      imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop',
      readTime: '6 min de lecture',
      date: '2024-11-20'
    }
  ];

  private statistics: Statistic[] = [
    { label: 'Apprenants Actifs', value: '5000+', icon: 'school' },
    { label: 'Parcours Disponibles', value: '150+', icon: 'auto_stories' },
    { label: 'Taux de Réussite', value: '94%', icon: 'emoji_events' }
  ];

  private currentUser: User = {
    name: 'Sophie Leroux',
    email: 'sophie.leroux@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=10',
    joinDate: '2024-01-15',
    coursesCompleted: 12,
    hoursStudied: 186
  };

  constructor() { }

  getTherapyServices(): Observable<TherapyService[]> {
    return of(this.therapyServices);
  }

  getTestimonials(): Observable<Testimonial[]> {
    return of(this.testimonials);
  }

  getTeamMembers(): Observable<TeamMember[]> {
    return of(this.teamMembers);
  }

  getBlogArticles(): Observable<BlogArticle[]> {
    return of(this.blogArticles);
  }

  getStatistics(): Observable<Statistic[]> {
    return of(this.statistics);
  }

  getCurrentUser(): Observable<User> {
    return of(this.currentUser);
  }
}





