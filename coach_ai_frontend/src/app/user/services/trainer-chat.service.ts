import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface TrainerConversation {
  id: string;
  title: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  messagesCount: number;
}

export interface TrainerMessage {
  id: string;
  content: string;
  sender: 'USER' | 'AI';
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TrainerChatService {
  private apiUrl = 'http://localhost:8081/api/user/trainer-chat';

  constructor(private http: HttpClient) {}

  getConversations(): Observable<TrainerConversation[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations`).pipe(
      map((conversations: any[]) => conversations.map(c => ({
        id: c.id,
        title: c.title,
        lastMessage: c.lastMessage,
        lastMessageDate: c.lastMessageDate ? new Date(c.lastMessageDate) : undefined,
        messagesCount: c.messagesCount || 0
      }))),
      catchError((error) => {
        console.error('Error fetching conversations:', error);
        return throwError(() => error);
      })
    );
  }

  getConversationMessages(conversationId: string): Observable<TrainerMessage[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversation/${conversationId}/messages`).pipe(
      map((messages: any[]): TrainerMessage[] => messages.map(m => ({
        id: m.id,
        content: m.content,
        sender: (m.sender === 'USER' ? 'USER' : 'AI') as 'USER' | 'AI',
        timestamp: new Date(m.timestamp),
        read: m.read || false
      }))),
      catchError((error) => {
        console.error('Error fetching messages:', error);
        return throwError(() => error);
      })
    );
  }

  sendMessage(conversationId: string, content: string): Observable<TrainerMessage> {
    return this.http.post<any>(`${this.apiUrl}/conversation/${conversationId}/message`, { content }).pipe(
      map((message: any): TrainerMessage => ({
        id: message.id,
        content: message.content,
        sender: (message.sender === 'USER' ? 'USER' : 'AI') as 'USER' | 'AI',
        timestamp: new Date(message.timestamp),
        read: message.read || false
      })),
      catchError((error) => {
        console.error('Error sending message:', error);
        return throwError(() => error);
      })
    );
  }

  createConversation(title?: string): Observable<TrainerConversation> {
    return this.http.post<any>(`${this.apiUrl}/conversation`, { title: title || 'Conversation avec formateur' }).pipe(
      map((conv: any) => ({
        id: conv.id,
        title: conv.title,
        lastMessage: conv.lastMessage,
        lastMessageDate: conv.lastMessageDate ? new Date(conv.lastMessageDate) : undefined,
        messagesCount: conv.messagesCount || 0
      })),
      catchError((error) => {
        console.error('Error creating conversation:', error);
        return throwError(() => error);
      })
    );
  }
}

