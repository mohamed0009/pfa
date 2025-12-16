import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { TherapyService } from '../../models/interfaces';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  services: TherapyService[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getTherapyServices().subscribe(services => {
      this.services = services;
    });
  }
}





