import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CoursesAdminService } from './courses-admin.service';
import { Course } from '../models/admin.interfaces';

describe('CoursesAdminService', () => {
  let service: CoursesAdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CoursesAdminService]
    });

    service = TestBed.inject(CoursesAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCourses', () => {
    it('should fetch all courses successfully', (done) => {
      const mockCourses = [
        {
          id: 'c1',
          moduleId: 'm1',
          title: 'Test Course',
          description: 'Test Description',
          status: 'approved',
          duration: 100
        }
      ];

      service.getCourses().subscribe({
        next: (courses: Course[]) => {
          expect(courses).toBeTruthy();
          expect(Array.isArray(courses)).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/courses');
      expect(req.request.method).toBe('GET');
      req.flush(mockCourses);
    });

    it('should fetch courses with status filter', (done) => {
      service.getCourses('approved').subscribe({
        next: (courses: Course[]) => {
          expect(courses).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/courses?status=approved');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should fetch courses with search query', (done) => {
      service.getCourses(undefined, 'angular').subscribe({
        next: (courses: Course[]) => {
          expect(courses).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/courses?search=angular');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle error and return fallback data', (done) => {
      service.getCourses().subscribe({
        next: (courses: Course[]) => {
          expect(courses).toBeTruthy();
          expect(Array.isArray(courses)).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/courses');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getCourseById', () => {
    it('should fetch course by id successfully', (done) => {
      const mockCourse = {
        id: 'c1',
        title: 'Test Course',
        status: 'approved'
      };

      service.getCourseById('c1').subscribe({
        next: (course: Course | undefined) => {
          expect(course).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/courses/c1');
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

      const req = httpMock.expectOne('http://localhost:8081/api/admin/courses/c1');
      req.flush({ message: 'Error' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createCourse', () => {
    it('should create course successfully', (done) => {
      const newCourse: Partial<Course> = {
        moduleId: 'm1',
        title: 'New Course',
        description: 'New Description',
        duration: 120
      };

      service.createCourse(newCourse).subscribe({
        next: (course: Course) => {
          expect(course).toBeTruthy();
          expect(course.title).toBe('New Course');
          expect(course.status).toBe('draft');
          done();
        }
      });
    });
  });

  describe('updateCourse', () => {
    it('should update course successfully', (done) => {
      const updates: Partial<Course> = {
        title: 'Updated Title'
      };

      service.updateCourse('c1', updates).subscribe({
        next: (course: Course) => {
          expect(course).toBeTruthy();
          done();
        }
      });
    });

    it('should handle error when course not found', (done) => {
      service.updateCourse('nonexistent', { title: 'Test' }).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.message).toBe('Course not found');
          done();
        }
      });
    });
  });

  describe('deleteCourse', () => {
    it('should delete course successfully', (done) => {
      service.deleteCourse('c1').subscribe({
        next: (result: boolean) => {
          expect(result).toBeTrue();
          done();
        }
      });
    });

    it('should return false if course not found', (done) => {
      service.deleteCourse('nonexistent').subscribe({
        next: (result: boolean) => {
          expect(result).toBeFalse();
          done();
        }
      });
    });
  });

  describe('publishCourse', () => {
    it('should publish course successfully', (done) => {
      service.publishCourse('c1').subscribe({
        next: (course: Course) => {
          expect(course).toBeTruthy();
          expect(course.status).toBe('approved');
          done();
        }
      });
    });
  });

  describe('searchCourses', () => {
    it('should search courses by query', (done) => {
      service.searchCourses('angular').subscribe({
        next: (courses: Course[]) => {
          expect(courses).toBeTruthy();
          expect(Array.isArray(courses)).toBeTrue();
          done();
        }
      });
    });
  });

  describe('getCourseStats', () => {
    it('should fetch course statistics successfully', (done) => {
      const mockStats = {
        enrolledStudents: 100,
        completionRate: 75,
        totalLessons: 10,
        totalResources: 5,
        status: 'approved'
      };

      service.getCourseStats('c1').subscribe({
        next: (stats) => {
          expect(stats).toBeTruthy();
          expect(stats.enrolledStudents).toBe(100);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/courses/c1/stats');
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });

    it('should handle error and return fallback stats', (done) => {
      service.getCourseStats('c1').subscribe({
        next: (stats) => {
          expect(stats).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/courses/c1/stats');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });
});

