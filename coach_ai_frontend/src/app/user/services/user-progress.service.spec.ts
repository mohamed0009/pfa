import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserProgressService } from './user-progress.service';
import { UserProgress, LearningStats, ActivityLog, Achievement } from '../models/user.interfaces';

describe('UserProgressService', () => {
  let service: UserProgressService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserProgressService]
    });

    service = TestBed.inject(UserProgressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserProgress', () => {
    it('should fetch user progress successfully', (done) => {
      service.getUserProgress().subscribe({
        next: (progress: UserProgress) => {
          expect(progress).toBeTruthy();
          expect(progress.userId).toBeTruthy();
          expect(progress.overallProgress).toBeGreaterThanOrEqual(0);
          expect(progress.modulesCompleted).toBeGreaterThanOrEqual(0);
          expect(progress.achievements).toBeTruthy();
          expect(Array.isArray(progress.achievements)).toBeTrue();
          done();
        }
      });
    });
  });

  describe('getLearningStats', () => {
    it('should fetch learning stats successfully', (done) => {
      service.getLearningStats().subscribe({
        next: (stats: LearningStats) => {
          expect(stats).toBeTruthy();
          expect(Array.isArray(stats.weeklyStudyTime)).toBeTrue();
          expect(Array.isArray(stats.moduleProgress)).toBeTrue();
          expect(Array.isArray(stats.quizPerformance)).toBeTrue();
          expect(Array.isArray(stats.skillsProgress)).toBeTrue();
          done();
        }
      });
    });
  });

  describe('getRecentActivity', () => {
    it('should fetch recent activity with default limit', (done) => {
      service.getRecentActivity().subscribe({
        next: (activities: ActivityLog[]) => {
          expect(activities).toBeTruthy();
          expect(Array.isArray(activities)).toBeTrue();
          done();
        }
      });
    });

    it('should fetch recent activity with custom limit', (done) => {
      service.getRecentActivity(5).subscribe({
        next: (activities: ActivityLog[]) => {
          expect(activities).toBeTruthy();
          expect(Array.isArray(activities)).toBeTrue();
          done();
        }
      });
    });
  });

  describe('getAchievements', () => {
    it('should fetch achievements successfully', (done) => {
      service.getAchievements().subscribe({
        next: (achievements: Achievement[]) => {
          expect(achievements).toBeTruthy();
          expect(Array.isArray(achievements)).toBeTrue();
          if (achievements.length > 0) {
            expect(achievements[0].id).toBeTruthy();
            expect(achievements[0].title).toBeTruthy();
            expect(achievements[0].earnedAt).toBeInstanceOf(Date);
          }
          done();
        }
      });
    });
  });

  describe('updateStudyTime', () => {
    it('should update study time successfully', (done) => {
      service.updateStudyTime(2.5).subscribe({
        next: (result: boolean) => {
          expect(result).toBeTrue();
          done();
        }
      });
    });
  });

  describe('updateStreak', () => {
    it('should update streak successfully', (done) => {
      service.updateStreak().subscribe({
        next: (streak: number) => {
          expect(streak).toBeGreaterThanOrEqual(0);
          done();
        }
      });
    });
  });
});

