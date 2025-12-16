import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page-container"><h1>Messages - En développement</h1></div>`,
  styles: [`.page-container { padding: 2rem; }`]
})
export class MessagesComponent {}



