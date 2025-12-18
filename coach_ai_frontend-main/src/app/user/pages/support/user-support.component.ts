import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportUserService } from '../../services/support-user.service';
import { SupportTicket } from '../../models/user.interfaces';

@Component({
  selector: 'app-user-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="support-page">
      <div class="page-header">
        <h1>Support & Assistance</h1>
        <button class="btn btn-primary" (click)="showCreateModal = true">
          <span class="material-icons">add</span>
          Nouveau Ticket
        </button>
      </div>

      <div class="tickets-list">
        <div class="ticket-card" *ngFor="let ticket of tickets" (click)="selectTicket(ticket)">
          <div class="ticket-header">
            <span class="ticket-status" [class]="'status-' + ticket.status">{{ getStatusLabel(ticket.status) }}</span>
            <span class="ticket-priority" [class]="'priority-' + ticket.priority">{{ ticket.priority }}</span>
          </div>
          <h3>{{ ticket.subject }}</h3>
          <p class="ticket-category">{{ getCategoryLabel(ticket.category) }}</p>
          <div class="ticket-meta">
            <span><span class="material-icons">chat</span> {{ ticket.messages.length }} messages</span>
            <span><span class="material-icons">schedule</span> {{ ticket.updatedAt | date:'short' }}</span>
          </div>
        </div>

        <div *ngIf="tickets.length === 0" class="empty-state">
          <span class="material-icons">support_agent</span>
          <p>Aucun ticket de support</p>
        </div>
      </div>
    </div>

    <!-- Create Ticket Modal -->
    <div class="modal-overlay" *ngIf="showCreateModal" (click)="showCreateModal = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Créer un Ticket de Support</h2>
          <button class="btn-close" (click)="showCreateModal = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Sujet *</label>
            <input type="text" [(ngModel)]="newTicketSubject" class="form-control" placeholder="Décrivez brièvement votre problème">
          </div>
          <div class="form-group">
            <label>Catégorie *</label>
            <select [(ngModel)]="newTicketCategory" class="form-control">
              <option value="technique">Problème Technique</option>
              <option value="contenu">Question sur le Contenu</option>
              <option value="compte">Gestion du Compte</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div class="form-group">
            <label>Priorité</label>
            <select [(ngModel)]="newTicketPriority" class="form-control">
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
            </select>
          </div>
          <div class="form-group">
            <label>Description *</label>
            <textarea [(ngModel)]="newTicketMessage" rows="5" class="form-control" placeholder="Décrivez votre problème en détail"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showCreateModal = false">Annuler</button>
          <button class="btn btn-primary" (click)="createTicket()" [disabled]="!newTicketSubject || !newTicketMessage">
            <span class="material-icons">send</span>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .support-page { max-width: 1000px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .tickets-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .ticket-card { background: white; padding: 24px; border-radius: 16px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .ticket-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .ticket-header { display: flex; gap: 8px; margin-bottom: 16px; }
    .ticket-status, .ticket-priority { padding: 4px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; }
    .status-nouveau { background: #dbeafe; color: #1e40af; }
    .status-en_cours { background: #fef3c7; color: #92400e; }
    .status-résolu { background: #d1fae5; color: #065f46; }
    .status-fermé { background: #e5e7eb; color: #374151; }
    .priority-basse { background: #f3f4f6; color: #374151; }
    .priority-moyenne { background: #fef3c7; color: #92400e; }
    .priority-haute { background: #fee2e2; color: #991b1b; }
    .ticket-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
    .ticket-category { font-size: 0.85rem; color: #6b7280; margin-bottom: 16px; }
    .ticket-meta { display: flex; gap: 16px; font-size: 0.85rem; color: #6b7280; }
    .ticket-meta span { display: flex; align-items: center; gap: 6px; }
    .ticket-meta .material-icons { font-size: 16px; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #6b7280; }
    .empty-state .material-icons { font-size: 64px; margin-bottom: 16px; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
    .modal-content { background: white; border-radius: 16px; width: 90%; max-width: 600px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); }
    .modal-header { padding: 24px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h2 { font-size: 1.25rem; font-weight: 700; }
    .btn-close { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 50%; }
    .modal-body { padding: 24px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 8px; }
    .form-control { width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; font-family: inherit; }
    .form-control:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
    .modal-footer { padding: 20px 24px; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 12px; }
    .btn { padding: 10px 20px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s ease; }
    .btn-primary { background: #10b981; color: white; }
    .btn-primary:hover:not(:disabled) { background: #059669; }
    .btn-primary:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-secondary:hover { background: #e5e7eb; }
    h1 { font-size: 2rem; font-weight: 700; }
  `]
})
export class UserSupportComponent implements OnInit {
  tickets: SupportTicket[] = [];
  showCreateModal = false;
  newTicketSubject = '';
  newTicketCategory: SupportTicket['category'] = 'technique';
  newTicketPriority: SupportTicket['priority'] = 'moyenne';
  newTicketMessage = '';

  constructor(private supportService: SupportUserService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.supportService.getTickets().subscribe(t => this.tickets = t);
  }

  createTicket(): void {
    this.supportService.createTicket(
      this.newTicketSubject,
      this.newTicketCategory,
      this.newTicketPriority,
      this.newTicketMessage
    ).subscribe(() => {
      this.loadTickets();
      this.showCreateModal = false;
      this.newTicketSubject = '';
      this.newTicketMessage = '';
    });
  }

  selectTicket(ticket: SupportTicket): void {
    alert(`Ticket: ${ticket.subject}\nStatut: ${this.getStatusLabel(ticket.status)}\nMessages: ${ticket.messages.length}`);
  }

  getStatusLabel(status: string): string {
    const labels: any = { 'nouveau': 'Nouveau', 'en_cours': 'En cours', 'résolu': 'Résolu', 'fermé': 'Fermé' };
    return labels[status] || status;
  }

  getCategoryLabel(category: string): string {
    const labels: any = { 'technique': 'Problème Technique', 'contenu': 'Question sur le Contenu', 'compte': 'Gestion du Compte', 'autre': 'Autre' };
    return labels[category] || category;
  }
}




