import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Learning Analytics</h1>
      <p>Detailed analytics and charts coming soon...</p>
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
export class AnalyticsComponent {}





