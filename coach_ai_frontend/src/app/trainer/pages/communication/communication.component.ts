import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../services/trainer.service';
import { TrainerMessage, StudentQuestion, Reminder } from '../../models/trainer.interfaces';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './communication.component.html',
  styleUrls: ['./communication.component.scss']
})
export class CommunicationComponent implements OnInit {
  activeTab: 'messages' | 'questions' | 'reminders' = 'messages';
  
  messages: TrainerMessage[] = [];
  questions: StudentQuestion[] = [];
  reminders: Reminder[] = [];
  
  selectedMessage: TrainerMessage | null = null;
  searchTerm = '';
  replyContent = '';
  
  unreadMessages = 0;
  unansweredQuestions = 0;
  upcomingReminders = 0;

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadMessages();
    this.loadQuestions();
    this.loadReminders();
  }

  loadMessages(): void {
    this.trainerService.getTrainerMessages().subscribe(messages => {
      this.messages = messages;
      this.unreadMessages = messages.filter(m => !m.read).length;
    });
  }

  loadQuestions(): void {
    this.trainerService.getStudentQuestions().subscribe(questions => {
      this.questions = questions;
      this.unansweredQuestions = questions.filter(q => q.status === 'open').length;
    });
  }

  loadReminders(): void {
    this.trainerService.getReminders().subscribe(reminders => {
      this.reminders = reminders;
      this.upcomingReminders = reminders.filter(r => this.isUpcoming(r.scheduledFor)).length;
    });
  }

  selectMessage(message: TrainerMessage): void {
    this.selectedMessage = message;
    if (!message.read) {
      message.read = true;
      this.unreadMessages--;
    }
  }

  sendReply(): void {
    if (!this.replyContent.trim() || !this.selectedMessage) return;
    
    console.log('Sending reply:', this.replyContent);
    // TODO: Implement send reply
    this.replyContent = '';
  }

  newMessage(): void {
    console.log('Creating new message');
    // TODO: Implement new message dialog
  }

  viewQuestion(id: string): void {
    console.log('Viewing question:', id);
    // TODO: Navigate to question detail
  }

  answerQuestion(id: string): void {
    console.log('Answering question:', id);
    // TODO: Implement answer dialog
  }

  createReminder(): void {
    console.log('Creating reminder');
    // TODO: Implement create reminder dialog
  }

  editReminder(id: string): void {
    console.log('Editing reminder:', id);
    // TODO: Implement edit reminder
  }

  deleteReminder(id: string): void {
    console.log('Deleting reminder:', id);
    // TODO: Implement delete confirmation
  }

  isUpcoming(date: Date): boolean {
    const now = new Date();
    const scheduled = new Date(date);
    const diff = scheduled.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 7;
  }

  getReminderIcon(type: string): string {
    const icons: Record<string, string> = {
      'session': 'event',
      'deadline': 'assignment_late',
      'homework': 'assignment',
      'general': 'notifications'
    };
    return icons[type] || 'notifications';
  }

  getMessagePreview(content: string): string {
    if (!content) return '';
    const maxLength = 80;
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }

  getQuestionStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'open': 'Non répondu',
      'answered': 'Répondu',
      'resolved': 'Résolu',
      'closed': 'Fermé'
    };
    return labels[status] || status;
  }
}



