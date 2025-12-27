import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CertificateService, Certificate } from '../../services/certificate.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-certificate-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-view.component.html',
  styleUrls: ['./certificate-view.component.scss']
})
export class CertificateViewComponent implements OnInit {
  certificate: Certificate | null = null;
  isLoading = true;
  currentUser: any = null;
  copiedToClipboard = false;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private certificateService: CertificateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user: any) => {
      this.currentUser = user;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCertificate(id);
    } else {
      const certNumber = this.route.snapshot.paramMap.get('number');
      if (certNumber) {
        // Load by certificate number (for shareable URLs)
        this.loadCertificateByNumber(certNumber);
      }
    }
  }

  loadCertificate(id: string): void {
    this.isLoading = true;
    this.certificateService.getCertificateById(id).subscribe({
      next: (cert) => {
        this.certificate = cert;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading certificate:', error);
        this.isLoading = false;
      }
    });
  }

  loadCertificateByNumber(certNumber: string): void {
    // Pour l'instant, on charge tous les certificats et on trouve celui qui correspond
    // TODO: Créer un endpoint backend pour charger par certificateNumber
    this.isLoading = true;
    this.certificateService.getMyCertificates().subscribe({
      next: (certs) => {
        this.certificate = certs.find(c => c.certificateNumber === certNumber) || null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading certificate:', error);
        this.isLoading = false;
      }
    });
  }

  copyUrl(): void {
    if (!this.certificate) return;
    
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.copiedToClipboard = true;
      setTimeout(() => {
        this.copiedToClipboard = false;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy URL:', err);
      alert('Erreur lors de la copie de l\'URL');
    });
  }

  shareOnLinkedIn(): void {
    if (!this.certificate) return;
    const url = encodeURIComponent(this.certificate.shareableUrl);
    const text = encodeURIComponent(`J'ai complété la formation "${this.certificate.title}" sur CoachIA Pro!`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }

  shareOnTwitter(): void {
    if (!this.certificate) return;
    const url = encodeURIComponent(this.certificate.shareableUrl);
    const text = encodeURIComponent(`J'ai complété la formation "${this.certificate.title}" sur CoachIA Pro! 🎓`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  }

  shareOnFacebook(): void {
    if (!this.certificate) return;
    const url = encodeURIComponent(this.certificate.shareableUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  exportAsPDF(): void {
    if (!this.certificate) return;
    
    // Utiliser html2pdf ou une bibliothèque similaire
    // Pour l'instant, on utilise window.print() qui permet d'imprimer en PDF
    window.print();
  }

  getCertificateUrl(): string {
    if (!this.certificate) return '';
    return this.certificate.shareableUrl || window.location.href;
  }

  getVerificationUrl(): string {
    if (!this.certificate) return '';
    return `${window.location.origin}/certificate/verify/${this.certificate.verificationCode}`;
  }
}

