import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WindowState } from '@app/core/models/window-state.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() windowState: WindowState;

  showMobileMenu = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }

  openMobileMenu() {
    this.showMobileMenu = true;
    document.body.className = 'no-scroll';
  }

  onClose() {
    this.showMobileMenu = false;
    document.body.className = '';
  }
}
