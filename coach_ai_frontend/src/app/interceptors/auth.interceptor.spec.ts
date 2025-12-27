import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let next: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    const nextSpy = jasmine.createSpyObj('HttpHandler', ['handle']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    next = nextSpy;
  });

  it('should add Authorization header when token exists and URL matches', () => {
    authService.getToken.and.returnValue('test-token');
    const request = new HttpRequest('GET', 'http://localhost:8081/api/test');
    const expectedEvent = of({} as HttpEvent<any>);
    next.handle.and.returnValue(expectedEvent);

    authInterceptor(request, next.handle);

    expect(authService.getToken).toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalled();
    const interceptedRequest = next.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(interceptedRequest.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('should not add Authorization header when token does not exist', () => {
    authService.getToken.and.returnValue(null);
    const request = new HttpRequest('GET', 'http://localhost:8081/api/test');
    const expectedEvent = of({} as HttpEvent<any>);
    next.handle.and.returnValue(expectedEvent);

    authInterceptor(request, next.handle);

    const interceptedRequest = next.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(interceptedRequest.headers.get('Authorization')).toBeNull();
  });

  it('should not add Authorization header when URL does not match', () => {
    authService.getToken.and.returnValue('test-token');
    const request = new HttpRequest('GET', 'http://external-api.com/test');
    const expectedEvent = of({} as HttpEvent<any>);
    next.handle.and.returnValue(expectedEvent);

    authInterceptor(request, next.handle);

    const interceptedRequest = next.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(interceptedRequest.headers.get('Authorization')).toBeNull();
  });

  it('should pass through request when conditions are not met', () => {
    authService.getToken.and.returnValue(null);
    const request = new HttpRequest('GET', 'http://external-api.com/test');
    const expectedEvent = of({} as HttpEvent<any>);
    next.handle.and.returnValue(expectedEvent);

    authInterceptor(request, next.handle);

    expect(next.handle).toHaveBeenCalledWith(request);
  });
});

