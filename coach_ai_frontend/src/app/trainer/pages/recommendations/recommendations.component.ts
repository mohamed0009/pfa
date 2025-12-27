import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../services/trainer.service';
import { CourseRecommendation } from '../../models/trainer.interfaces';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss']
})
export class RecommendationsComponent implements OnInit {
  recommendations: CourseRecommendation[] = [];
  filteredRecommendations: CourseRecommendation[] = [];
  isLoading = true;
  searchTerm = '';
  selectedStatus: 'all' | 'PENDING' | 'ACCEPTED' | 'REJECTED' = 'all';
  selectedStudent = 'all';
  students: { id: string; name: string }[] = [];

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadRecommendations();
  }

  private loadRecommendations(): void {
    this.isLoading = true;
    const status = this.selectedStatus === 'all' ? undefined : this.selectedStatus;
    const studentId = this.selectedStudent === 'all' ? undefined : this.selectedStudent;
    
    this.trainerService.getRecommendations(studentId, status).subscribe({
      next: (recommendations) => {
        this.recommendations = recommendations;
        this.filteredRecommendations = recommendations;
        this.extractStudents();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recommendations:', error);
        this.recommendations = [];
        this.filteredRecommendations = [];
        this.isLoading = false;
      }
    });
  }

  private extractStudents(): void {
    const studentMap = new Map<string, string>();
    this.recommendations.forEach(rec => {
      if (rec.studentId && rec.studentName) {
        studentMap.set(rec.studentId, rec.studentName);
      }
    });
    this.students = Array.from(studentMap.entries()).map(([id, name]) => ({ id, name }));
  }

  filterRecommendations(): void {
    this.filteredRecommendations = this.recommendations.filter(rec => {
      const matchesSearch = !this.searchTerm || 
        rec.course?.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        rec.reason?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        rec.studentName?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.selectedStatus === 'all' || rec.status === this.selectedStatus;
      const matchesStudent = this.selectedStudent === 'all' || rec.studentId === this.selectedStudent;
      
      return matchesSearch && matchesStatus && matchesStudent;
    });
  }

  onStatusChange(): void {
    this.loadRecommendations();
  }

  onStudentChange(): void {
    this.loadRecommendations();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'ACCEPTED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      default: return '#64748b';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'ACCEPTED': return 'Acceptée';
      case 'REJECTED': return 'Rejetée';
      default: return status;
    }
  }

  getConfidenceColor(score: number): string {
    if (score >= 70) return '#10b981';
    if (score >= 50) return '#3b82f6';
    if (score >= 30) return '#f59e0b';
    return '#ef4444';
  }
}

