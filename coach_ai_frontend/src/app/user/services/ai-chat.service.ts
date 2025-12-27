import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ChatMessage, Conversation } from '../models/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiUrl = 'http://localhost:8081/api/user/chat';
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  private messagesCache: { [conversationId: string]: ChatMessage[] } = {};

  constructor(private http: HttpClient) {
    this.loadConversations();
  }

  private loadConversations(): void {
    this.getConversations().subscribe({
      error: (error) => {
        console.warn('Could not load conversations on init:', error);
      }
    });
  }

  // Récupérer toutes les conversations
  getConversations(): Observable<Conversation[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations`).pipe(
      map((convs: any[]) => {
        const conversations: Conversation[] = convs.map(conv => ({
          id: conv.id,
          userId: conv.userId || '',
          title: conv.title || 'Nouvelle conversation',
          lastMessage: conv.lastMessage || '',
          lastMessageDate: conv.lastMessageDate ? new Date(conv.lastMessageDate) : new Date(),
          messagesCount: conv.messagesCount || 0,
          isActive: false
        }));
        this.conversationsSubject.next(conversations);
        return conversations;
      }),
      catchError((error) => {
        console.error('Error fetching conversations:', error);
        return throwError(() => error);
      })
    );
  }

  // Récupérer les messages d'une conversation
  getMessages(conversationId: string): Observable<ChatMessage[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations/${conversationId}/messages`).pipe(
      map((messages: any[]) => {
        const chatMessages: ChatMessage[] = messages.map(msg => ({
          id: msg.id,
          conversationId: msg.conversationId || conversationId,
          sender: msg.sender === 'AI' || msg.sender === 'ai' ? 'ai' : 'user',
          content: msg.content || '',
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          type: msg.type || 'text',
          attachments: msg.attachments ? msg.attachments.map((att: any) => ({
            id: att.id,
            type: att.type?.toLowerCase() || 'link',
            title: att.title || 'Attachment',
            url: att.url || ''
          })) : []
        }));
        this.messagesCache[conversationId] = chatMessages;
        return chatMessages;
      }),
      catchError((error) => {
        console.error('Error fetching messages:', error);
        return throwError(() => error);
      })
    );
  }

  // Envoyer un message (le backend génère automatiquement la réponse IA)
  sendMessage(conversationId: string, content: string, attachments?: any[]): Observable<ChatMessage> {
    const payload: any = { content: content };
    if (attachments && attachments.length > 0) {
      payload.attachments = attachments;
    }
    
    return this.http.post<any>(`${this.apiUrl}/conversations/${conversationId}/messages`, payload).pipe(
      map((msg: any) => {
        const userMessage: ChatMessage = {
          id: msg.id,
          conversationId: msg.conversationId || conversationId,
          sender: 'user',
          content: msg.content || content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          type: 'text',
          attachments: msg.attachments || attachments || []
        };
        
        // Recharger les messages pour obtenir la réponse IA
        this.getMessages(conversationId).subscribe();
        this.getConversations().subscribe();
        
        return userMessage;
      }),
      catchError((error) => {
        console.error('Error sending message:', error);
        return throwError(() => error);
      })
    );
  }

  // Créer une nouvelle conversation
  createConversation(title: string): Observable<Conversation> {
    return this.http.post<any>(`${this.apiUrl}/conversations`, {
      title: title
    }).pipe(
      map((conv: any) => {
        const newConv: Conversation = {
          id: conv.id,
          userId: conv.userId || '',
          title: conv.title || title,
          lastMessage: conv.lastMessage || 'Nouvelle conversation',
          lastMessageDate: conv.lastMessageDate ? new Date(conv.lastMessageDate) : new Date(),
          messagesCount: conv.messagesCount || 0,
          isActive: true
        };
        this.getConversations().subscribe();
        return newConv;
      }),
      catchError((error) => {
        console.error('Error creating conversation:', error);
        return throwError(() => error);
      })
    );
  }

  // Activer une conversation
  setActiveConversation(conversationId: string): Observable<boolean> {
    const conversations = this.conversationsSubject.value;
    conversations.forEach(c => c.isActive = c.id === conversationId);
    this.conversationsSubject.next([...conversations]);
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // Supprimer une conversation
  deleteConversation(conversationId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/conversations/${conversationId}`).pipe(
      map(() => {
        delete this.messagesCache[conversationId];
        this.getConversations().subscribe();
        return true;
      }),
      catchError((error) => {
        console.error('Error deleting conversation:', error);
        return throwError(() => error);
      })
    );
  }
}




