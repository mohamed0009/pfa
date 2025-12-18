import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trainers-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Trainers Dashboard</h1>
      <p>Trainers analytics and management coming soon...</p>
    </div>
  `,
  styles: [`
    .page-container {
      h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 16px;
      }
    }
  `]
})
export class TrainersDashboardComponent {}





