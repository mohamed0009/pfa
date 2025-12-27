import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PublicFormationsService } from './public-formations.service';

describe('PublicFormationsService', () => {
  let service: PublicFormationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PublicFormationsService]
    });
    
    service = TestBed.inject(PublicFormationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPublicFormations', () => {
    it('should return formations', (done) => {
      const mockFormations = [
        {
          id: '1',
          title: 'Test Formation',
          description: 'Test Description',
          category: 'Test',
          level: 'DEBUTANT',
          duration: 10
        }
      ];

      service.getPublicFormations().subscribe({
        next: (formations) => {
          expect(formations).toBeTruthy();
          expect(formations.length).toBe(1);
          expect(formations[0].title).toBe('Test Formation');
          expect(formations[0].level).toBe('Débutant');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/public/formations');
      expect(req.request.method).toBe('GET');
      req.flush(mockFormations);
    });

    it('should handle error and return empty array', (done) => {
      service.getPublicFormations().subscribe({
        next: (formations) => {
          expect(formations).toEqual([]);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/public/formations');
      req.flush(null, { status: 500, statusText: 'Server Error' });
    });

    it('should map level correctly', (done) => {
      const mockFormations = [
        { id: '1', title: 'Test', level: 'INTERMEDIAIRE' },
        { id: '2', title: 'Test 2', level: 'AVANCE' }
      ];

      service.getPublicFormations().subscribe({
        next: (formations) => {
          expect(formations[0].level).toBe('Intermédiaire');
          expect(formations[1].level).toBe('Avancé');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/public/formations');
      req.flush(mockFormations);
    });
  });

  describe('getPublicCourses', () => {
    it('should return courses limited to 6', (done) => {
      const mockCourses = Array(10).fill({ id: '1', title: 'Test Course' });

      service.getPublicCourses().subscribe({
        next: (courses) => {
          expect(courses.length).toBe(6);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/courses');
      expect(req.request.method).toBe('GET');
      req.flush(mockCourses);
    });

    it('should handle error and return empty array', (done) => {
      service.getPublicCourses().subscribe({
        next: (courses) => {
          expect(courses).toEqual([]);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/courses');
      req.flush(null, { status: 500, statusText: 'Server Error' });
    });
  });
});

