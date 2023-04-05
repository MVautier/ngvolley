import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { RouteService } from './core/services/route.services';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { MatSidenav } from '@angular/material/sidenav';
import { LayoutService } from './ui/layout/services/layout.service';
import { AuthorizeApiService } from './authentication/services/authorize-api.service';
import { ConnectionInfoService } from './authentication/services/connexion-info.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ModalService } from './ui/layout/services/modal.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'colomiers-volley';
    logged: boolean;
    isDarkTheme: boolean = true;
    isMobile: boolean = false;
    theme = 'dark';
    opened = environment.sidenavOpened;
    fullApp = environment.fullApp;
    subModal: Subscription;
    notifier = new Subject<void>();
    @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (this.fullApp) {
            this.checkWindowSize();
        }
    }

    constructor(
        private router: Router,
        private modalService: ModalService,
        private layoutService: LayoutService,
        private authService: AuthorizeApiService,
        private connexionInfo: ConnectionInfoService,
        private themeService: ThemeService) { 
            if (window.matchMedia('(max-width: 1025px)').matches) {
                this.isMobile = true;
            }
        }

        ngOnInit(): void {
            this.authService.CheckToken().then(logged => {
                this.logged = logged;
                this.connexionInfo.GetOnChangeConnexion().subscribe(token => {
                    this.logged = this.connexionInfo.IsAuth();
                    console.log('is logged: ', this.logged);
                });
            });
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
        if (this.logged) {
            this.router.navigate(['admin']);
        } else {
            this.showModalLogin();
        }
    }

    showModalLogin() {
        this.modalService.open({
            title: 'Connexion',
            validateLabel: 'Connexion',
            cancelLabel: 'Mot de passe oublié',
            showCancel: true,
            showValidate: true,
            size: {
                width: '',
                height: ''
            },
            component: 'login'
        });
        this.modalService.returnData
            .pipe(takeUntil(this.notifier))
            .subscribe(result => {
                if (result) {
                    this.notifier.next();
                    this.notifier.complete();
                    if (result.data?.id_token) {
                        console.log('token ok: ', result.data.id_token);
                        this.router.navigate(['admin']);
                    }
                }
            });
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
