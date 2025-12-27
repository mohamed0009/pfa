import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTherapyServices', () => {
    it('should return therapy services', (done) => {
      service.getTherapyServices().subscribe({
        next: (services) => {
          expect(services).toBeTruthy();
          expect(services.length).toBeGreaterThan(0);
          expect(services[0].id).toBeDefined();
          expect(services[0].title).toBeDefined();
          expect(services[0].description).toBeDefined();
          done();
        }
      });
    });
  });

  describe('getTestimonials', () => {
    it('should return testimonials', (done) => {
      service.getTestimonials().subscribe({
        next: (testimonials) => {
          expect(testimonials).toBeTruthy();
          expect(testimonials.length).toBeGreaterThan(0);
          expect(testimonials[0].id).toBeDefined();
          expect(testimonials[0].name).toBeDefined();
          expect(testimonials[0].rating).toBeDefined();
          done();
        }
      });
    });
  });

  describe('getTeamMembers', () => {
    it('should return team members', (done) => {
      service.getTeamMembers().subscribe({
        next: (members) => {
          expect(members).toBeTruthy();
          expect(members.length).toBeGreaterThan(0);
          expect(members[0].id).toBeDefined();
          expect(members[0].name).toBeDefined();
          expect(members[0].title).toBeDefined();
          done();
        }
      });
    });
  });

  describe('getBlogArticles', () => {
    it('should return blog articles', (done) => {
      service.getBlogArticles().subscribe({
        next: (articles) => {
          expect(articles).toBeTruthy();
          expect(articles.length).toBeGreaterThan(0);
          expect(articles[0].id).toBeDefined();
          expect(articles[0].title).toBeDefined();
          expect(articles[0].excerpt).toBeDefined();
          done();
        }
      });
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', (done) => {
      service.getStatistics().subscribe({
        next: (stats) => {
          expect(stats).toBeTruthy();
          expect(stats.length).toBeGreaterThan(0);
          expect(stats[0].label).toBeDefined();
          expect(stats[0].value).toBeDefined();
          done();
        }
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', (done) => {
      service.getCurrentUser().subscribe({
        next: (user) => {
          expect(user).toBeTruthy();
          expect(user.name).toBeDefined();
          expect(user.email).toBeDefined();
          done();
        }
      });
    });
  });
});

