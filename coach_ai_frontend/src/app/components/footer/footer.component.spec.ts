import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  it('should have quick links', () => {
    expect(component.quickLinks).toBeTruthy();
    expect(component.quickLinks.length).toBeGreaterThan(0);
    expect(component.quickLinks[0].label).toBe('Accueil');
  });

  it('should have services links', () => {
    expect(component.services).toBeTruthy();
    expect(component.services.length).toBeGreaterThan(0);
  });

  it('should have social links', () => {
    expect(component.socialLinks).toBeTruthy();
    expect(component.socialLinks.length).toBeGreaterThan(0);
  });
});
