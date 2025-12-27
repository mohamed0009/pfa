import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Certificate {
  id: string;
  userId: string;
  formationId?: string;
  courseId?: string;
  certificateNumber: string;
  title: string;
  description?: string;
  issuedAt: Date;
  finalScore: number;
  totalHours: number;
  shareableUrl: string;
  verificationCode: string;
  pdfUrl?: string;
  isVerified: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private apiUrl = 'http://localhost:8081/api/user/certificates';

  constructor(private http: HttpClient) {}

  getMyCertificates(): Observable<Certificate[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((certs: any[]) => certs.map(cert => ({
        id: cert.id,
        userId: cert.user?.id || cert.userId,
        formationId: cert.formation?.id || cert.formationId,
        courseId: cert.course?.id || cert.courseId,
        certificateNumber: cert.certificateNumber || '',
        title: cert.title || '',
        description: cert.description || '',
        issuedAt: cert.issuedAt ? new Date(cert.issuedAt) : new Date(),
        finalScore: cert.finalScore || 0,
        totalHours: cert.totalHours || 0,
        shareableUrl: cert.shareableUrl || '',
        verificationCode: cert.verificationCode || '',
        pdfUrl: cert.pdfUrl || '',
        isVerified: cert.isVerified !== undefined ? cert.isVerified : true,
        createdAt: cert.createdAt ? new Date(cert.createdAt) : new Date()
      }))),
      catchError((error) => {
        console.error('Error fetching certificates:', error);
        return throwError(() => error);
      })
    );
  }

  getCertificateById(id: string): Observable<Certificate> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((cert: any) => ({
        id: cert.id,
        userId: cert.user?.id || cert.userId,
        formationId: cert.formation?.id || cert.formationId,
        courseId: cert.course?.id || cert.courseId,
        certificateNumber: cert.certificateNumber || '',
        title: cert.title || '',
        description: cert.description || '',
        issuedAt: cert.issuedAt ? new Date(cert.issuedAt) : new Date(),
        finalScore: cert.finalScore || 0,
        totalHours: cert.totalHours || 0,
        shareableUrl: cert.shareableUrl || '',
        verificationCode: cert.verificationCode || '',
        pdfUrl: cert.pdfUrl || '',
        isVerified: cert.isVerified !== undefined ? cert.isVerified : true,
        createdAt: cert.createdAt ? new Date(cert.createdAt) : new Date()
      })),
      catchError((error) => {
        console.error('Error fetching certificate:', error);
        return throwError(() => error);
      })
    );
  }

  generateFormationCertificate(formationId: string): Observable<Certificate> {
    return this.http.post<any>(`${this.apiUrl}/formation/${formationId}`, {}).pipe(
      map((cert: any) => ({
        id: cert.id,
        userId: cert.user?.id || '',
        formationId: cert.formation?.id || formationId,
        certificateNumber: cert.certificateNumber || '',
        title: cert.title || '',
        description: cert.description || '',
        issuedAt: cert.issuedAt ? new Date(cert.issuedAt) : new Date(),
        finalScore: cert.finalScore || 0,
        totalHours: cert.totalHours || 0,
        shareableUrl: cert.shareableUrl || '',
        verificationCode: cert.verificationCode || '',
        pdfUrl: cert.pdfUrl || '',
        isVerified: cert.isVerified !== undefined ? cert.isVerified : true,
        createdAt: cert.createdAt ? new Date(cert.createdAt) : new Date()
      })),
      catchError((error) => {
        console.error('Error generating certificate:', error);
        return throwError(() => error);
      })
    );
  }

  generateCourseCertificate(courseId: string): Observable<Certificate> {
    return this.http.post<any>(`${this.apiUrl}/course/${courseId}`, {}).pipe(
      map((cert: any) => ({
        id: cert.id,
        userId: cert.user?.id || '',
        courseId: cert.course?.id || courseId,
        certificateNumber: cert.certificateNumber || '',
        title: cert.title || '',
        description: cert.description || '',
        issuedAt: cert.issuedAt ? new Date(cert.issuedAt) : new Date(),
        finalScore: cert.finalScore || 0,
        totalHours: cert.totalHours || 0,
        shareableUrl: cert.shareableUrl || '',
        verificationCode: cert.verificationCode || '',
        pdfUrl: cert.pdfUrl || '',
        isVerified: cert.isVerified !== undefined ? cert.isVerified : true,
        createdAt: cert.createdAt ? new Date(cert.createdAt) : new Date()
      })),
      catchError((error) => {
        console.error('Error generating certificate:', error);
        return throwError(() => error);
      })
    );
  }

  verifyCertificate(verificationCode: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/verify/${verificationCode}`).pipe(
      catchError((error) => {
        console.error('Error verifying certificate:', error);
        return throwError(() => error);
      })
    );
  }
}

