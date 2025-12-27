import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Certificate {
  id: string;
  certificateNumber: string;
  certificateUrl: string;
  issuedAt: string;
  formationTitle: string;
  formationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificatesService {
  private apiUrl = 'http://localhost:8081/api/user/formations/progress';

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les certificats de formation de l'utilisateur
   */
  getMyCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.apiUrl}/certificates`).pipe(
      map((certificates: any[]) => certificates.map(c => ({
        id: c.id,
        certificateNumber: c.certificateNumber,
        certificateUrl: c.certificateUrl,
        issuedAt: c.issuedAt,
        formationTitle: c.formationTitle,
        formationId: c.formationId
      }))),
      catchError((error) => {
        console.error('Error fetching certificates:', error);
        return of([]);
      })
    );
  }

  /**
   * Génère un certificat pour une formation complétée
   */
  generateCertificate(enrollmentId: string): Observable<Certificate> {
    return this.http.post<any>(`${this.apiUrl}/${enrollmentId}/certificate`, {}).pipe(
      map((cert: any) => ({
        id: cert.id,
        certificateNumber: cert.certificateNumber,
        certificateUrl: cert.certificateUrl,
        issuedAt: cert.issuedAt,
        formationTitle: cert.formation?.title || '',
        formationId: cert.formation?.id || ''
      })),
      catchError((error) => {
        console.error('Error generating certificate:', error);
        throw error;
      })
    );
  }

  /**
   * Télécharge le certificat en PDF
   */
  downloadCertificate(certificateId: string): Observable<Blob> {
    return this.http.get(`http://localhost:8081/api/user/certificates/${certificateId}/download`, {
      responseType: 'blob'
    }).pipe(
      catchError((error) => {
        console.error('Error downloading certificate:', error);
        throw error;
      })
    );
  }

  /**
   * Partage le certificat (copie le lien)
   */
  shareCertificate(certificateNumber: string): string {
    const shareUrl = `${window.location.origin}/verify/${certificateNumber}`;
    return shareUrl;
  }
}

