import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quiz-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page-container"><h1>Révision Quiz - En développement</h1></div>`,
  styles: [`.page-container { padding: 2rem; }`]
})
export class QuizReviewsComponent {}



