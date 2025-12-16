import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CoursesAdminService } from '../../../services/courses-admin.service';
import { Course } from '../../../models/admin.interfaces';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Courses Management</h1>
        <button class="btn btn-primary">
          <span class="material-icons">add</span>
          Create Course
        </button>
      </div>

      <div class="courses-grid">
        <div class="course-card" *ngFor="let course of courses">
          <div class="course-content">
            <span class="status-badge" [attr.data-status]="course.status">{{ course.status }}</span>
            <h3>{{ course.title }}</h3>
            <p>{{ course.description }}</p>
            <div class="course-meta">
              <span><span class="material-icons">schedule</span> {{ course.duration }} min</span>
              <span><span class="material-icons">people</span> {{ course.enrolledStudents }}</span>
            </div>
            <button class="btn-view" [routerLink]="['/admin/courses', course.id]">View Details</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../../styles/variables';
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      
      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: $dark-text;
      }
      
      .btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        background: $primary-green;
        color: white;
        transition: all 0.3s ease;
        
        &:hover {
          background: darken($primary-green, 8%);
          transform: translateY(-2px);
        }
      }
    }
    
    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    
    .course-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }
      
      .course-content {
        padding: 24px;
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 12px;
          
          &[data-status="published"] {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
          }
          
          &[data-status="draft"] {
            background: rgba(251, 191, 36, 0.1);
            color: #f59e0b;
          }
        }
        
        h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: $dark-text;
          margin-bottom: 12px;
        }
        
        p {
          color: $text-secondary;
          font-size: 0.9rem;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .course-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          
          span {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.85rem;
            color: $text-secondary;
            
            .material-icons {
              font-size: 18px;
            }
          }
        }
        
        .btn-view {
          width: 100%;
          padding: 10px;
          background: $primary-green;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            background: darken($primary-green, 8%);
          }
        }
      }
    }
  `]
})
export class CoursesListComponent implements OnInit {
  courses: Course[] = [];

  constructor(private coursesService: CoursesAdminService) {}

  ngOnInit(): void {
    this.coursesService.getCourses().subscribe(courses => {
      this.courses = courses;
    });
  }
}





