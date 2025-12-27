import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CoursesService } from './courses.service';
import { Course, Enrollment, CourseProgress } from '../models/course.interfaces';

describe('CoursesService', () => {
  let service: CoursesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CoursesService]
    });

    service = TestBed.inject(CoursesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCourses', () => {
    it('should fetch courses successfully', (done) => {
      const mockCourses = [
        {
          id: 'c1',
          title: 'Test Course',
          description: 'Test Description',
          level: 'DEBUTANT',
          category: 'Test'
        }
      ];

      service.getCourses().subscribe({
        next: (courses: Course[]) => {
          expect(courses).toBeTruthy();
          expect(Array.isArray(courses)).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/courses');
      expect(req.request.method).toBe('GET');
      req.flush(mockCourses);
    });

    it('should handle error and return empty array', (done) => {
      service.getCourses().subscribe({
        next: (courses: Course[]) => {
          expect(courses).toEqual([]);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/courses');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getCourseById', () => {
    it('should fetch course by id successfully', (done) => {
      const mockCourse = {
        id: 'c1',
        title: 'Test Course',
        level: 'DEBUTANT'
      };

      service.getCourseById('c1').subscribe({
        next: (course: Course | undefined) => {
          expect(course).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/courses/c1');
      expect(req.request.method).toBe('GET');
      req.flush(mockCourse);
    });

    it('should handle error and return fallback course', (done) => {
      service.getCourseById('c1').subscribe({
        next: (course: Course | undefined) => {
          expect(course).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/courses/c1');
      req.flush({ message: 'Error' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getCourseSyllabus', () => {
    it('should fetch course syllabus successfully', (done) => {
      const mockSyllabus = [
        {
          id: 'm1',
          courseId: 'c1',
          moduleNumber: 1,
          title: 'Module 1',
          lessons: []
        }
      ];

      service.getCourseSyllabus('c1').subscribe({
        next: (modules) => {
          expect(modules).toBeTruthy();
          expect(Array.isArray(modules)).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/courses/c1/syllabus');
      expect(req.request.method).toBe('GET');
      req.flush(mockSyllabus);
    });

    it('should handle error and return empty array', (done) => {
      service.getCourseSyllabus('c1').subscribe({
        next: (modules) => {
          expect(modules).toEqual([]);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/courses/c1/syllabus');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('enrollInCourse', () => {
    it('should enroll in course successfully', (done) => {
      const mockEnrollment = {
        id: 'e1',
        userId: 'u1',
        course: { id: 'c1' },
        status: 'ACTIVE',
        enrolledAt: '2024-12-25'
      };

      service.enrollInCourse('c1').subscribe({
        next: (enrollment: Enrollment) => {
          expect(enrollment).toBeTruthy();
          expect(enrollment.courseId).toBe('c1');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/enrollments/c1');
      expect(req.request.method).toBe('POST');
      req.flush(mockEnrollment);
    });

    it('should handle error when enrolling', (done) => {
      service.enrollInCourse('c1').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/enrollments/c1');
      req.flush({ message: 'Error' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getMyEnrollments', () => {
    it('should fetch enrollments successfully', (done) => {
      const mockEnrollments = [
        {
          id: 'e1',
          user: { id: 'u1' },
          course: { id: 'c1' },
          status: 'ACTIVE',
          enrolledAt: '2024-12-25'
        }
      ];

      service.getMyEnrollments().subscribe({
        next: (enrollments: Enrollment[]) => {
          expect(enrollments).toBeTruthy();
          expect(Array.isArray(enrollments)).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/enrollments');
      expect(req.request.method).toBe('GET');
      req.flush(mockEnrollments);
    });

    it('should handle error and return fallback enrollments', (done) => {
      service.getMyEnrollments().subscribe({
        next: (enrollments: Enrollment[]) => {
          expect(enrollments).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/enrollments');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('isEnrolled', () => {
    it('should return true if enrolled', (done) => {
      const mockEnrollments = [
        {
          id: 'e1',
          user: { id: 'u1' },
          course: { id: 'c1' },
          status: 'ACTIVE'
        }
      ];

      service.isEnrolled('c1').subscribe({
        next: (isEnrolled: boolean) => {
          expect(isEnrolled).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/user/enrollments');
      req.flush(mockEnrollments);
    });
  });

  describe('searchCourses', () => {
    it('should search courses by query', (done) => {
      const mockCourses = [
        { id: 'c1', title: 'Angular Course', description: 'Learn Angular' }
      ];

      service.searchCourses('angular').subscribe({
        next: (courses: Course[]) => {
          expect(courses).toBeTruthy();
          expect(Array.isArray(courses)).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/courses');
      req.flush(mockCourses);
    });
  });
});

