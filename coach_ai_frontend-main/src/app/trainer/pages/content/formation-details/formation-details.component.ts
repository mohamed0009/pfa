import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-formation-details',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page-container"><h1>Détails Formation - En développement</h1></div>`,
  styles: [`.page-container { padding: 2rem; }`]
})
export class FormationDetailsComponent {
  constructor(private route: ActivatedRoute) {}
}



