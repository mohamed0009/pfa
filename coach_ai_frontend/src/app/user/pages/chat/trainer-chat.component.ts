import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TrainerChatService, TrainerConversation, TrainerMessage } from '../../services/trainer-chat.service';

@Component({
  selector: 'app-trainer-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './trainer-chat.component.html',
  styleUrls: ['./trainer-chat.component.scss']
})
export class TrainerChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  conversations: TrainerConversation[] = [];
  activeConversation: TrainerConversation | null = null;
  messages: TrainerMessage[] = [];
  newMessage = '';
  showNewConversationModal = false;
  newConversationTitle = '';
  showConversationsList = true;
  isLoading = false;

  constructor(
    private trainerChatService: TrainerChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if conversation ID is in query params
    this.route.queryParams.subscribe(params => {
      const conversationId = params['conversation'];
      if (conversationId) {
        this.loadConversations().then(() => {
          const conv = this.conversations.find(c => c.id === conversationId);
          if (conv) {
            this.selectConversation(conv);
          }
        });
      } else {
        this.loadConversations();
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  async loadConversations(): Promise<void> {
    this.isLoading = true;
    this.trainerChatService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        if (conversations.length > 0 && !this.activeConversation) {
          this.selectConversation(conversations[0]);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.isLoading = false;
      }
    });
  }

  selectConversation(conversation: TrainerConversation): void {
    this.activeConversation = conversation;
    this.loadMessages(conversation.id);
    
    // Sur mobile, masquer la liste après sélection
    if (window.innerWidth < 768) {
      this.showConversationsList = false;
    }
  }

  loadMessages(conversationId: string): void {
    this.trainerChatService.getConversationMessages(conversationId).subscribe({
      next: (messages) => {
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.activeConversation) {
      return;
    }

    const content = this.newMessage;
    this.newMessage = '';

    this.trainerChatService.sendMessage(this.activeConversation.id, content).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.loadConversations(); // Refresh conversations to update last message
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error sending message:', error);
        alert('Erreur lors de l\'envoi du message');
      }
    });
  }

  openNewConversationModal(): void {
    this.showNewConversationModal = true;
    this.newConversationTitle = '';
  }

  closeNewConversationModal(): void {
    this.showNewConversationModal = false;
    this.newConversationTitle = '';
  }

  createConversation(): void {
    if (!this.newConversationTitle.trim()) {
      return;
    }

    this.trainerChatService.createConversation(this.newConversationTitle).subscribe({
      next: (conversation) => {
        this.conversations.unshift(conversation);
        this.selectConversation(conversation);
        this.closeNewConversationModal();
      },
      error: (error) => {
        console.error('Error creating conversation:', error);
        alert('Erreur lors de la création de la conversation');
      }
    });
  }

  toggleConversationsList(): void {
    this.showConversationsList = !this.showConversationsList;
  }

  formatTime(date?: Date): string {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now.getTime() - messageDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return messageDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return messageDate.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      // Ignore
    }
  }
}

