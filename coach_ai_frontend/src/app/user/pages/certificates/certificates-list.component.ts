import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CertificateService, Certificate } from '../../services/certificate.service';

@Component({
  selector: 'app-certificates-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './certificates-list.component.html',
  styleUrls: ['./certificates-list.component.scss']
})
export class CertificatesListComponent implements OnInit {
  certificates: Certificate[] = [];
  isLoading = true;

  constructor(private certificateService: CertificateService) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.isLoading = true;
    this.certificateService.getMyCertificates().subscribe({
      next: (certs) => {
        this.certificates = certs;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading certificates:', error);
        this.certificates = [];
        this.isLoading = false;
      }
    });
  }
}

