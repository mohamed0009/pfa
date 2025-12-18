import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../../services/trainer.service';
import { StudentDashboard, AtRiskStudent } from '../../../models/trainer.interfaces';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.scss']
})
export class StudentsListComponent implements OnInit {
  students: StudentDashboard[] = [];
  filteredStudents: StudentDashboard[] = [];
  atRiskStudents: AtRiskStudent[] = [];
  isLoading = true;
  searchTerm = '';
  selectedFormation = 'all';
  selectedPerformance = 'all';
  viewMode: 'grid' | 'list' = 'list';

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadAtRiskStudents();
  }

  private loadStudents(): void {
    this.trainerService.getStudents().subscribe(students => {
      this.students = students;
      this.filteredStudents = students;
      this.isLoading = false;
    });
  }

  private loadAtRiskStudents(): void {
    this.trainerService.getAtRiskStudents().subscribe(students => {
      this.atRiskStudents = students;
    });
  }

  filterStudents(): void {
    this.filteredStudents = this.students.filter(student => {
      const matchesSearch = student.studentName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesFormation = this.selectedFormation === 'all' || student.formationId === this.selectedFormation;
      return matchesSearch && matchesFormation;
    });
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 30) return '#f59e0b';
    return '#ef4444';
  }

  getPerformanceLabel(score: number): string {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Bon';
    if (score >= 50) return 'Moyen';
    return 'Faible';
  }
}



