import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap } from 'rxjs';
import { ChatMessage, Conversation } from '../models/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiUrl = 'http://localhost:8080/api/user/chat';
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Récupérer toutes les conversations
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`).pipe(
      tap(conversations => {
        // Ensure format and sort if needed (backend already sorts)
        this.conversationsSubject.next(conversations);
      })
    );
  }

  // Récupérer les messages d'une conversation
  getMessages(conversationId: string): Observable<ChatMessage[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations/${conversationId}/messages`).pipe(
      map(messages => messages.map(msg => ({
        ...msg,
        sender: msg.sender.toLowerCase(), // Backend returns 'USER'/'AI', frontend needs 'user'/'ai'
        timestamp: new Date(msg.timestamp)
      })))
    );
  }

  // Envoyer un message
  sendMessage(conversationId: string, content: string): Observable<ChatMessage> {
    return this.http.post<any>(`${this.apiUrl}/conversations/${conversationId}/messages`, { content }).pipe(
      map(msg => ({
        ...msg,
        sender: msg.sender.toLowerCase(),
        timestamp: new Date(msg.timestamp)
      })),
      tap(() => {
        // Refresh conversations to update last message
        this.getConversations().subscribe();
      })
    );
  }

  // Créer une nouvelle conversation
  createConversation(title: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, { title }).pipe(
      tap(newConv => {
        const current = this.conversationsSubject.value;
        this.conversationsSubject.next([newConv, ...current]);
      })
    );
  }

  // Activer une conversation (local state only, mostly)
  setActiveConversation(conversationId: string): Observable<boolean> {
    const current = this.conversationsSubject.value;
    const updated = current.map(c => ({
      ...c,
      isActive: c.id === conversationId
    }));
    this.conversationsSubject.next(updated);
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // Supprimer une conversation
  deleteConversation(conversationId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/conversations/${conversationId}`).pipe(
      map(() => true),
      tap(() => {
        const current = this.conversationsSubject.value.filter(c => c.id !== conversationId);
        this.conversationsSubject.next(current);
      })
    );
  }
}
