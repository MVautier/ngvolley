import { Component, HostListener, OnInit, ViewChild, ViewEncapsulation, makeStateKey } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

import { RouteService } from '@app/core/services/route.services';
import { TransferStateService } from '@app/core/services/transfert-state.service';
import { Observable } from 'rxjs';
import { SsrService } from '../../services/ssr.service';
import { ThemeService } from '@app/core/services/theme.service';
import { LayoutService } from '../../services/layout.service';
import { environment } from '@env/environment';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {
  opened = environment.sidenavOpened;
  isDarkTheme: boolean;
  theme = 'dark';

  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkWindowSize();
  }

  constructor(
    private routeService: RouteService, 
    private layoutService: LayoutService,
    private ssrService: SsrService,
    private transferState: TransferStateService,
    private themeService: ThemeService) { }

  ngOnInit(): void {
    if (!this.ssrService.isServer()) {
      const errorKey = makeStateKey<any>('CUSTOM_ERRORS');
      const errors = this.transferState.get(errorKey, []);
      console.log('errors in main : ', errors);
      this.checkWindowSize();
    }
    
    this.init();
  }

  checkWindowSize() {
    setTimeout(() => {
      if (window.innerWidth < 768) {
        this.sidenav.fixedTopGap = 64;
        this.opened = false;
      } else {
        this.sidenav.fixedTopGap = 64
        this.opened = true;
      }
    }, 0);
  }

  init() {
    this.isDarkTheme = this.themeService.isDarkTheme.value;
  }

  toggleMenu() {
    this.sidenav.toggle();
    this.opened = !this.opened;
    this.layoutService.setMenuOpened(this.sidenav.opened);
  }

  isBiggerScreen(): boolean {
    if (!this.ssrService.isServer()) {
      const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      if (width < 768) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  toggleTheme(isDarkTheme: boolean) {
    this.themeService.setTheme(isDarkTheme);
    this.theme = isDarkTheme ? 'dark' : 'light';
    this.isDarkTheme = isDarkTheme;
  }
}
