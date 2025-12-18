import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');

        console.log('Interceptor called for:', req.url);
        console.log('Token from localStorage:', token ? 'EXISTS (length: ' + token.length + ')' : 'NULL');

        // Clone the request and add authorization header if token exists
        let authReq = req;
        if (token) {
            authReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`)
            });
            console.log('Authorization header added to request');
        } else {
            console.log('No token - skipping Authorization header');
        }

        // Handle the request and catch errors
        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // Unauthorized - redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    this.router.navigate(['/login']);
                }
                return throwError(() => error);
            })
        );
    }
}
