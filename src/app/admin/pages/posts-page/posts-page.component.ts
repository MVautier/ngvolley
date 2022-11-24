import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posts-page',
  templateUrl: './posts-page.component.html',
  styleUrls: ['./posts-page.component.scss']
})
export class PostsPageComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  add() {

  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
