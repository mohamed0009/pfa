import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  SupportTicket, 
  TicketMessage, 
  TicketStatus,
  TicketPriority,
  TicketCategory
} from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private apiUrl = 'http://localhost:8081/api/admin/support';
  
  private ticketsSubject = new BehaviorSubject<SupportTicket[]>([]);
  
  constructor(private http: HttpClient) {
    // Initialiser le BehaviorSubject avec les tickets mockés
    // Note: Les tickets seront remplacés par les données du backend
  }

  private tickets: SupportTicket[] = [
    {
      id: 't1',
      ticketNumber: 'TICKET-001',
      title: 'Impossible de se connecter à la plateforme',
      description: 'J\'essaie de me connecter depuis ce matin mais je reçois toujours une erreur "Email ou mot de passe incorrect" même avec le bon mot de passe.',
      category: 'technical',
      priority: 'high',
      status: 'in_progress',
      userId: 'u1',
      userName: 'Sophie Martin',
      userEmail: 'sophie.martin@example.com',
      assignedTo: 'admin1',
      assignedToName: 'Jean Dupont',
      messages: [
        {
          id: 'msg1',
          ticketId: 't1',
          senderId: 'u1',
          senderName: 'Sophie Martin',
          senderRole: 'Apprenant',
          message: 'J\'essaie de me connecter depuis ce matin mais je reçois toujours une erreur.',
          timestamp: new Date('2024-12-13T09:00:00'),
          isInternal: false
        },
        {
          id: 'msg2',
          ticketId: 't1',
          senderId: 'admin1',
          senderName: 'Jean Dupont',
          senderRole: 'Administrateur',
          message: 'Bonjour Sophie, je vais vérifier votre compte. Pouvez-vous essayer de réinitialiser votre mot de passe?',
          timestamp: new Date('2024-12-13T09:15:00'),
          isInternal: false
        }
      ],
      createdAt: new Date('2024-12-13T09:00:00'),
      updatedAt: new Date('2024-12-13T09:15:00')
    },
    {
      id: 't2',
      ticketNumber: 'TICKET-002',
      title: 'Question sur le contenu du cours React',
      description: 'Je ne comprends pas la section sur les hooks. Pourriez-vous m\'expliquer la différence entre useState et useEffect?',
      category: 'pedagogical',
      priority: 'medium',
      status: 'waiting_response',
      userId: 'u2',
      userName: 'Marc Dubois',
      userEmail: 'marc.dubois@example.com',
      assignedTo: 'trainer1',
      assignedToName: 'Marie Leclerc',
      messages: [
        {
          id: 'msg3',
          ticketId: 't2',
          senderId: 'u2',
          senderName: 'Marc Dubois',
          senderRole: 'Apprenant',
          message: 'Je ne comprends pas la section sur les hooks.',
          timestamp: new Date('2024-12-13T10:30:00'),
          isInternal: false
        },
        {
          id: 'msg4',
          ticketId: 't2',
          senderId: 'trainer1',
          senderName: 'Marie Leclerc',
          senderRole: 'Formateur',
          message: 'useState permet de gérer l\'état local du composant, tandis que useEffect gère les effets de bord. Je vais préparer une explication détaillée.',
          timestamp: new Date('2024-12-13T11:00:00'),
          isInternal: false
        }
      ],
      createdAt: new Date('2024-12-13T10:30:00'),
      updatedAt: new Date('2024-12-13T11:00:00')
    },
    {
      id: 't3',
      ticketNumber: 'TICKET-003',
      title: 'Demande de remboursement',
      description: 'Je souhaite être remboursé pour la formation JavaScript que je n\'ai pas pu suivre pour des raisons personnelles.',
      category: 'payment',
      priority: 'low',
      status: 'open',
      userId: 'u3',
      userName: 'Amina Khalil',
      userEmail: 'amina.khalil@example.com',
      messages: [
        {
          id: 'msg5',
          ticketId: 't3',
          senderId: 'u3',
          senderName: 'Amina Khalil',
          senderRole: 'Apprenant',
          message: 'Je souhaite être remboursé pour la formation JavaScript.',
          timestamp: new Date('2024-12-13T14:00:00'),
          isInternal: false
        }
      ],
      createdAt: new Date('2024-12-13T14:00:00'),
      updatedAt: new Date('2024-12-13T14:00:00')
    },
    {
      id: 't4',
      ticketNumber: 'TICKET-004',
      title: 'Certificat de formation non reçu',
      description: 'J\'ai terminé la formation Data Science il y a 2 semaines mais je n\'ai toujours pas reçu mon certificat.',
      category: 'account',
      priority: 'medium',
      status: 'resolved',
      userId: 'u4',
      userName: 'Thomas Leroy',
      userEmail: 'thomas.leroy@example.com',
      assignedTo: 'admin2',
      assignedToName: 'Pierre Martin',
      messages: [
        {
          id: 'msg6',
          ticketId: 't4',
          senderId: 'u4',
          senderName: 'Thomas Leroy',
          senderRole: 'Apprenant',
          message: 'Je n\'ai pas reçu mon certificat de formation.',
          timestamp: new Date('2024-12-12T10:00:00'),
          isInternal: false
        },
        {
          id: 'msg7',
          ticketId: 't4',
          senderId: 'admin2',
          senderName: 'Pierre Martin',
          senderRole: 'Administrateur',
          message: 'Votre certificat a été généré et envoyé à votre adresse email.',
          timestamp: new Date('2024-12-12T11:30:00'),
          isInternal: false
        }
      ],
      createdAt: new Date('2024-12-12T10:00:00'),
      updatedAt: new Date('2024-12-12T11:30:00'),
      resolvedAt: new Date('2024-12-12T11:30:00'),
      resolutionTime: 1.5
    }
  ];

  // ==================== TICKETS ====================

  getTickets(filters?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    assignedTo?: string;
  }): Observable<SupportTicket[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.category) params = params.set('category', filters.category);
    }
    
    return this.http.get<any[]>(`${this.apiUrl}/tickets`, { params }).pipe(
      map((tickets: any[]) => tickets.map(t => this.mapBackendTicketToFrontend(t))),
      catchError((error) => {
        console.error('Error fetching tickets:', error);
        // Fallback to mock
        let filtered = [...this.tickets];
        if (filters) {
          if (filters.status) filtered = filtered.filter(t => t.status === filters.status);
          if (filters.priority) filtered = filtered.filter(t => t.priority === filters.priority);
          if (filters.category) filtered = filtered.filter(t => t.category === filters.category);
          if (filters.assignedTo) filtered = filtered.filter(t => t.assignedTo === filters.assignedTo);
        }
        return of(filtered).pipe(delay(300));
      })
    );
  }

  getTicketById(id: string): Observable<SupportTicket | undefined> {
    return this.http.get<any>(`${this.apiUrl}/tickets/${id}`).pipe(
      map((ticket: any) => this.mapBackendTicketToFrontend(ticket)),
      catchError((error) => {
        console.error('Error fetching ticket:', error);
        const ticket = this.tickets.find(t => t.id === id);
        return of(ticket).pipe(delay(200));
      })
    );
  }
  
  private mapBackendTicketToFrontend(ticket: any): SupportTicket {
    return {
      id: ticket.id || '',
      ticketNumber: ticket.ticketNumber || '',
      title: ticket.title || '',
      description: ticket.description || '',
      category: (ticket.category || 'other') as TicketCategory,
      priority: (ticket.priority || 'medium') as TicketPriority,
      status: (ticket.status || 'open') as TicketStatus,
      userId: ticket.userId || '',
      userName: ticket.userName || '',
      userEmail: ticket.userEmail || '',
      assignedTo: ticket.assignedTo || '',
      assignedToName: ticket.assignedToName || '',
      messages: (ticket.messages || []).map((m: any) => ({
        id: m.id || '',
        ticketId: ticket.id || '',
        senderId: m.senderId || '',
        senderName: m.senderName || '',
        senderRole: m.senderRole || '',
        message: m.message || '',
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        isInternal: m.isInternal || false
      })),
      createdAt: ticket.createdAt ? new Date(ticket.createdAt) : new Date(),
      updatedAt: ticket.updatedAt ? new Date(ticket.updatedAt) : new Date()
    };
  }

  createTicket(ticket: Partial<SupportTicket>): Observable<SupportTicket> {
    const newTicket: SupportTicket = {
      id: 't' + (this.tickets.length + 1),
      ticketNumber: 'TICKET-' + String(this.tickets.length + 1).padStart(3, '0'),
      title: ticket.title || '',
      description: ticket.description || '',
      category: ticket.category || 'other',
      priority: ticket.priority || 'medium',
      status: 'open',
      userId: ticket.userId || '',
      userName: ticket.userName || '',
      userEmail: ticket.userEmail || '',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tickets.push(newTicket);
    this.ticketsSubject.next(this.tickets);
    return of(newTicket).pipe(delay(400));
  }

  updateTicketStatus(id: string, status: TicketStatus): Observable<SupportTicket> {
    return this.http.put<any>(`${this.apiUrl}/tickets/${id}/status`, { status }).pipe(
      map(() => {
        // Reload ticket
        return this.getTicketById(id);
      }),
      map((ticketObs: Observable<SupportTicket | undefined>) => {
        let ticket: SupportTicket | undefined;
        ticketObs.subscribe(t => ticket = t);
        if (!ticket) throw new Error('Ticket not found');
        return ticket;
      }),
      catchError((error) => {
        console.error('Error updating ticket status:', error);
        // Fallback to mock
        const index = this.tickets.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tickets[index] = {
            ...this.tickets[index],
            status,
            updatedAt: new Date(),
            resolvedAt: status === 'resolved' || status === 'closed' ? new Date() : undefined
          };
          this.ticketsSubject.next(this.tickets);
          return of(this.tickets[index]).pipe(delay(300));
        }
        throw new Error('Ticket not found');
      })
    );
  }

  updateTicketPriority(id: string, priority: TicketPriority): Observable<SupportTicket> {
    const index = this.tickets.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tickets[index] = {
        ...this.tickets[index],
        priority,
        updatedAt: new Date()
      };
      this.ticketsSubject.next(this.tickets);
      return of(this.tickets[index]).pipe(delay(300));
    }
    throw new Error('Ticket not found');
  }

  assignTicket(id: string, assignedTo: string, assignedToName: string): Observable<SupportTicket> {
    return this.http.put<any>(`${this.apiUrl}/tickets/${id}/assign`, { assignedTo }).pipe(
      map(() => {
        // Reload ticket
        return this.getTicketById(id);
      }),
      map((ticketObs: Observable<SupportTicket | undefined>) => {
        let ticket: SupportTicket | undefined;
        ticketObs.subscribe(t => ticket = t);
        if (!ticket) throw new Error('Ticket not found');
        return ticket;
      }),
      catchError((error) => {
        console.error('Error assigning ticket:', error);
        // Fallback to mock
        const index = this.tickets.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tickets[index] = {
            ...this.tickets[index],
            assignedTo,
            assignedToName,
            status: 'in_progress',
            updatedAt: new Date()
          };
          this.ticketsSubject.next(this.tickets);
          return of(this.tickets[index]).pipe(delay(300));
        }
        throw new Error('Ticket not found');
      })
    );
  }

  // ==================== MESSAGES ====================

  addMessage(ticketId: string, message: Partial<TicketMessage>): Observable<TicketMessage> {
    const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      const newMessage: TicketMessage = {
        id: 'msg' + Date.now(),
        ticketId,
        senderId: message.senderId || '',
        senderName: message.senderName || '',
        senderRole: message.senderRole || 'Administrateur',
        message: message.message || '',
        timestamp: new Date(),
        isInternal: message.isInternal || false
      };

      this.tickets[ticketIndex].messages.push(newMessage);
      this.tickets[ticketIndex].updatedAt = new Date();

      // Update status if was open
      if (this.tickets[ticketIndex].status === 'open') {
        this.tickets[ticketIndex].status = 'in_progress';
      }

      this.ticketsSubject.next(this.tickets);
      return of(newMessage).pipe(delay(350));
    }
    throw new Error('Ticket not found');
  }

  // ==================== STATISTICS ====================

  getTicketStatistics(): Observable<any> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const resolvedTickets = this.tickets.filter(t => 
      t.status === 'resolved' || t.status === 'closed'
    );

    const averageResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) / resolvedTickets.length
      : 0;

    return of({
      total: this.tickets.length,
      open: this.tickets.filter(t => t.status === 'open').length,
      inProgress: this.tickets.filter(t => t.status === 'in_progress').length,
      waitingResponse: this.tickets.filter(t => t.status === 'waiting_response').length,
      resolved: this.tickets.filter(t => t.status === 'resolved').length,
      closed: this.tickets.filter(t => t.status === 'closed').length,
      highPriority: this.tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
      averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
      ticketsLast24h: this.tickets.filter(t => t.createdAt >= last24h).length,
      ticketsLast7days: this.tickets.filter(t => t.createdAt >= last7days).length,
      byCategory: {
        technical: this.tickets.filter(t => t.category === 'technical').length,
        pedagogical: this.tickets.filter(t => t.category === 'pedagogical').length,
        account: this.tickets.filter(t => t.category === 'account').length,
        payment: this.tickets.filter(t => t.category === 'payment').length,
        other: this.tickets.filter(t => t.category === 'other').length
      }
    }).pipe(delay(300));
  }
}




