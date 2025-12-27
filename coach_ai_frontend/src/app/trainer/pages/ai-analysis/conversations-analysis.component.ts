import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ConversationAnalysis {
  period: string;
  totalConversations: number;
  totalMessages: number;
  uniqueStudents: number;
  topicsDetected: TopicDetection[];
  frequentQuestions: FrequentQuestion[];
  difficultiesDetected: DifficultyDetection[];
  levelDistribution: { [key: string]: number };
}

interface TopicDetection {
  topic: string;
  count: number;
  relatedCourse?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  trend: 'rising' | 'stable' | 'declining';
}

interface FrequentQuestion {
  question: string;
  count: number;
  studentsAsked: number;
  averageRepetitions: number;
  relatedModule?: string;
  suggestedAction: string;
}

interface DifficultyDetection {
  subject: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  studentCount: number;
  averageAttempts: number;
  suggestedSolution: string;
  priority: number;
}

@Component({
  selector: 'app-conversations-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversations-analysis.component.html',
  styleUrl: './conversations-analysis.component.scss'
})
export class ConversationsAnalysisComponent implements OnInit {
  analysis: ConversationAnalysis | null = null;
  selectedPeriod: string = '30days';
  isLoading: boolean = true;

  periods = [
    { value: '7days', label: '7 derniers jours' },
    { value: '30days', label: '30 derniers jours' },
    { value: '90days', label: '3 derniers mois' }
  ];

  private apiUrl = 'http://localhost:8081/api/trainer/ai-analysis/conversations';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAnalysis();
  }

  loadAnalysis(): void {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}?period=${this.selectedPeriod}`).subscribe({
      next: (data) => {
        // Mapper les données backend vers le format frontend
        this.analysis = {
          period: data.period || this.selectedPeriod,
          totalConversations: data.totalConversations || 0,
          totalMessages: data.totalMessages || 0,
          uniqueStudents: data.uniqueStudents || 0,
          topicsDetected: (data.topicsDetected || []).map((t: any) => ({
            topic: t.topic || '',
            count: t.count || 0,
            relatedCourse: t.relatedCourse || '',
            severity: (t.severity || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
            trend: (t.trend || 'stable') as 'rising' | 'stable' | 'declining'
          })),
          frequentQuestions: (data.frequentQuestions || []).map((q: any) => ({
            question: q.question || '',
            count: q.count || 0,
            studentsAsked: q.studentsAsked || 0,
            averageRepetitions: q.averageRepetitions || 0,
            relatedModule: q.relatedModule || '',
            suggestedAction: q.suggestedAction || ''
          })),
          difficultiesDetected: (data.difficultiesDetected || []).map((d: any) => ({
            subject: d.subject || '',
            level: (d.level || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
            studentCount: d.studentCount || 0,
            averageAttempts: d.averageAttempts || 0,
            suggestedSolution: d.suggestedSolution || '',
            priority: d.priority || 0
          })),
          levelDistribution: data.levelDistribution || {}
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading analysis:', error);
        this.isLoading = false;
        this.analysis = null; // Pas de fallback mock, afficher null
      }
    });
  }

  onPeriodChange(): void {
    this.loadAnalysis();
  }

  getSeverityColor(severity: string): string {
    const colors: { [key: string]: string } = {
      'LOW': '#28a745',
      'MEDIUM': '#ffc107',
      'HIGH': '#dc3545'
    };
    return colors[severity] || '#6c757d';
  }

  getTrendIcon(trend: string): string {
    const icons: { [key: string]: string } = {
      'rising': 'trending_up',
      'stable': 'trending_flat',
      'declining': 'trending_down'
    };
    return icons[trend] || 'trending_flat';
  }

  getTrendColor(trend: string): string {
    const colors: { [key: string]: string } = {
      'rising': '#dc3545',
      'stable': '#ffc107',
      'declining': '#28a745'
    };
    return colors[trend] || '#6c757d';
  }
}

