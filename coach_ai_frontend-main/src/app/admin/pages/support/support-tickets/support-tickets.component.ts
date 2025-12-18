import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService } from '../../../services/support.service';
import { 
  SupportTicket, 
  TicketStatus, 
  TicketPriority,
  TicketCategory,
  TicketMessage
} from '../../../models/admin.interfaces';

@Component({
  selector: 'app-support-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support-tickets.component.html',
  styleUrl: './support-tickets.component.scss'
})
export class SupportTicketsComponent implements OnInit {
  tickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  
  // Stats
  ticketStats = {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
    averageResolutionTime: 0
  };

  // Filters
  statusFilter: TicketStatus | 'all' = 'all';
  priorityFilter: TicketPriority | 'all' = 'all';
  categoryFilter: TicketCategory | 'all' = 'all';

  // Selected ticket & conversation
  selectedTicket: SupportTicket | null = null;
  showTicketDetail = false;
  newMessage = '';

  constructor(private supportService: SupportService) {}

  ngOnInit(): void {
    this.loadTickets();
    this.loadStatistics();
  }

  loadTickets(): void {
    this.supportService.getTickets().subscribe(tickets => {
      this.tickets = tickets;
      this.applyFilters();
    });
  }

  loadStatistics(): void {
    this.supportService.getTicketStatistics().subscribe(stats => {
      this.ticketStats = stats;
    });
  }

  applyFilters(): void {
    let filtered = [...this.tickets];

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === this.statusFilter);
    }

    if (this.priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === this.priorityFilter);
    }

    if (this.categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === this.categoryFilter);
    }

    this.filteredTickets = filtered;
  }

  selectTicket(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.showTicketDetail = true;
  }

  closeTicketDetail(): void {
    this.showTicketDetail = false;
    this.selectedTicket = null;
    this.newMessage = '';
  }

  updateStatus(ticket: SupportTicket, status: TicketStatus): void {
    this.supportService.updateTicketStatus(ticket.id, status).subscribe(() => {
      this.loadTickets();
      this.loadStatistics();
      if (this.selectedTicket && this.selectedTicket.id === ticket.id) {
        this.selectedTicket.status = status;
      }
    });
  }

  updatePriority(ticket: SupportTicket, priority: TicketPriority): void {
    this.supportService.updateTicketPriority(ticket.id, priority).subscribe(() => {
      this.loadTickets();
      if (this.selectedTicket && this.selectedTicket.id === ticket.id) {
        this.selectedTicket.priority = priority;
      }
    });
  }

  sendMessage(): void {
    if (!this.selectedTicket || !this.newMessage.trim()) return;

    const message: Partial<TicketMessage> = {
      senderId: 'current-admin',
      senderName: 'Administrateur',
      senderRole: 'Administrateur',
      message: this.newMessage,
      isInternal: false
    };

    this.supportService.addMessage(this.selectedTicket.id, message).subscribe(() => {
      this.newMessage = '';
      // Reload ticket to get updated messages
      this.supportService.getTicketById(this.selectedTicket!.id).subscribe(ticket => {
        if (ticket) {
          this.selectedTicket = ticket;
        }
      });
    });
  }

  // Helpers
  getPriorityColor(priority: TicketPriority): string {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  }

  getStatusColor(status: TicketStatus): string {
    switch (status) {
      case 'open': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'waiting_response': return '#8b5cf6';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  }

  getStatusLabel(status: TicketStatus): string {
    const labels: Record<TicketStatus, string> = {
      'open': 'Ouvert',
      'in_progress': 'En cours',
      'waiting_response': 'En attente de réponse',
      'resolved': 'Résolu',
      'closed': 'Fermé'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: TicketPriority): string {
    const labels: Record<TicketPriority, string> = {
      'urgent': 'Urgent',
      'high': 'Haute',
      'medium': 'Moyenne',
      'low': 'Basse'
    };
    return labels[priority] || priority;
  }

  getCategoryLabel(category: TicketCategory): string {
    const labels: Record<TicketCategory, string> = {
      'technical': 'Technique',
      'pedagogical': 'Pédagogique',
      'account': 'Compte',
      'payment': 'Paiement',
      'other': 'Autre'
    };
    return labels[category] || category;
  }
}




