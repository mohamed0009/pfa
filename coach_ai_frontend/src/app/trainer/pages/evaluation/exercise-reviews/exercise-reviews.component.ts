import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exercise-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page-container"><h1>Révision Exercices - En développement</h1></div>`,
  styles: [`.page-container { padding: 2rem; }`]
})
export class ExerciseReviewsComponent {}



