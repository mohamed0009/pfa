import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TestimonialsComponent } from './testimonials.component';
import { DataService } from '../../services/data.service';
import { Testimonial } from '../../models/interfaces';

describe('TestimonialsComponent', () => {
  let component: TestimonialsComponent;
  let fixture: ComponentFixture<TestimonialsComponent>;
  let dataService: jasmine.SpyObj<DataService>;

  const mockTestimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Test User',
      therapyType: 'Test Type',
      rating: 5,
      comment: 'Great service',
      date: '2024-01-01',
      avatarUrl: 'test.jpg'
    },
    {
      id: 2,
      name: 'Test User 2',
      therapyType: 'Test Type 2',
      rating: 4,
      comment: 'Good service',
      date: '2024-01-02',
      avatarUrl: 'test2.jpg'
    }
  ];

  beforeEach(async () => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['getTestimonials']);

    await TestBed.configureTestingModule({
      imports: [TestimonialsComponent],
      providers: [
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestimonialsComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    dataService.getTestimonials.and.returnValue(of(mockTestimonials));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load testimonials on init', () => {
    fixture.detectChanges();
    expect(dataService.getTestimonials).toHaveBeenCalled();
    expect(component.testimonials).toEqual(mockTestimonials);
  });

  it('should get star array correctly', () => {
    const stars = component.getStarArray(3);
    expect(stars.length).toBe(5);
    expect(stars[0]).toBeTrue();
    expect(stars[1]).toBeTrue();
    expect(stars[2]).toBeTrue();
    expect(stars[3]).toBeFalse();
    expect(stars[4]).toBeFalse();
  });

  it('should navigate to next slide', () => {
    component.testimonials = mockTestimonials;
    component.currentIndex = 0;
    component.nextSlide();
    expect(component.currentIndex).toBe(1);
  });

  it('should not navigate beyond last slide', () => {
    component.testimonials = mockTestimonials;
    component.currentIndex = 1;
    component.nextSlide();
    expect(component.currentIndex).toBe(1);
  });

  it('should navigate to previous slide', () => {
    component.testimonials = mockTestimonials;
    component.currentIndex = 1;
    component.prevSlide();
    expect(component.currentIndex).toBe(0);
  });

  it('should not navigate before first slide', () => {
    component.testimonials = mockTestimonials;
    component.currentIndex = 0;
    component.prevSlide();
    expect(component.currentIndex).toBe(0);
  });

  it('should go to specific slide', () => {
    component.testimonials = mockTestimonials;
    component.goToSlide(1);
    expect(component.currentIndex).toBe(1);
  });
});

