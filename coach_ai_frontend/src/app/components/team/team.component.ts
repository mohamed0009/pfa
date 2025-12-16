import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { TeamMember } from '../../models/interfaces';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  displayedMembers: TeamMember[] = [];
  currentStartIndex = 0;
  itemsPerView = 3;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getTeamMembers().subscribe(members => {
      this.teamMembers = members;
      this.updateDisplayedMembers();
    });
    this.updateItemsPerView();
  }

  updateItemsPerView(): void {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        this.itemsPerView = 1;
      } else if (window.innerWidth < 1200) {
        this.itemsPerView = 2;
      } else {
        this.itemsPerView = 3;
      }
      this.updateDisplayedMembers();
    }
  }

  updateDisplayedMembers(): void {
    this.displayedMembers = this.teamMembers.slice(
      this.currentStartIndex,
      this.currentStartIndex + this.itemsPerView
    );
  }

  nextSlide(): void {
    if (this.currentStartIndex + this.itemsPerView < this.teamMembers.length) {
      this.currentStartIndex++;
      this.updateDisplayedMembers();
    }
  }

  prevSlide(): void {
    if (this.currentStartIndex > 0) {
      this.currentStartIndex--;
      this.updateDisplayedMembers();
    }
  }

  canGoPrev(): boolean {
    return this.currentStartIndex > 0;
  }

  canGoNext(): boolean {
    return this.currentStartIndex + this.itemsPerView < this.teamMembers.length;
  }
}





