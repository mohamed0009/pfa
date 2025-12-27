import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LearningPathService } from './learning-path.service';
import { LearningPath, LearningModule, Lesson, Recommendation } from '../models/user.interfaces';

describe('LearningPathService', () => {
  let service: LearningPathService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LearningPathService]
    });

    service = TestBed.inject(LearningPathService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLearningPath', () => {
    it('should fetch learning path successfully', (done) => {
      service.getLearningPath().subscribe({
        next: (path: LearningPath) => {
          expect(path).toBeTruthy();
          expect(path.id).toBeTruthy();
          expect(path.userId).toBeTruthy();
          expect(path.formation).toBeTruthy();
          expect(path.modules).toBeTruthy();
          expect(Array.isArray(path.modules)).toBeTrue();
          expect(path.progressPercentage).toBeGreaterThanOrEqual(0);
          expect(path.progressPercentage).toBeLessThanOrEqual(100);
          done();
        }
      });
    });
  });

  describe('getModule', () => {
    it('should fetch module by id successfully', (done) => {
      service.getModule('mod1').subscribe({
        next: (module) => {
          expect(module).toBeTruthy();
          if (module) {
            expect(module.id).toBe('mod1');
            expect(module.title).toBeTruthy();
            expect(module.lessons).toBeTruthy();
            expect(Array.isArray(module.lessons)).toBeTrue();
          }
          done();
        }
      });
    });

    it('should return undefined for non-existent module', (done) => {
      service.getModule('non-existent').subscribe({
        next: (module) => {
          expect(module).toBeUndefined();
          done();
        }
      });
    });
  });

  describe('getLesson', () => {
    it('should fetch lesson by id successfully', (done) => {
      service.getLesson('lesson1').subscribe({
        next: (lesson) => {
          expect(lesson).toBeTruthy();
          if (lesson) {
            expect(lesson.id).toBe('lesson1');
            expect(lesson.title).toBeTruthy();
            expect(lesson.moduleId).toBeTruthy();
          }
          done();
        }
      });
    });

    it('should return undefined for non-existent lesson', (done) => {
      service.getLesson('non-existent').subscribe({
        next: (lesson) => {
          expect(lesson).toBeUndefined();
          done();
        }
      });
    });
  });

  describe('getRecommendations', () => {
    it('should fetch recommendations successfully', (done) => {
      service.getRecommendations().subscribe({
        next: (recommendations: Recommendation[]) => {
          expect(recommendations).toBeTruthy();
          expect(Array.isArray(recommendations)).toBeTrue();
          if (recommendations.length > 0) {
            expect(recommendations[0].id).toBeTruthy();
            expect(recommendations[0].title).toBeTruthy();
          }
          done();
        }
      });
    });
  });

  describe('getNextLesson', () => {
    it('should fetch next lesson successfully', (done) => {
      service.getNextLesson().subscribe({
        next: (lesson) => {
          if (lesson) {
            expect(lesson.id).toBeTruthy();
            expect(lesson.title).toBeTruthy();
            expect(lesson.moduleId).toBeTruthy();
          }
          done();
        }
      });
    });
  });
});

