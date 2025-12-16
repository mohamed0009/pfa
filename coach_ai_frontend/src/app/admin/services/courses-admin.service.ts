import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Course, Module, Lesson } from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CoursesAdminService {
  private courses: Course[] = [
    {
      id: 'c1',
      moduleId: 'm1',
      title: 'Advanced Angular Development',
      description: 'Master advanced Angular concepts including RxJS, state management, and performance optimization',
      content: 'Contenu du cours Angular avancé...',
      order: 1,
      status: 'approved',
      duration: 240,
      lessons: [],
      resources: [],
      enrolledStudents: 125,
      completionRate: 68,
      createdBy: 'trainer1',
      createdAt: new Date('2024-01-15'),
      validatedBy: 'admin1',
      validatedAt: new Date('2024-01-16')
    },
    {
      id: 'c2',
      moduleId: 'm2',
      title: 'Machine Learning Fundamentals',
      description: 'Learn the basics of machine learning with Python and TensorFlow',
      content: 'Contenu du cours ML...',
      order: 1,
      status: 'approved',
      duration: 210,
      lessons: [],
      resources: [],
      enrolledStudents: 200,
      completionRate: 72,
      createdBy: 'trainer2',
      createdAt: new Date('2023-11-01'),
      validatedBy: 'admin1',
      validatedAt: new Date('2023-11-02')
    },
    {
      id: 'c3',
      moduleId: 'm3',
      title: 'UX Design Masterclass',
      description: 'Complete guide to user experience design from research to prototyping',
      content: 'Contenu UX Design...',
      order: 1,
      status: 'approved',
      duration: 180,
      lessons: [],
      resources: [],
      enrolledStudents: 150,
      completionRate: 65,
      createdBy: 'trainer3',
      createdAt: new Date('2024-02-10'),
      validatedBy: 'admin1',
      validatedAt: new Date('2024-02-11')
    }
  ];

  constructor() {}

  // Get all courses
  getCourses(): Observable<Course[]> {
    return of(this.courses).pipe(delay(300));
  }

  // Get course by ID
  getCourseById(id: string): Observable<Course | undefined> {
    return of(this.courses.find(c => c.id === id)).pipe(delay(200));
  }

  // Create new course
  createCourse(course: Partial<Course>): Observable<Course> {
    const newCourse: Course = {
      id: 'c' + (this.courses.length + 1),
      moduleId: course.moduleId || '',
      title: course.title || '',
      description: course.description || '',
      content: course.content || '',
      order: course.order || 1,
      status: 'draft',
      duration: course.duration || 0,
      lessons: [],
      resources: [],
      enrolledStudents: 0,
      completionRate: 0,
      createdBy: 'current-user',
      createdAt: new Date()
    };
    this.courses.push(newCourse);
    return of(newCourse).pipe(delay(400));
  }

  // Update course
  updateCourse(id: string, updates: Partial<Course>): Observable<Course> {
    const index = this.courses.findIndex(c => c.id === id);
    if (index === -1) {
      return throwError(() => new Error('Course not found'));
    }
    this.courses[index] = { ...this.courses[index], ...updates };
    return of(this.courses[index]).pipe(delay(300));
  }

  // Delete course
  deleteCourse(id: string): Observable<boolean> {
    const index = this.courses.findIndex(c => c.id === id);
    if (index === -1) {
      return of(false);
    }
    this.courses.splice(index, 1);
    return of(true).pipe(delay(300));
  }

  // Publish course
  publishCourse(id: string): Observable<Course> {
    return this.updateCourse(id, { status: 'approved' });
  }

  // Search courses
  searchCourses(query: string): Observable<Course[]> {
    const filtered = this.courses.filter(c =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }

  // Get course statistics
  getCourseStats(courseId: string): Observable<any> {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) {
      return throwError(() => new Error('Course not found'));
    }

    return of({
      enrolledStudents: course.enrolledStudents,
      completionRate: course.completionRate,
      totalLessons: course.lessons.length,
      totalResources: course.resources.length,
      status: course.status
    }).pipe(delay(300));
  }
}




