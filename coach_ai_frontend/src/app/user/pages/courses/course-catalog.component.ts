import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../../services/courses.service';
import { Course, Enrollment } from '../../models/course.interfaces';

@Component({
  selector: 'app-course-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="catalog-page">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1>Explorez notre catalogue de formations</h1>
          <p>Développez vos compétences avec des cours en ligne guidés par un coach IA</p>
          
          <!-- Search Bar -->
          <div class="search-container">
            <span class="material-icons">search</span>
            <input 
              type="text" 
              placeholder="Rechercher un cours, une compétence, un formateur..."
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
            >
          </div>

          <!-- Filters -->
          <div class="filter-chips">
            <button 
              class="chip" 
              [class.active]="selectedCategory === 'all'"
              (click)="filterByCategory('all')">
              Tous les cours
            </button>
            <button 
              class="chip"
              [class.active]="selectedCategory === 'Développement'"
              (click)="filterByCategory('Développement')">
              Développement
            </button>
            <button 
              class="chip"
              [class.active]="selectedCategory === 'Data Science'"
              (click)="filterByCategory('Data Science')">
              Data Science
            </button>
            <button 
              class="chip"
              [class.active]="selectedCategory === 'Business'"
              (click)="filterByCategory('Business')">
              Business
            </button>
          </div>
        </div>
      </div>

      <!-- My Courses Section (if enrolled) -->
      <section class="my-courses-section" *ngIf="myEnrollments.length > 0">
        <h2>Mes cours en cours</h2>
        <div class="courses-grid">
          <div 
            class="course-card enrolled-card" 
            *ngFor="let enrollment of myEnrollments"
            (click)="goToCourse(enrollment.courseId)">
            <div class="course-thumbnail">
              <img [src]="getCourseById(enrollment.courseId)?.thumbnailUrl" alt="Course">
              <div class="progress-overlay">
                <div class="progress-circle-small">
                  <span>{{ enrollment.progress.overallProgress }}%</span>
                </div>
              </div>
            </div>
            <div class="course-content">
              <h3>{{ getCourseById(enrollment.courseId)?.title }}</h3>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="enrollment.progress.overallProgress"></div>
              </div>
              <p class="progress-text">
                {{ enrollment.progress.completedLessons }} / {{ enrollment.progress.totalLessons }} leçons complétées
              </p>
              <button class="btn btn-primary">Continuer</button>
            </div>
          </div>
        </div>
      </section>

      <!-- All Courses Section -->
      <section class="all-courses-section">
        <div class="section-header">
          <h2>{{ getSectionTitle() }}</h2>
          <p>{{ filteredCourses.length }} {{ filteredCourses.length > 1 ? 'cours disponibles' : 'cours disponible' }}</p>
        </div>

        <div class="courses-grid">
          <div 
            class="course-card" 
            *ngFor="let course of filteredCourses"
            (click)="viewCourseDetails(course.id)">
            <!-- Thumbnail -->
            <div class="course-thumbnail">
              <img [src]="course.thumbnailUrl" [alt]="course.title">
              <div class="course-badge" *ngIf="course.isPopular">
                <span class="material-icons">star</span>
                Populaire
              </div>
            </div>

            <!-- Content -->
            <div class="course-content">
              <div class="course-meta">
                <span class="level-badge" [class]="'level-' + course.level.toLowerCase()">
                  {{ course.level }}
                </span>
                <span class="category">{{ course.category }}</span>
              </div>

              <h3>{{ course.title }}</h3>
              <p class="course-subtitle">{{ course.subtitle }}</p>

              <div class="course-instructor">
                <img [src]="course.instructorAvatar" [alt]="course.instructorName">
                <div>
                  <p class="instructor-name">{{ course.instructorName }}</p>
                  <p class="instructor-title">{{ course.instructorTitle }}</p>
                </div>
              </div>

              <div class="course-stats">
                <div class="stat">
                  <span class="material-icons">star</span>
                  <span>{{ course.rating }}</span>
                  <span class="count">({{ course.reviewsCount }})</span>
                </div>
                <div class="stat">
                  <span class="material-icons">people</span>
                  <span>{{ formatNumber(course.enrolledCount) }}</span>
                </div>
                <div class="stat">
                  <span class="material-icons">schedule</span>
                  <span>{{ course.duration }}</span>
                </div>
              </div>

              <div class="course-footer">
                <span class="price" *ngIf="course.price === 0">Gratuit</span>
                <span class="price" *ngIf="course.price > 0">{{ course.price }}€</span>
                <button class="btn btn-outline" (click)="viewCourseDetails(course.id); $event.stopPropagation()">
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredCourses.length === 0">
          <span class="material-icons">search_off</span>
          <h3>Aucun cours trouvé</h3>
          <p>Essayez de modifier vos critères de recherche</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    @import '../../../../styles/variables';

    .catalog-page {
      min-height: 100vh;
      background: $coursera-white;
    }

    // Hero Section (Green Background)
    .hero-section {
      background: linear-gradient(135deg, #01996d 0%, darken(#01996d, 8%) 100%);
      color: white;
      padding: 56px 24px 48px;
      margin-bottom: 56px;

      .hero-content {
        max-width: 1440px;
        margin: 0 auto;

        h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: white;
          letter-spacing: -0.02em;
        }

        > p {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 32px;
        }
      }
    }

    // Search Container (Refined)
    .search-container {
      max-width: 680px;
      display: flex;
      align-items: center;
      gap: 14px;
      background: $coursera-white;
      padding: 14px 24px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(45, 212, 164, 0.05);
      border: 1px solid $coursera-border;
      transition: all $transition-fast;

      &:focus-within {
        border-color: $primary-green;
        box-shadow: 0 2px 8px rgba(45, 212, 164, 0.15);
      }

      .material-icons {
        color: $primary-green;
        font-size: 22px;
      }

      input {
        flex: 1;
        border: none;
        outline: none;
        font-size: $font-size-base;
        font-family: $font-primary;
        color: $coursera-text;

        &::placeholder {
          color: $coursera-text-muted;
        }
      }
    }

    // Filter Chips (Refined with Green Accent)
    .filter-chips {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      .chip {
        padding: 8px 18px;
        border-radius: 20px;
        border: 1px solid $coursera-border;
        background: $coursera-white;
        color: $coursera-text;
        font-weight: $font-weight-semibold;
        font-size: $font-size-sm;
        cursor: pointer;
        transition: all $transition-fast;

        &:hover {
          background: rgba(45, 212, 164, 0.08);
          border-color: $primary-green;
          color: $primary-green;
        }

        &.active {
          background: $primary-green;
          color: white;
          border-color: $primary-green;
        }
      }
    }

    // My Courses Section (Perfect Alignment)
    .my-courses-section {
      max-width: 1440px;
      margin: 0 auto 56px;
      padding: 0 24px;

      h2 {
        font-size: 1.75rem;
        font-weight: $font-weight-bold;
        color: $coursera-text;
        margin-bottom: 24px;
        letter-spacing: -0.01em;
      }

      .enrolled-card {
        cursor: pointer;

        .progress-overlay {
          position: absolute;
          top: 12px;
          right: 12px;
          background: white;
          border-radius: 50%;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .progress-circle-small {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: conic-gradient($primary-blue var(--progress), $light-bg 0);
          font-weight: 700;
          font-size: 0.85rem;
          color: $primary-blue;
        }

        .progress-bar {
          height: 8px;
          background: $light-bg;
          border-radius: 8px;
          overflow: hidden;
          margin: 12px 0;

          .progress-fill {
            height: 100%;
            background: $primary-blue;
            transition: width 0.3s ease;
          }
        }

        .progress-text {
          font-size: 0.9rem;
          color: $text-secondary;
          margin-bottom: 12px;
        }
      }
    }

    // All Courses Section (Same Alignment as My Courses)
    .all-courses-section {
      max-width: 1440px;
      margin: 0 auto 48px;
      padding: 0 24px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;

        h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: $dark-text;
        }

        p {
          color: $text-secondary;
          font-size: 1rem;
        }
      }
    }

    // Courses Grid (Perfect Alignment)
    .courses-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 48px;

      @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    // Course Card (EXACT Coursera Replica)
    .course-card {
      background: $coursera-white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      border: 1px solid $coursera-border;
      transition: all $transition-fast;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      height: 100%;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: $coursera-text-muted;
      }

      .course-thumbnail {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .course-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255, 193, 7, 0.95);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;

          .material-icons {
            font-size: 16px;
          }
        }
      }

      .course-content {
        padding: 20px;
        flex: 1;
        display: flex;
        flex-direction: column;

        .course-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;

          .level-badge {
            padding: 4px 12px;
            border-radius: 16px;
            font-size: $font-size-xs;
            font-weight: $font-weight-semibold;

            &.level-débutant {
              background: rgba(45, 212, 164, 0.1);
              color: $primary-green;
            }

            &.level-intermédiaire {
              background: rgba(245, 158, 11, 0.1);
              color: #f59e0b;
            }

            &.level-avancé {
              background: rgba(99, 102, 241, 0.1);
              color: #6366f1;
            }
          }

          .category {
            padding: 4px 12px;
            background: rgba(107, 107, 107, 0.08);
            color: $coursera-text-secondary;
            border-radius: 16px;
            font-size: $font-size-xs;
            font-weight: $font-weight-semibold;
          }
        }

        h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: $dark-text;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .course-subtitle {
          font-size: 0.9rem;
          color: $text-secondary;
          margin-bottom: 16px;
          line-height: 1.5;
          flex: 1;
        }

        .course-instructor {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid $light-bg;

          img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
          }

          .instructor-name {
            font-weight: $font-weight-semibold;
            color: $coursera-text;
            font-size: $font-size-sm;
          }

          .instructor-title {
            font-size: $font-size-xs;
            color: $coursera-text-secondary;
          }
        }

        .course-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;

          .stat {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: $font-size-sm;
            color: $coursera-text-secondary;

            .material-icons {
              font-size: 16px;
              color: $coursera-star;
            }

            .count {
              color: $coursera-text-muted;
            }
          }
        }

        .course-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .price {
            font-size: $font-size-lg;
            font-weight: $font-weight-bold;
            color: $coursera-text;
          }
        }
      }
    }

    // Buttons (Green Accent)
    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: $font-weight-semibold;
      cursor: pointer;
      transition: all $transition-fast;
      border: none;
      font-size: $font-size-sm;
      font-family: $font-primary;

      &.btn-primary {
        background: $primary-green;
        color: white;
        box-shadow: 0 1px 2px rgba(45, 212, 164, 0.2);

        &:hover {
          background: darken($primary-green, 8%);
          box-shadow: 0 2px 8px rgba(45, 212, 164, 0.3);
          transform: translateY(-1px);
        }
      }

      &.btn-outline {
        background: transparent;
        border: 1.5px solid $coursera-border;
        color: $coursera-text;
        padding: 8.5px 19px;

        &:hover {
          background: $coursera-white;
          border-color: $primary-green;
          color: $primary-green;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
      }
    }

    // Empty State
    .empty-state {
      text-align: center;
      padding: 80px 20px;

      .material-icons {
        font-size: 80px;
        color: $text-muted;
        margin-bottom: 24px;
      }

      h3 {
        font-size: 1.5rem;
        color: $dark-text;
        margin-bottom: 12px;
      }

      p {
        color: $text-secondary;
      }
    }

    // Responsive
    @media (max-width: 768px) {
      .hero-section {
        padding: 40px 20px;

        .hero-content h1 {
          font-size: 1.75rem;
        }

        .hero-content > p {
          font-size: 1rem;
        }
      }

      .courses-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class CourseCatalogComponent implements OnInit {
  allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  myEnrollments: Enrollment[] = [];
  searchQuery: string = '';
  selectedCategory: string = 'all';

  constructor(
    private coursesService: CoursesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadEnrollments();
  }

  loadCourses(): void {
    console.log('Loading courses...');
    this.coursesService.getCourses().subscribe({
      next: (courses) => {
        console.log('Courses loaded:', courses);
        this.allCourses = courses;
        this.filteredCourses = courses;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.allCourses = [];
        this.filteredCourses = [];
      }
    });
  }

  loadEnrollments(): void {
    this.coursesService.getMyEnrollments().subscribe(enrollments => {
      this.myEnrollments = enrollments;
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allCourses];

    // Filtre par catégorie
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === this.selectedCategory);
    }

    // Filtre par recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.instructorName.toLowerCase().includes(query)
      );
    }

    this.filteredCourses = filtered;
  }

  viewCourseDetails(courseId: string): void {
    this.router.navigate(['/user/courses', courseId]);
  }

  goToCourse(courseId: string): void {
    this.router.navigate(['/user/course-player', courseId]);
  }

  getCourseById(courseId: string): Course | undefined {
    return this.allCourses.find(c => c.id === courseId);
  }

  getSectionTitle(): string {
    if (this.selectedCategory !== 'all') {
      return `Cours de ${this.selectedCategory}`;
    }
    return 'Tous les cours disponibles';
  }

  formatNumber(num: number): string {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}k+`;
    }
    return num.toString();
  }
}




