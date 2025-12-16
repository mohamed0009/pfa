import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CoursesAdminService } from '../../../services/courses-admin.service';
import { Course } from '../../../models/admin.interfaces';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container" *ngIf="course">
      <button class="btn-back" routerLink="/admin/courses">
        <span class="material-icons">arrow_back</span>
        Back to Courses
      </button>

      <div class="course-header">
        <h1>{{ course.title }}</h1>
        <p>{{ course.description }}</p>
        <div class="course-info">
          <p><strong>Durée:</strong> {{ course.duration }} min</p>
          <p><strong>Statut:</strong> {{ course.status }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../../styles/variables';
    
    .btn-back {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      color: $primary-green;
      font-weight: 600;
      cursor: pointer;
      padding: 8px 16px;
      margin-bottom: 24px;
      
      &:hover {
        background: rgba($primary-green, 0.1);
      }
    }
    
    .course-header {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      
      .course-info {
        margin-top: 20px;
        
        p {
          margin-bottom: 8px;
        }
      }
      
      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: $dark-text;
        margin-bottom: 12px;
      }
      
      p {
        color: $text-secondary;
        margin-bottom: 16px;
      }
    }
  `]
})
export class CourseDetailsComponent implements OnInit {
  course: Course | null = null;

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesAdminService
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.coursesService.getCourseById(courseId).subscribe(course => {
        this.course = course || null;
      });
    }
  }
}





