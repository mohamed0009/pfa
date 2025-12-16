import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { Course, Enrollment } from '../../models/course.interfaces';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="course-details-page" *ngIf="course">
      <!-- Header avec image -->
      <div class="course-header">
        <div class="header-content">
          <div class="header-text">
            <!-- Breadcrumb -->
            <div class="breadcrumb">
              <a [routerLink]="['/user/courses']">Cours</a>
              <span class="material-icons">chevron_right</span>
              <span>{{ course.category }}</span>
              <span class="material-icons">chevron_right</span>
              <span>{{ course.title }}</span>
            </div>

            <h1>{{ course.title }}</h1>
            <p class="subtitle">{{ course.subtitle }}</p>

            <!-- Meta info -->
            <div class="course-meta">
              <div class="meta-item">
                <span class="material-icons">star</span>
                <span>{{ course.rating }}</span>
                <span class="reviews">({{ course.reviewsCount }} avis)</span>
              </div>
              <div class="meta-item">
                <span class="material-icons">people</span>
                <span>{{ formatNumber(course.enrolledCount) }} inscrits</span>
              </div>
              <div class="meta-item">
                <span class="material-icons">schedule</span>
                <span>{{ course.duration }}</span>
              </div>
              <div class="meta-item">
                <span class="level-badge" [class]="'level-' + course.level.toLowerCase()">
                  {{ course.level }}
                </span>
              </div>
            </div>

            <!-- Instructor -->
            <div class="instructor-info">
              <img [src]="course.instructorAvatar" [alt]="course.instructorName">
              <div>
                <p class="instructor-label">Formateur</p>
                <p class="instructor-name">{{ course.instructorName }}</p>
                <p class="instructor-title">{{ course.instructorTitle }}</p>
              </div>
            </div>
          </div>

          <div class="header-sidebar">
            <div class="enrollment-card">
              <div class="course-thumbnail-large">
                <img [src]="course.thumbnailUrl" [alt]="course.title">
              </div>

              <div class="enrollment-content">
                <div class="price-section">
                  <span class="price" *ngIf="course.price === 0">Gratuit</span>
                  <span class="price" *ngIf="course.price > 0">{{ course.price }}€</span>
                </div>

                <button 
                  class="btn btn-enroll" 
                  *ngIf="!isEnrolled"
                  (click)="enrollNow()">
                  <span class="material-icons">play_circle</span>
                  S'inscrire gratuitement
                </button>

                <button 
                  class="btn btn-continue" 
                  *ngIf="isEnrolled"
                  (click)="continueCourse()">
                  <span class="material-icons">play_arrow</span>
                  Continuer le cours
                </button>

                <div class="enrollment-details" *ngIf="isEnrolled && enrollment">
                  <div class="progress-info">
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="enrollment.progress.overallProgress"></div>
                    </div>
                    <p>{{ enrollment.progress.overallProgress }}% complété</p>
                  </div>
                </div>

                <div class="includes">
                  <h4>Ce cours inclut :</h4>
                  <ul>
                    <li>
                      <span class="material-icons">ondemand_video</span>
                      {{ course.estimatedHours }} heures de vidéo
                    </li>
                    <li>
                      <span class="material-icons">quiz</span>
                      Quiz et exercices pratiques
                    </li>
                    <li>
                      <span class="material-icons">psychology</span>
                      Coach IA personnel
                    </li>
                    <li *ngIf="course.isCertified">
                      <span class="material-icons">workspace_premium</span>
                      Certificat à l'issue
                    </li>
                    <li>
                      <span class="material-icons">all_inclusive</span>
                      Accès illimité
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-container">
        <div class="tabs">
          <button 
            class="tab" 
            [class.active]="activeTab === 'overview'"
            (click)="activeTab = 'overview'">
            Présentation
          </button>
          <button 
            class="tab" 
            [class.active]="activeTab === 'syllabus'"
            (click)="activeTab = 'syllabus'">
            Programme
          </button>
          <button 
            class="tab" 
            [class.active]="activeTab === 'instructor'"
            (click)="activeTab = 'instructor'">
            Formateur
          </button>
          <button 
            class="tab" 
            [class.active]="activeTab === 'reviews'"
            (click)="activeTab = 'reviews'">
            Avis
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="content-container">
        <!-- Overview Tab -->
        <div class="tab-content" *ngIf="activeTab === 'overview'">
          <section class="section">
            <h2>À propos de ce cours</h2>
            <p class="description">{{ course.longDescription }}</p>
          </section>

          <section class="section">
            <h2>Compétences que vous allez acquérir</h2>
            <div class="skills-grid">
              <span class="skill-badge" *ngFor="let skill of course.skills">
                {{ skill }}
              </span>
            </div>
          </section>

          <section class="section">
            <h2>Objectifs d'apprentissage</h2>
            <ul class="objectives-list">
              <li *ngFor="let objective of course.learningObjectives">
                <span class="material-icons">check_circle</span>
                {{ objective }}
              </li>
            </ul>
          </section>

          <section class="section" *ngIf="course.prerequisites.length > 0">
            <h2>Prérequis</h2>
            <ul class="prerequisites-list">
              <li *ngFor="let prereq of course.prerequisites">
                <span class="material-icons">info</span>
                {{ prereq }}
              </li>
            </ul>
          </section>
        </div>

        <!-- Syllabus Tab -->
        <div class="tab-content" *ngIf="activeTab === 'syllabus'">
          <section class="section">
            <h2>Programme du cours</h2>
            <p>{{ course.syllabus.length }} modules • Environ {{ course.estimatedHours }} heures</p>
            
            <div class="syllabus-list">
              <div class="module-item" *ngFor="let module of course.syllabus; let i = index">
                <button class="module-header" (click)="toggleModule(i)">
                  <div class="module-info">
                    <span class="material-icons">
                      {{ expandedModules.has(i) ? 'expand_less' : 'expand_more' }}
                    </span>
                    <div>
                      <h3>Module {{ module.moduleNumber }} : {{ module.title }}</h3>
                      <p>{{ module.description }}</p>
                    </div>
                  </div>
                  <span class="module-duration">{{ module.estimatedHours }}h</span>
                </button>

                <div class="module-content" *ngIf="expandedModules.has(i)">
                  <div class="lesson-item" *ngFor="let lesson of module.lessons">
                    <span class="material-icons lesson-icon">
                      {{ getLessonIcon(lesson.type) }}
                    </span>
                    <div class="lesson-info">
                      <p class="lesson-title">{{ lesson.title }}</p>
                      <p class="lesson-meta">{{ getLessonTypeLabel(lesson.type) }} • {{ lesson.duration }} min</p>
                    </div>
                    <span class="material-icons completed-icon" *ngIf="lesson.isCompleted">
                      check_circle
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Instructor Tab -->
        <div class="tab-content" *ngIf="activeTab === 'instructor'">
          <section class="section">
            <div class="instructor-profile">
              <img [src]="course.instructorAvatar" [alt]="course.instructorName" class="instructor-avatar-large">
              <div>
                <h2>{{ course.instructorName }}</h2>
                <p class="instructor-title-large">{{ course.instructorTitle }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- Reviews Tab -->
        <div class="tab-content" *ngIf="activeTab === 'reviews'">
          <section class="section">
            <h2>Avis des apprenants</h2>
            <div class="rating-summary">
              <div class="rating-score">
                <span class="score">{{ course.rating }}</span>
                <div>
                  <div class="stars">
                    <span class="material-icons" *ngFor="let star of [1,2,3,4,5]">
                      {{ star <= course.rating ? 'star' : 'star_border' }}
                    </span>
                  </div>
                  <p>{{ course.reviewsCount }} avis</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-state" *ngIf="!course">
      <div class="spinner"></div>
      <p>Chargement du cours...</p>
    </div>
  `,
  styles: [`
    @import '../../../../styles/variables';

    .course-details-page {
      min-height: 100vh;
    }

    // Course Header
    .course-header {
      background: linear-gradient(135deg, $dark-bg 0%, lighten($dark-bg, 10%) 100%);
      color: white;
      padding: 48px 32px;
      margin: -32px -32px 0 -32px;

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 48px;
      }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        margin-bottom: 20px;
        opacity: 0.9;

        a {
          color: white;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }

        .material-icons {
          font-size: 18px;
        }
      }

      h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 16px;
        line-height: 1.2;
      }

      .subtitle {
        font-size: 1.25rem;
        opacity: 0.9;
        margin-bottom: 24px;
      }

      .course-meta {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        margin-bottom: 32px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.95rem;

          .material-icons {
            font-size: 20px;
          }

          .reviews {
            opacity: 0.8;
          }

          .level-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;

            &.level-débutant {
              background: rgba(16, 185, 129, 0.2);
              color: #10b981;
            }

            &.level-intermédiaire {
              background: rgba(245, 158, 11, 0.2);
              color: #f59e0b;
            }

            &.level-avancé {
              background: rgba(239, 68, 68, 0.2);
              color: #ef4444;
            }
          }
        }
      }

      .instructor-info {
        display: flex;
        align-items: center;
        gap: 16px;

        img {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .instructor-label {
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .instructor-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 4px 0;
        }

        .instructor-title {
          font-size: 0.9rem;
          opacity: 0.8;
        }
      }
    }

    // Enrollment Card (Coursera-style sidebar)
    .enrollment-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      position: sticky;
      top: 90px;

      .course-thumbnail-large {
        width: 100%;
        height: 200px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .enrollment-content {
        padding: 24px;

        .price-section {
          margin-bottom: 20px;

          .price {
            font-size: 2rem;
            font-weight: 700;
            color: $primary-blue;
          }
        }

        .btn {
          width: 100%;
          padding: 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          margin-bottom: 16px;

          .material-icons {
            font-size: 24px;
          }

          &.btn-enroll {
            background: $primary-blue;
            color: white;

            &:hover {
              background: darken($primary-blue, 10%);
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba($primary-blue, 0.3);
            }
          }

          &.btn-continue {
            background: #10b981;
            color: white;

            &:hover {
              background: darken(#10b981, 10%);
            }
          }
        }

        .progress-info {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid $light-bg;

          .progress-bar {
            height: 8px;
            background: $light-bg;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 8px;

            .progress-fill {
              height: 100%;
              background: $primary-blue;
              transition: width 0.3s ease;
            }
          }

          p {
            font-size: 0.9rem;
            color: $text-secondary;
          }
        }

        .includes {
          h4 {
            font-size: 1rem;
            font-weight: 600;
            color: $dark-text;
            margin-bottom: 16px;
          }

          ul {
            list-style: none;
            padding: 0;
            margin: 0;

            li {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 10px 0;
              font-size: 0.95rem;
              color: $text-secondary;

              .material-icons {
                color: $primary-blue;
                font-size: 20px;
              }
            }
          }
        }
      }
    }

    // Tabs
    .tabs-container {
      background: white;
      border-bottom: 1px solid $light-bg;
      position: sticky;
      top: 70px;
      z-index: 10;

      .tabs {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        gap: 8px;
        padding: 0 32px;

        .tab {
          padding: 16px 24px;
          border: none;
          background: none;
          color: $text-secondary;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          transition: color 0.3s ease;

          &:hover {
            color: $primary-blue;
          }

          &.active {
            color: $primary-blue;

            &::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: $primary-blue;
            }
          }
        }
      }
    }

    // Content Container
    .content-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 48px 32px;

      .section {
        margin-bottom: 48px;

        h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: $dark-text;
          margin-bottom: 20px;
        }

        .description {
          font-size: 1.05rem;
          line-height: 1.8;
          color: $text-secondary;
        }
      }
    }

    // Skills Grid
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .skill-badge {
        padding: 10px 20px;
        background: rgba($primary-blue, 0.1);
        color: $primary-blue;
        border-radius: 24px;
        font-weight: 600;
        font-size: 0.95rem;
      }
    }

    // Objectives List
    .objectives-list {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        align-items: start;
        gap: 12px;
        padding: 12px 0;
        font-size: 1.05rem;
        color: $text-secondary;
        line-height: 1.6;

        .material-icons {
          color: #10b981;
          font-size: 24px;
          margin-top: 2px;
        }
      }
    }

    // Prerequisites List
    .prerequisites-list {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        align-items: start;
        gap: 12px;
        padding: 12px 0;
        font-size: 1.05rem;
        color: $text-secondary;
        line-height: 1.6;

        .material-icons {
          color: $primary-blue;
          font-size: 24px;
          margin-top: 2px;
        }
      }
    }

    // Syllabus
    .syllabus-list {
      margin-top: 24px;

      .module-item {
        border: 1px solid $light-bg;
        border-radius: 12px;
        margin-bottom: 16px;
        overflow: hidden;

        .module-header {
          width: 100%;
          padding: 20px 24px;
          background: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.3s ease;

          &:hover {
            background: rgba($primary-blue, 0.02);
          }

          .module-info {
            display: flex;
            align-items: start;
            gap: 16px;
            flex: 1;

            .material-icons {
              color: $primary-blue;
              font-size: 28px;
            }

            h3 {
              font-size: 1.15rem;
              font-weight: 600;
              color: $dark-text;
              margin-bottom: 6px;
            }

            p {
              font-size: 0.95rem;
              color: $text-secondary;
            }
          }

          .module-duration {
            font-weight: 600;
            color: $text-secondary;
          }
        }

        .module-content {
          background: $light-bg;
          padding: 8px 0;

          .lesson-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px 24px 14px 68px;
            transition: background 0.3s ease;

            &:hover {
              background: rgba(white, 0.5);
            }

            .lesson-icon {
              color: $text-secondary;
              font-size: 22px;
            }

            .lesson-info {
              flex: 1;

              .lesson-title {
                font-weight: 500;
                color: $dark-text;
                margin-bottom: 4px;
              }

              .lesson-meta {
                font-size: 0.85rem;
                color: $text-secondary;
              }
            }

            .completed-icon {
              color: #10b981;
              font-size: 22px;
            }
          }
        }
      }
    }

    // Instructor Profile
    .instructor-profile {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 24px;
      background: $light-bg;
      border-radius: 12px;

      .instructor-avatar-large {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
      }

      h2 {
        margin: 0 0 8px !important;
      }

      .instructor-title-large {
        color: $text-secondary;
        font-size: 1.05rem;
      }
    }

    // Rating Summary
    .rating-summary {
      padding: 24px;
      background: $light-bg;
      border-radius: 12px;

      .rating-score {
        display: flex;
        align-items: center;
        gap: 24px;

        .score {
          font-size: 4rem;
          font-weight: 700;
          color: $primary-blue;
        }

        .stars {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;

          .material-icons {
            color: #FFB800;
            font-size: 28px;
          }
        }

        p {
          color: $text-secondary;
        }
      }
    }

    // Loading State
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 20px;

      .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid rgba($primary-blue, 0.2);
        border-top-color: $primary-blue;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      }

      p {
        color: $text-secondary;
        font-size: 1rem;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    // Responsive
    @media (max-width: 968px) {
      .course-header .header-content {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .enrollment-card {
        position: relative;
        top: 0;
      }

      .content-container {
        padding: 32px 20px;
      }
    }
  `]
})
export class CourseDetailsComponent implements OnInit {
  course: Course | null = null;
  enrollment: Enrollment | null = null;
  isEnrolled: boolean = false;
  activeTab: string = 'overview';
  expandedModules: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursesService: CoursesService
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
      this.checkEnrollment(courseId);
    }
  }

  loadCourse(courseId: string): void {
    this.coursesService.getCourseById(courseId).subscribe(course => {
      if (course) {
        this.course = course;
      }
    });
  }

  checkEnrollment(courseId: string): void {
    this.coursesService.getEnrollmentByCourseId(courseId).subscribe(enrollment => {
      if (enrollment) {
        this.isEnrolled = true;
        this.enrollment = enrollment;
      }
    });
  }

  enrollNow(): void {
    if (this.course) {
      this.coursesService.enrollInCourse(this.course.id).subscribe(enrollment => {
        this.isEnrolled = true;
        this.enrollment = enrollment;
        // Rediriger vers le lecteur de cours
        this.router.navigate(['/user/course-player', this.course!.id]);
      });
    }
  }

  continueCourse(): void {
    if (this.course) {
      this.router.navigate(['/user/course-player', this.course.id]);
    }
  }

  toggleModule(index: number): void {
    if (this.expandedModules.has(index)) {
      this.expandedModules.delete(index);
    } else {
      this.expandedModules.add(index);
    }
  }

  getLessonIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'video': 'play_circle',
      'lecture': 'description',
      'quiz': 'quiz',
      'exercise': 'edit_note',
      'ai-chat': 'psychology'
    };
    return icons[type] || 'article';
  }

  getLessonTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'video': 'Vidéo',
      'lecture': 'Lecture',
      'quiz': 'Quiz',
      'exercise': 'Exercice',
      'ai-chat': 'Interaction IA'
    };
    return labels[type] || 'Leçon';
  }

  formatNumber(num: number): string {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}k+`;
    }
    return num.toString();
  }
}




