import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ServicesComponent } from './services.component';
import { PublicFormationsService, PublicFormation } from '../../services/public-formations.service';
import { LoggerService } from '../../services/logger.service';

describe('ServicesComponent', () => {
  let component: ServicesComponent;
  let fixture: ComponentFixture<ServicesComponent>;
  let publicFormationsService: jasmine.SpyObj<PublicFormationsService>;

  const mockFormations: PublicFormation[] = [
    {
      id: '1',
      title: 'Test Formation',
      description: 'Test Description',
      category: 'Test Category',
      level: 'Débutant',
      duration: 10,
      thumbnail: 'test.jpg',
      modulesCount: 5,
      quizzesCount: 3,
      enrolledCount: 100
    }
  ];

  beforeEach(async () => {
    const publicFormationsServiceSpy = jasmine.createSpyObj('PublicFormationsService', ['getPublicFormations']);
    const loggerSpy = jasmine.createSpyObj('LoggerService', ['error', 'debug', 'info', 'warn', 'log']);

    await TestBed.configureTestingModule({
      imports: [ServicesComponent, RouterTestingModule],
      providers: [
        { provide: PublicFormationsService, useValue: publicFormationsServiceSpy },
        { provide: LoggerService, useValue: loggerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesComponent);
    component = fixture.componentInstance;
    publicFormationsService = TestBed.inject(PublicFormationsService) as jasmine.SpyObj<PublicFormationsService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load formations on init', () => {
    publicFormationsService.getPublicFormations.and.returnValue(of(mockFormations));
    fixture.detectChanges();
    
    expect(publicFormationsService.getPublicFormations).toHaveBeenCalled();
    expect(component.formations).toEqual(mockFormations);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when loading formations', () => {
    publicFormationsService.getPublicFormations.and.returnValue(throwError(() => new Error('Test error')));
    fixture.detectChanges();
    
    expect(component.isLoading).toBeFalse();
    expect(component.formations).toEqual([]);
  });

  it('should get formation features', () => {
    const formation = mockFormations[0];
    const features = component.getFormationFeatures(formation);
    
    expect(features).toContain('5 modules');
    expect(features).toContain('3 quiz');
    expect(features).toContain('Certification incluse');
  });

  it('should get formation image', () => {
    const formation = mockFormations[0];
    const image = component.getFormationImage(formation);
    
    expect(image).toBe('test.jpg');
  });

  it('should get default image when thumbnail is missing', () => {
    const formation: PublicFormation = {
      ...mockFormations[0],
      thumbnail: undefined
    };
    const image = component.getFormationImage(formation);
    
    expect(image).toContain('unsplash.com');
  });

  it('should get formation duration', () => {
    const formation = mockFormations[0];
    const duration = component.getFormationDuration(formation);
    
    expect(duration).toBe('10 heures');
  });

  it('should return default duration when duration is 0', () => {
    const formation: PublicFormation = {
      ...mockFormations[0],
      duration: 0
    };
    const duration = component.getFormationDuration(formation);
    
    expect(duration).toBe('À votre rythme');
  });
});

