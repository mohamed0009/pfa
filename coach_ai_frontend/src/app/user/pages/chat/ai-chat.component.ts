import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService } from '../../services/ai-chat.service';
import { AiCoachService } from '../../services/ai-coach.service';
import { ChatMessage, Conversation } from '../../models/user.interfaces';
import { CoachRecommendation } from '../../models/ai-coach.interfaces';

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
  
  // AI metadata
  useDirectAI = true; // Toggle pour utiliser l'IA directe ou via backend
  aiMetadata: Map<string, CoachRecommendation> = new Map(); // Store AI metadata by message ID
  
  // Audio recording properties
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  audioBlob: Blob | null = null;
  audioUrl: string | null = null;
  recordingDuration = 0;
  recordingTimer: any;

  // Speech recognition properties (Web Speech API)
  recognition: any = null;
  isListening = false;
  recognizedText = '';
  speechSupported = false;

  // Text-to-speech properties (Web Speech Synthesis API)
  isSpeaking = false;
  autoPlayAudio = false;
  synthesisSupported = false;

  constructor(
    private chatService: AiChatService,
    private aiCoachService: AiCoachService
  ) {}

  ngOnInit(): void {
    this.loadConversations();
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
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
      
      // Try to extract AI metadata from messages if available
      messages.forEach(msg => {
        if (msg.sender === 'ai' && msg.aiMetadata) {
          const recommendation: CoachRecommendation = {
            response: msg.content,
            predictedDifficulty: msg.aiMetadata.predictedDifficulty || 'unknown',
            confidence: msg.aiMetadata.confidence || 0,
            source: msg.aiMetadata.source || 'backend'
          };
          this.aiMetadata.set(msg.id, recommendation);
        }
      });
      
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

    // Send user message to backend
    this.chatService.sendMessage(this.activeConversation.id, content).subscribe(userMessage => {
      this.messages.push(userMessage);
      
      // If using direct AI, get response immediately
      if (this.useDirectAI) {
        this.getDirectAIResponse(content, userMessage.id);
      } else {
        // Fallback: wait for backend to generate response
        setTimeout(() => {
          this.isTyping = false;
          this.loadMessages(this.activeConversation!.id);
        }, 2500);
      }
    }, error => {
      console.error('Error sending message:', error);
      this.isTyping = false;
    });
  }

  /**
   * Get AI response directly from FastAPI
   */
  private getDirectAIResponse(question: string, userMessageId: string): void {
    this.aiCoachService.getAiResponse(question).subscribe({
      next: (recommendation: CoachRecommendation) => {
        // Store metadata for this message
        this.aiMetadata.set(userMessageId, recommendation);
        
        // Create AI message with metadata
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          conversationId: this.activeConversation!.id,
          sender: 'ai',
          content: recommendation.response,
          timestamp: new Date(),
          type: 'text'
        };
        
        // Store metadata for AI message too
        this.aiMetadata.set(aiMessage.id, recommendation);
        
        // Add AI message to UI
        this.messages.push(aiMessage);
        this.isTyping = false;
        this.scrollToBottom();
        
        // Auto-play audio if enabled
        if (this.autoPlayAudio && !this.isSpeaking) {
          this.speak(recommendation.response);
        }
        
        // Also save to backend for persistence (async, don't wait)
        this.chatService.sendMessage(this.activeConversation!.id, recommendation.response).subscribe({
          next: (savedMessage) => {
            // Update message ID if backend returned one
            if (savedMessage.id !== aiMessage.id) {
              const index = this.messages.findIndex(m => m.id === aiMessage.id);
              if (index !== -1) {
                this.messages[index].id = savedMessage.id;
                // Transfer metadata to new ID
                this.aiMetadata.set(savedMessage.id, recommendation);
                this.aiMetadata.delete(aiMessage.id);
              }
            }
            // Reload to sync with backend
            this.loadMessages(this.activeConversation!.id);
          },
          error: (err) => {
            console.warn('Could not save AI message to backend:', err);
            // Message is already displayed, continue
          }
        });
      },
      error: (error) => {
        console.error('Error getting AI response:', error);
        // Fallback to backend-generated response
        this.isTyping = false;
        setTimeout(() => {
          this.loadMessages(this.activeConversation!.id);
        }, 2000);
      }
    });
  }

  /**
   * Get AI metadata for a message
   */
  getAIMetadata(messageId: string): CoachRecommendation | undefined {
    return this.aiMetadata.get(messageId);
  }

  ngOnDestroy(): void {
    // Clean up audio resources
    if (this.isRecording) {
      this.cancelRecording();
    }
    if (this.isListening) {
      this.stopListening();
    }
    if (this.isSpeaking) {
      this.stopSpeaking();
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
      // Start speech recognition for real-time text conversion
      if (this.speechSupported) {
        this.startListening();
      }

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
        
        // Stop speech recognition
        if (this.isListening) {
          this.stopListening();
        }
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
      if (this.isListening) {
        this.stopListening();
      }
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
    
    // Stop speech recognition
    if (this.isListening) {
      this.stopListening();
    }
    
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }

    // If we have recognized text, update the input field
    if (this.recognizedText.trim()) {
      this.newMessage = this.recognizedText.trim();
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

    // If we have recognized text from speech recognition, use it
    const textContent = this.recognizedText.trim() || this.newMessage.trim() || '[Message audio]';
    const audioBlob = this.audioBlob;
    
    // Clean up UI state
    this.newMessage = '';
    this.recognizedText = '';
    this.isTyping = true;
    
    // Convert audio blob to base64 for sending
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      
      // Create a message with audio attachment
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
          url: base64Audio
        }]
      };
      
      // Add message to UI immediately
      this.messages.push(audioMessage);
      
      // Send to backend with audio attachment
      this.chatService.sendMessage(this.activeConversation!.id, textContent, audioMessage.attachments).subscribe(userMessage => {
        // If using direct AI, get response immediately
        if (this.useDirectAI) {
          this.getDirectAIResponse(textContent, userMessage.id);
        } else {
          setTimeout(() => {
            this.isTyping = false;
            this.loadMessages(this.activeConversation!.id);
          }, 2500);
        }
      });
      
      // Clean up audio
      this.removeAudio();
    };
    reader.readAsDataURL(audioBlob);
  }

  // ========== SPEECH RECOGNITION (Speech-to-Text) ==========
  
  /**
   * Initialize Web Speech Recognition API
   */
  initializeSpeechRecognition(): void {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser');
      this.speechSupported = false;
      return;
    }

    this.speechSupported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'fr-FR'; // French language

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update recognized text in real-time
      this.recognizedText = finalTranscript || interimTranscript;
      
      // Update input field with recognized text
      if (finalTranscript) {
        this.newMessage = finalTranscript.trim();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // User stopped speaking, this is normal
      } else if (event.error === 'not-allowed') {
        alert('Permission d\'accès au microphone refusée. Veuillez autoriser l\'accès dans les paramètres du navigateur.');
      }
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  /**
   * Start listening for speech input
   */
  async startListening(): Promise<void> {
    if (!this.speechSupported || !this.recognition) {
      alert('La reconnaissance vocale n\'est pas supportée dans ce navigateur.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    try {
      this.isListening = true;
      this.recognizedText = '';
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.isListening = false;
    }
  }

  /**
   * Stop listening for speech input
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Toggle between voice input and text input
   */
  toggleVoiceInput(): void {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  // ========== TEXT-TO-SPEECH ==========

  /**
   * Initialize Web Speech Synthesis API
   */
  initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesisSupported = true;
      console.log('✅ Speech Synthesis API is supported');
    } else {
      console.warn('❌ Speech Synthesis API not supported in this browser');
      this.synthesisSupported = false;
    }
  }

  /**
   * Speak text using Text-to-Speech
   */
  speak(text: string): void {
    if (!this.synthesisSupported) {
      console.warn('⚠️ Speech Synthesis not supported');
      return;
    }
    
    if (!text || !text.trim()) {
      console.warn('⚠️ Empty text, cannot speak');
      return;
    }

    console.log('🔊 Speaking text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));

    // Stop any ongoing speech
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log('🔊 Speech started');
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      console.log('🔊 Speech ended');
      this.isSpeaking = false;
    };

    utterance.onerror = (event: any) => {
      console.error('❌ Speech synthesis error:', event);
      this.isSpeaking = false;
      alert('Erreur lors de la lecture vocale: ' + (event.error || 'Erreur inconnue'));
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('❌ Error calling speechSynthesis.speak:', error);
      this.isSpeaking = false;
    }
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    if (this.synthesisSupported) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Toggle audio playback - unified function for single icon
   * If speaking, stops. If auto-play is on, toggles it off. Otherwise, plays last AI message or toggles auto-play.
   */
  toggleAudioPlayback(): void {
    console.log('🔊 Toggle audio playback clicked');
    console.log('🔊 Current state - isSpeaking:', this.isSpeaking, 'autoPlayAudio:', this.autoPlayAudio);
    console.log('🔊 Synthesis supported:', this.synthesisSupported);
    
    if (!this.synthesisSupported) {
      console.warn('⚠️ Speech Synthesis not supported. Cannot toggle audio.');
      alert('La synthèse vocale n\'est pas supportée dans ce navigateur. Veuillez utiliser Chrome ou Edge.');
      return;
    }
    
    // If currently speaking, stop it
    if (this.isSpeaking) {
      console.log('🔊 Stopping current playback');
      this.stopSpeaking();
      return;
    }
    
    // If auto-play is on, toggle it off
    if (this.autoPlayAudio) {
      console.log('🔊 Disabling auto-play');
      this.autoPlayAudio = false;
      return;
    }
    
    // Otherwise, play the last AI message or enable auto-play
    const lastAiMessage = [...this.messages].reverse().find(m => m.sender === 'ai');
    if (lastAiMessage && lastAiMessage.content) {
      console.log('🔊 Playing last AI message:', lastAiMessage.content.substring(0, 50) + '...');
      this.speak(lastAiMessage.content);
      // Enable auto-play for future messages
      this.autoPlayAudio = true;
    } else {
      console.log('🔊 No AI messages found. Enabling auto-play for future messages.');
      this.autoPlayAudio = true;
    }
  }

  /**
   * Toggle auto-play audio for AI responses (kept for backward compatibility)
   */
  toggleAutoPlayAudio(): void {
    this.toggleAudioPlayback();
  }
}



