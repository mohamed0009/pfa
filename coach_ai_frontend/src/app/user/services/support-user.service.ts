import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { SupportTicket, TicketMessage } from '../models/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SupportUserService {
  private apiUrl = 'http://localhost:8081/api/user/support';
  
  constructor(private http: HttpClient) {}
  private mockTickets: SupportTicket[] = [
    {
      id: 'ticket1',
      userId: 'user1',
      subject: 'Problème de lecture vidéo',
      category: 'technique',
      priority: 'haute',
      status: 'résolu',
      createdAt: new Date('2025-12-10T10:00:00'),
      updatedAt: new Date('2025-12-11T14:30:00'),
      messages: [
        {
          id: 'msg1',
          ticketId: 'ticket1',
          sender: 'user',
          senderName: 'Marie Dupont',
          content: 'Bonjour, je n\'arrive pas à lire les vidéos du module React. Le lecteur se bloque au chargement.',
          timestamp: new Date('2025-12-10T10:00:00'),
          attachments: []
        },
        {
          id: 'msg2',
          ticketId: 'ticket1',
          sender: 'support',
          senderName: 'Support Technique',
          content: 'Bonjour Marie, merci de nous avoir contactés. Pouvez-vous nous indiquer quel navigateur vous utilisez ?',
          timestamp: new Date('2025-12-10T11:15:00'),
          attachments: []
        },
        {
          id: 'msg3',
          ticketId: 'ticket1',
          sender: 'user',
          senderName: 'Marie Dupont',
          content: 'J\'utilise Chrome version 120.',
          timestamp: new Date('2025-12-10T11:30:00'),
          attachments: []
        },
        {
          id: 'msg4',
          ticketId: 'ticket1',
          sender: 'support',
          senderName: 'Support Technique',
          content: 'Le problème a été identifié et corrigé. Veuillez vider le cache de votre navigateur et réessayer. Le problème devrait être résolu.',
          timestamp: new Date('2025-12-11T14:30:00'),
          attachments: []
        }
      ]
    },
    {
      id: 'ticket2',
      userId: 'user1',
      subject: 'Question sur l\'exercice React',
      category: 'contenu',
      priority: 'moyenne',
      status: 'en_cours',
      createdAt: new Date('2025-12-12T15:20:00'),
      updatedAt: new Date('2025-12-13T09:00:00'),
      messages: [
        {
          id: 'msg5',
          ticketId: 'ticket2',
          sender: 'user',
          senderName: 'Marie Dupont',
          content: 'Je ne comprends pas la consigne de l\'exercice "Todo List en React". Pouvez-vous me donner plus de détails ?',
          timestamp: new Date('2025-12-12T15:20:00'),
          attachments: []
        },
        {
          id: 'msg6',
          ticketId: 'ticket2',
          sender: 'trainer',
          senderName: 'Sophie Martin',
          content: 'Bonjour Marie, je vais vous aider. L\'exercice demande de créer une application qui permet d\'ajouter, supprimer et marquer des tâches. Vous devez utiliser le hook useState pour gérer la liste. Avez-vous des questions spécifiques ?',
          timestamp: new Date('2025-12-13T09:00:00'),
          attachments: []
        }
      ]
    },
    {
      id: 'ticket3',
      userId: 'user1',
      subject: 'Modification de mon profil',
      category: 'compte',
      priority: 'basse',
      status: 'nouveau',
      createdAt: new Date('2025-12-13T16:00:00'),
      updatedAt: new Date('2025-12-13T16:00:00'),
      messages: [
        {
          id: 'msg7',
          ticketId: 'ticket3',
          sender: 'user',
          senderName: 'Marie Dupont',
          content: 'Je souhaiterais changer ma formation actuelle de "Développement Web" à "Développement Mobile". Comment faire ?',
          timestamp: new Date('2025-12-13T16:00:00'),
          attachments: []
        }
      ]
    }
  ];

  // Récupérer tous les tickets de l'utilisateur
  getTickets(): Observable<SupportTicket[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tickets`).pipe(
      map((tickets: any[]) => tickets.map(t => this.mapBackendTicketToFrontend(t))),
      catchError((error) => {
        console.error('Error fetching tickets:', error);
        return of(this.mockTickets).pipe(delay(350));
      })
    );
  }

  // Récupérer un ticket spécifique
  getTicket(ticketId: string): Observable<SupportTicket | undefined> {
    return this.http.get<any>(`${this.apiUrl}/tickets/${ticketId}`).pipe(
      map((ticket: any) => this.mapBackendTicketToFrontend(ticket)),
      catchError((error) => {
        console.error('Error fetching ticket:', error);
        const ticket = this.mockTickets.find(t => t.id === ticketId);
        return of(ticket).pipe(delay(300));
      })
    );
  }

  // Créer un nouveau ticket
  createTicket(
    subject: string, 
    category: SupportTicket['category'], 
    priority: SupportTicket['priority'],
    initialMessage: string
  ): Observable<SupportTicket> {
    return this.http.post<any>(`${this.apiUrl}/tickets`, {
      subject,
      description: initialMessage,
      category: category.toUpperCase(),
      priority: priority.toUpperCase()
    }).pipe(
      map((ticket: any) => this.mapBackendTicketToFrontend(ticket)),
      catchError((error) => {
        console.error('Error creating ticket:', error);
        // Fallback to mock
        const newTicket: SupportTicket = {
          id: 'ticket_' + Date.now(),
          userId: 'user1',
          subject,
          category,
          priority,
          status: 'nouveau',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [
            {
              id: 'msg_' + Date.now(),
              ticketId: 'ticket_' + Date.now(),
              sender: 'user',
              senderName: 'Marie Dupont',
              content: initialMessage,
              timestamp: new Date(),
              attachments: []
            }
          ]
        };
        this.mockTickets.unshift(newTicket);
        return of(newTicket).pipe(delay(400));
      })
    );
  }

  private mapBackendTicketToFrontend(ticket: any): SupportTicket {
    return {
      id: ticket.id || '',
      userId: ticket.user?.id || '',
      subject: ticket.subject || '',
      category: (ticket.category?.toLowerCase() || 'autre') as SupportTicket['category'],
      priority: (ticket.priority?.toLowerCase() || 'moyenne') as SupportTicket['priority'],
      status: (ticket.status?.toLowerCase() || 'nouveau') as SupportTicket['status'],
      createdAt: ticket.createdAt ? new Date(ticket.createdAt) : new Date(),
      updatedAt: ticket.updatedAt ? new Date(ticket.updatedAt) : new Date(),
      messages: (ticket.messages || []).map((m: any) => ({
        id: m.id || '',
        ticketId: ticket.id || '',
        sender: m.sender?.toLowerCase() || 'user',
        senderName: m.senderName || '',
        content: m.content || '',
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        attachments: m.attachments || []
      }))
    };
  }

  // Ajouter un message à un ticket
  addMessage(ticketId: string, content: string): Observable<TicketMessage> {
    return this.http.post<any>(`${this.apiUrl}/tickets/${ticketId}/messages`, {
      message: content
    }).pipe(
      map((msg: any) => ({
        id: msg.id || '',
        ticketId: ticketId,
        sender: msg.sender?.toLowerCase() || 'user',
        senderName: msg.senderName || '',
        content: msg.content || content,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        attachments: msg.attachments || []
      })),
      catchError((error) => {
        console.error('Error adding message:', error);
        return throwError(() => error);
      })
    );
  }

  // Fermer un ticket
  closeTicket(ticketId: string): Observable<boolean> {
    const ticket = this.mockTickets.find(t => t.id === ticketId);
    
    if (ticket) {
      ticket.status = 'fermé';
      ticket.updatedAt = new Date();
      return of(true).pipe(delay(250));
    }

    return of(false);
  }

  // Récupérer les tickets par statut
  getTicketsByStatus(status: SupportTicket['status']): Observable<SupportTicket[]> {
    const filtered = this.mockTickets.filter(t => t.status === status);
    return of(filtered).pipe(delay(300));
  }

  // Récupérer les tickets par catégorie
  getTicketsByCategory(category: SupportTicket['category']): Observable<SupportTicket[]> {
    const filtered = this.mockTickets.filter(t => t.category === category);
    return of(filtered).pipe(delay(300));
  }

  // Rouvrir un ticket fermé
  reopenTicket(ticketId: string, reason: string): Observable<boolean> {
    const ticket = this.mockTickets.find(t => t.id === ticketId);
    
    if (ticket && (ticket.status === 'fermé' || ticket.status === 'résolu')) {
      ticket.status = 'en_cours';
      ticket.updatedAt = new Date();
      
      // Ajouter un message expliquant la réouverture
      const reopenMessage: TicketMessage = {
        id: 'msg_' + Date.now(),
        ticketId,
        sender: 'user',
        senderName: 'Marie Dupont',
        content: `Réouverture du ticket : ${reason}`,
        timestamp: new Date(),
        attachments: []
      };
      
      ticket.messages.push(reopenMessage);
      
      return of(true).pipe(delay(300));
    }

    return of(false);
  }

  // Obtenir le nombre de tickets ouverts
  getOpenTicketsCount(): Observable<number> {
    const count = this.mockTickets.filter(t => 
      t.status === 'nouveau' || t.status === 'en_cours'
    ).length;
    
    return of(count).pipe(delay(150));
  }
}




