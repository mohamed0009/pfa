import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService } from '../../services/ai-chat.service';
import { ChatMessage, Conversation } from '../../models/user.interfaces';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss']
})
export class AiChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  conversations: Conversation[] = [];
  activeConversation: Conversation | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  isTyping = false;
  showNewConversationModal = false;
  newConversationTitle = '';
  showConversationsList = true;
  
  // Audio recording properties
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  audioBlob: Blob | null = null;
  audioUrl: string | null = null;
  recordingDuration = 0;
  recordingTimer: any;

  constructor(private chatService: AiChatService) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadConversations(): void {
    this.chatService.getConversations().subscribe(conversations => {
      this.conversations = conversations;
      const active = conversations.find(c => c.isActive);
      if (active) {
        this.selectConversation(active);
      } else if (conversations.length > 0) {
        this.selectConversation(conversations[0]);
      }
    });
  }

  selectConversation(conversation: Conversation): void {
    this.activeConversation = conversation;
    this.chatService.setActiveConversation(conversation.id).subscribe();
    this.loadMessages(conversation.id);
    
    // Sur mobile, masquer la liste après sélection
    if (window.innerWidth < 768) {
      this.showConversationsList = false;
    }
  }

  loadMessages(conversationId: string): void {
    this.chatService.getMessages(conversationId).subscribe(messages => {
      this.messages = messages;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  sendMessage(): void {
    if ((!this.newMessage.trim() && !this.audioBlob) || !this.activeConversation) {
      return;
    }

    // If there's an audio blob, send it
    if (this.audioBlob) {
      this.sendAudioMessage();
      return;
    }

    const content = this.newMessage;
    this.newMessage = '';
    this.isTyping = true;

    this.chatService.sendMessage(this.activeConversation.id, content).subscribe(message => {
      this.messages.push(message);
      
      // Simuler le "typing" de l'IA
      setTimeout(() => {
        this.isTyping = false;
        this.loadMessages(this.activeConversation!.id);
      }, 2500);
    });
  }

  ngOnDestroy(): void {
    // Clean up audio resources
    if (this.isRecording) {
      this.cancelRecording();
    }
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }
  }

  openNewConversationModal(): void {
    this.showNewConversationModal = true;
    this.newConversationTitle = '';
  }

  createNewConversation(): void {
    if (!this.newConversationTitle.trim()) {
      return;
    }

    this.chatService.createConversation(this.newConversationTitle).subscribe(conversation => {
      this.conversations.unshift(conversation);
      this.selectConversation(conversation);
      this.showNewConversationModal = false;
      this.newConversationTitle = '';
    });
  }

  deleteConversation(conversation: Conversation, event: Event): void {
    event.stopPropagation();
    
    if (confirm(`Voulez-vous supprimer la conversation "${conversation.title}" ?`)) {
      this.chatService.deleteConversation(conversation.id).subscribe(() => {
        this.conversations = this.conversations.filter(c => c.id !== conversation.id);
        
        if (this.activeConversation?.id === conversation.id) {
          if (this.conversations.length > 0) {
            this.selectConversation(this.conversations[0]);
          } else {
            this.activeConversation = null;
            this.messages = [];
          }
        }
      });
    }
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  toggleConversationsList(): void {
    this.showConversationsList = !this.showConversationsList;
  }

  // Audio Recording Methods
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.recordingDuration = 0;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        if (this.audioChunks.length > 0) {
          this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.audioUrl = URL.createObjectURL(this.audioBlob);
        }
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      
      // Start timer
      this.recordingTimer = setInterval(() => {
        this.recordingDuration++;
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Impossible d\'accéder au microphone. Veuillez vérifier les permissions.');
    }
  }

  stopRecording(): void {
    if (!this.isRecording || !this.mediaRecorder) {
      return;
    }

    if (this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    this.isRecording = false;
    
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }

  cancelRecording(): void {
    this.stopRecording();
    this.audioChunks = [];
    this.audioBlob = null;
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }
    this.recordingDuration = 0;
  }

  removeAudio(): void {
    this.audioBlob = null;
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }
  }

  async sendAudioMessage(): Promise<void> {
    if (!this.audioBlob || !this.activeConversation) {
      return;
    }

    // Prepare message content (combine text if any with audio indicator)
    const textContent = this.newMessage.trim() || '[Message audio]';
    const audioBlob = this.audioBlob;
    
    // Clean up UI state
    this.newMessage = '';
    this.isTyping = true;
    
    // Convert audio blob to base64 for sending
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      
      // Create a message with audio attachment
      // Note: In a real implementation, you would upload the audio file to your backend
      // and get a URL, then create a message with that attachment
      const audioMessage: ChatMessage = {
        id: Date.now().toString(),
        conversationId: this.activeConversation!.id,
        sender: 'user',
        content: textContent,
        timestamp: new Date(),
        type: 'text',
        attachments: [{
          id: Date.now().toString(),
          type: 'audio',
          title: 'Message audio',
          url: base64Audio // In production, this should be a server URL
        }]
      };
      
      // Add message to UI immediately
      this.messages.push(audioMessage);
      
      // Send to backend (you'll need to update your service to handle audio)
      // For now, we'll send as a regular message
      this.chatService.sendMessage(this.activeConversation!.id, textContent).subscribe(message => {
        // Simuler le "typing" de l'IA
        setTimeout(() => {
          this.isTyping = false;
          this.loadMessages(this.activeConversation!.id);
        }, 2500);
      });
      
      // Clean up audio
      this.removeAudio();
    };
    reader.readAsDataURL(audioBlob);
  }
}



