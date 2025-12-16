import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page-container"><h1>Détails Apprenant - En développement</h1></div>`,
  styles: [`.page-container { padding: 2rem; }`]
})
export class StudentDetailsComponent {
  constructor(private route: ActivatedRoute) {}
}



