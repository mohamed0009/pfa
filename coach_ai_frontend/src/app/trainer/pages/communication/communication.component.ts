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
  selectedConversationMessages: any[] = [];
  searchTerm = '';
  replyContent = '';
  
  unreadMessages = 0;
  unansweredQuestions = 0;
  upcomingReminders = 0;
  isLoadingMessages = false;

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadMessages();
    this.loadQuestions();
    this.loadReminders();
  }

  loadMessages(): void {
    this.trainerService.getTrainerMessages().subscribe({
      next: (messages) => {
        this.messages = messages || [];
        this.unreadMessages = this.messages.filter(m => !m.read).length;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.messages = [];
        this.unreadMessages = 0;
      }
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
    this.selectedConversationMessages = [];
    this.isLoadingMessages = true;
    
    // Load conversation messages - use conversationId from the message
    const conversationId = (message as any).conversationId;
    if (conversationId) {
      this.trainerService.getConversationMessages(conversationId).subscribe({
        next: (messages) => {
          this.selectedConversationMessages = messages || [];
          this.isLoadingMessages = false;
        },
        error: (error) => {
          console.error('Error loading conversation messages:', error);
          this.isLoadingMessages = false;
          // Fallback: use the selected message as the only message
          this.selectedConversationMessages = [{
            id: message.id,
            content: message.content,
            sender: message.senderRole === 'student' ? 'USER' : 'AI',
            timestamp: message.sentAt
          }];
        }
      });
    } else {
      // Fallback: use the selected message as the only message
      this.selectedConversationMessages = [{
        id: message.id,
        content: message.content,
        sender: message.senderRole === 'student' ? 'USER' : 'AI',
        timestamp: message.sentAt
      }];
      this.isLoadingMessages = false;
    }
    
    if (!message.read) {
      message.read = true;
      this.unreadMessages--;
    }
  }

  // Modal state
  showNewMessageModal = false;
  showAnswerModal = false;
  selectedQuestion: StudentQuestion | null = null;
  newMessageData = {
    recipientId: '',
    recipientName: '',
    subject: '',
    content: ''
  };
  answerContent = '';
  isSending = false;

  sendReply(): void {
    if (!this.replyContent.trim() || !this.selectedMessage) return;
    
    this.isSending = true;
    const conversationId = (this.selectedMessage as any).conversationId;
    if (!conversationId) {
      alert('Erreur: ID de conversation introuvable');
      this.isSending = false;
      return;
    }
    
    const messageData = {
      conversationId: conversationId,
      content: this.replyContent
    };

    this.trainerService.sendMessage(messageData as any).subscribe({
      next: () => {
        this.replyContent = '';
        this.isSending = false;
        // Reload conversation messages
        this.selectMessage(this.selectedMessage!);
        this.loadMessages();
      },
      error: (error) => {
        console.error('Error sending reply:', error);
        this.isSending = false;
        alert('Erreur lors de l\'envoi du message: ' + (error.error?.message || error.message || 'Erreur inconnue'));
      }
    });
  }

  newMessage(): void {
    this.showNewMessageModal = true;
    this.newMessageData = {
      recipientId: '',
      recipientName: '',
      subject: '',
      content: ''
    };
  }

  closeNewMessageModal(): void {
    this.showNewMessageModal = false;
  }

  sendNewMessage(): void {
    if (!this.newMessageData.content.trim()) return;

    this.isSending = true;
    this.trainerService.sendMessage(this.newMessageData as any).subscribe({
      next: () => {
        this.closeNewMessageModal();
        this.isSending = false;
        this.loadMessages();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSending = false;
        alert('Erreur lors de l\'envoi du message');
      }
    });
  }

  viewQuestion(id: string): void {
    this.selectedQuestion = this.questions.find(q => q.id === id) || null;
    if (this.selectedQuestion) {
      this.showAnswerModal = true;
      this.answerContent = '';
    }
  }

  answerQuestion(id: string): void {
    this.viewQuestion(id);
  }

  closeAnswerModal(): void {
    this.showAnswerModal = false;
    this.selectedQuestion = null;
    this.answerContent = '';
  }

  submitAnswer(): void {
    if (!this.selectedQuestion || !this.answerContent.trim()) return;

    this.isSending = true;
    // Pour l'instant, envoyer comme un message
    // TODO: Créer un endpoint spécifique pour répondre aux questions
    const messageData = {
      conversationId: this.selectedQuestion.id,
      content: `Réponse à votre question: ${this.answerContent}`
    };

    this.trainerService.sendMessage(messageData as any).subscribe({
      next: () => {
        this.closeAnswerModal();
        this.isSending = false;
        this.loadQuestions();
      },
      error: (error) => {
        console.error('Error submitting answer:', error);
        this.isSending = false;
        alert('Erreur lors de l\'envoi de la réponse');
      }
    });
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

  // Messages filtrés par terme de recherche
  get filteredMessages(): TrainerMessage[] {
    if (!this.searchTerm) {
      return this.messages;
    }
    const term = this.searchTerm.toLowerCase();
    return this.messages.filter(m =>
      (m.senderName && m.senderName.toLowerCase().includes(term)) ||
      (m.recipientName && m.recipientName.toLowerCase().includes(term)) ||
      (m.subject && m.subject.toLowerCase().includes(term)) ||
      (m.content && m.content.toLowerCase().includes(term))
    );
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



