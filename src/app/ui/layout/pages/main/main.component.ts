import { Component, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { RouteService } from '@app/core/services/route.services';
import { Observable } from 'rxjs';
import { ThemeService } from '../../services/theme.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {
  opened = true;
  isDarkTheme: Observable<boolean>;
  theme = 'dark';

  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth < 768) {
      this.sidenav.fixedTopGap = 64;
      this.opened = false;
    } else {
      this.sidenav.fixedTopGap = 64
      this.opened = true;
    }
  }

  constructor(private routeService: RouteService, private themeService: ThemeService) { }

  ngOnInit(): void {
    if (window.innerWidth < 768) {
      this.sidenav.fixedTopGap = 64;
      this.opened = false;
    } else {
      this.sidenav.fixedTopGap = 64;
      this.opened = true;
    }
    this.init();
  }

  init() {
    this.isDarkTheme = this.themeService.isDarkTheme;
  }

  isBiggerScreen() {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (width < 768) {
      return true;
    } else {
      return false;
    }
  }

  toggleTheme(isDarkTheme: boolean) {
    //this.themeService.setDarkTheme(isDarkTheme);
    this.theme = this.theme === 'dark' ? 'custom' : 'dark';
    this.isDarkTheme = this.themeService.isDarkTheme;
  }
}
