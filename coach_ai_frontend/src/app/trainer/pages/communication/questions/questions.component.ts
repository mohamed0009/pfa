import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page-container"><h1>Questions des Apprenants - En développement</h1></div>`,
  styles: [`.page-container { padding: 2rem; }`]
})
export class QuestionsComponent {}



