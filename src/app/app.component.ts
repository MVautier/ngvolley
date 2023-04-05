import { Component, HostListener, ViewChild } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { RouteService } from './core/services/route.services';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { MatSidenav } from '@angular/material/sidenav';
import { LayoutService } from './ui/layout/services/layout.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'colomiers-volley';
    isDarkTheme: boolean = true;
    isMobile: boolean = false;
    theme = 'dark';
    opened = environment.sidenavOpened;
    fullApp = environment.fullApp;
    @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (this.fullApp) {
            this.checkWindowSize();
        }
    }

    constructor(
        private router: Router,
        private layoutService: LayoutService,
        private themeService: ThemeService) { 
            if (window.matchMedia('(max-width: 1025px)').matches) {
                this.isMobile = true;
            }
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

    goAdmin() {
        this.router.navigate(['admin']);
    }

    toggleMenu() {
        this.sidenav.toggle();
        this.opened = !this.opened;
        this.layoutService.setMenuOpened(this.sidenav.opened);
    }

    toggleTheme(isDarkTheme: boolean) {
        this.themeService.setTheme(isDarkTheme);
        this.theme = isDarkTheme ? 'dark' : 'light';
        this.isDarkTheme = isDarkTheme;
    }
}
