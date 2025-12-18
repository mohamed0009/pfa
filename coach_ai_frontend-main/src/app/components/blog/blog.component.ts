import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { BlogArticle } from '../../models/interfaces';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit {
  articles: BlogArticle[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getBlogArticles().subscribe(articles => {
      this.articles = articles;
    });
  }
}





