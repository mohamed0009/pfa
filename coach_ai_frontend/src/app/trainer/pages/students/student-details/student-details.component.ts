import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  specialty: string;
  joinedAt: Date;
  formations: StudentFormation[];
  certificates: StudentCertificate[];
}

interface StudentFormation {
  formationId: string;
  formationTitle: string;
  progress: number;
  enrolledAt: Date;
  modules: ModuleProgress[];
}

interface ModuleProgress {
  moduleId: string;
  moduleTitle: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

interface StudentCertificate {
  id: string;
  formationTitle: string;
  issuedAt: Date;
  score: number;
}

interface AIAnalysis {
  levelGlobal: string;
  levelScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  difficultiesDetected: DetectedDifficulty[];
  recommendations: string[];
  conversationInsights: ConversationInsight[];
}

interface DetectedDifficulty {
  topic: string;
  frequency: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  lastMentioned: Date;
}

interface ConversationInsight {
  question: string;
  count: number;
  context: string;
}

interface StudentStats {
  totalTimeSpent: number; // heures
  quizzesCompleted: number;
  quizzesTotal: number;
  averageScore: number;
  labsSubmitted: number;
  labsTotal: number;
  averageLabScore: number;
}

@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-details.component.html',
  styleUrl: './student-details.component.scss'
})
export class StudentDetailsComponent implements OnInit {
  student: StudentProfile | null = null;
  aiAnalysis: AIAnalysis | null = null;
  stats: StudentStats | null = null;
  isLoading: boolean = true;

  private apiUrl = 'http://localhost:8081/api/trainer/students';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const studentId = this.route.snapshot.paramMap.get('id');
    if (studentId) {
      this.loadStudentDetails(studentId);
    }
  }

  loadStudentDetails(studentId: string): void {
    // Load student basic info
    this.http.get<any>(`${this.apiUrl}/${studentId}`).subscribe({
      next: (data) => {
        // Map student data
        const studentData = data.student || data;
        this.student = {
          id: studentData.id || studentId,
          firstName: studentData.firstName || '',
          lastName: studentData.lastName || '',
          email: studentData.email || '',
          avatarUrl: studentData.avatarUrl,
          specialty: studentData.specialty || '',
          joinedAt: studentData.joinedAt ? new Date(studentData.joinedAt) : new Date(),
          formations: studentData.formations || [],
          certificates: studentData.certificates || []
        };
        
        // Map AI analysis
        if (data.aiAnalysis) {
          this.aiAnalysis = {
            levelGlobal: data.aiAnalysis.levelGlobal || 'Débutant',
            levelScore: data.aiAnalysis.levelScore || 0,
            strengths: data.aiAnalysis.strengths || [],
            weaknesses: data.aiAnalysis.weaknesses || [],
            difficultiesDetected: (data.aiAnalysis.difficultiesDetected || []).map((d: any) => ({
              topic: d.topic || d.subject || '',
              frequency: d.frequency || 0,
              severity: d.severity || 'MEDIUM',
              lastMentioned: d.lastMentioned ? new Date(d.lastMentioned) : new Date()
            })),
            recommendations: data.aiAnalysis.recommendations || [],
            conversationInsights: data.aiAnalysis.conversationInsights || []
          };
        }
        
        // Map stats
        if (data.stats) {
          this.stats = {
            totalTimeSpent: data.stats.totalTimeSpent || 0,
            quizzesCompleted: data.stats.quizzesCompleted || 0,
            quizzesTotal: data.stats.quizzesTotal || 0,
            averageScore: data.stats.averageScore || 0,
            labsSubmitted: data.stats.labsSubmitted || 0,
            labsTotal: data.stats.labsTotal || 0,
            averageLabScore: data.stats.averageLabScore || 0
          };
        }
        
        // Load AI analysis separately if not included
        if (!data.aiAnalysis) {
          this.loadAIAnalysis(studentId);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading student details:', error);
        this.isLoading = false;
        // Pas de fallback mock, afficher données vides
        this.student = null;
        this.aiAnalysis = null;
        this.stats = null;
      }
    });
  }
  
  private loadAIAnalysis(studentId: string): void {
    this.http.get<any>(`http://localhost:8081/api/trainer/ai-analysis/student/${studentId}`).subscribe({
      next: (analysis) => {
        this.aiAnalysis = {
          levelGlobal: analysis.levelPrediction?.level || 'Débutant',
          levelScore: analysis.levelPrediction?.score || 0,
          strengths: [],
          weaknesses: [],
          difficultiesDetected: (analysis.difficulties || []).map((d: any) => ({
            topic: d.topic || d.subject || '',
            frequency: d.frequency || 0,
            severity: d.severity || 'MEDIUM',
            lastMentioned: d.lastMentioned ? new Date(d.lastMentioned) : new Date()
          })),
          recommendations: (analysis.recommendations || []).map((r: any) => r.title || r.description || ''),
          conversationInsights: []
        };
      },
      error: (error) => {
        console.error('Error loading AI analysis:', error);
      }
    });
  }

  getStudentFullName(): string {
    if (!this.student) return '';
    return `${this.student.firstName} ${this.student.lastName}`;
  }

  getSeverityColor(severity: string): string {
    const colors: { [key: string]: string } = {
      'LOW': '#28a745',
      'MEDIUM': '#ffc107',
      'HIGH': '#dc3545'
    };
    return colors[severity] || '#6c757d';
  }

  getLevelColor(score: number): string {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  }
}



