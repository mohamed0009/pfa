import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContentManagementService } from './content-management.service';
import { Formation, Module, Course, Resource } from '../models/admin.interfaces';

describe('ContentManagementService', () => {
  let service: ContentManagementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContentManagementService]
    });

    service = TestBed.inject(ContentManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFormations', () => {
    it('should fetch formations successfully', (done) => {
      const mockFormations = [
        {
          id: 'f1',
          title: 'Test Formation',
          description: 'Test Description',
          level: 'DEBUTANT',
          category: 'Test',
          status: 'APPROVED',
          duration: 100,
          enrolledCount: 50,
          completionRate: 75,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02'
        }
      ];

      service.getFormations().subscribe({
        next: (formations: Formation[]) => {
          expect(formations).toBeTruthy();
          expect(Array.isArray(formations)).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/formations');
      expect(req.request.method).toBe('GET');
      req.flush(mockFormations);
    });

    it('should handle error and return empty array', (done) => {
      service.getFormations().subscribe({
        next: (formations: Formation[]) => {
          expect(formations).toEqual([]);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/formations');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getPendingFormations', () => {
    it('should fetch pending formations successfully', (done) => {
      const mockResponse = {
        formations: [
          {
            id: 'f1',
            title: 'Pending Formation',
            status: 'PENDING',
            level: 'INTERMEDIAIRE'
          }
        ]
      };

      service.getPendingFormations().subscribe({
        next: (formations: Formation[]) => {
          expect(formations).toBeTruthy();
          expect(Array.isArray(formations)).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/content/pending');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error and return empty array', (done) => {
      service.getPendingFormations().subscribe({
        next: (formations: Formation[]) => {
          expect(formations).toEqual([]);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/content/pending');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getFormationById', () => {
    it('should return formation by id', (done) => {
      service.getFormationById('f1').subscribe({
        next: (formation) => {
          expect(formation).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('createFormation', () => {
    it('should create formation successfully', (done) => {
      const newFormation: Partial<Formation> = {
        title: 'New Formation',
        description: 'New Description',
        level: 'Débutant',
        category: 'Test',
        duration: 50
      };

      const mockResponse = {
        id: 'f99',
        title: 'New Formation',
        description: 'New Description',
        level: 'DEBUTANT',
        category: 'Test',
        status: 'DRAFT',
        duration: 50,
        createdAt: '2024-12-25',
        updatedAt: '2024-12-25'
      };

      service.createFormation(newFormation).subscribe({
        next: (formation: Formation) => {
          expect(formation).toBeTruthy();
          expect(formation.title).toBe('New Formation');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/formations');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle error when creating formation', (done) => {
      const newFormation: Partial<Formation> = {
        title: 'New Formation'
      };

      service.createFormation(newFormation).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/formations');
      req.flush({ message: 'Error' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateFormation', () => {
    it('should update formation successfully', (done) => {
      const updates: Partial<Formation> = {
        title: 'Updated Title'
      };

      const mockResponse = {
        id: 'f1',
        title: 'Updated Title',
        level: 'DEBUTANT',
        status: 'APPROVED'
      };

      service.updateFormation('f1', updates).subscribe({
        next: (formation: Formation) => {
          expect(formation).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/formations/f1');
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('approveFormation', () => {
    it('should approve formation successfully', (done) => {
      const mockResponse = {
        id: 'f1',
        status: 'APPROVED'
      };

      service.approveFormation('f1').subscribe({
        next: (result) => {
          expect(result).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/content/formations/f1/approve');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('rejectFormation', () => {
    it('should reject formation successfully', (done) => {
      const mockResponse = {
        id: 'f1',
        status: 'REJECTED'
      };

      service.rejectFormation('f1', 'Invalid content').subscribe({
        next: (result) => {
          expect(result).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/content/formations/f1/reject');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ reason: 'Invalid content' });
      req.flush(mockResponse);
    });
  });
});

