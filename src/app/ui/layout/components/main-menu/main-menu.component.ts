import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizeApiService } from '@app/authentication/services/authorize-api.service';
import { ConnectionInfoService } from '@app/authentication/services/connexion-info.service';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { RouteService } from '@app/core/services/route.services';
import { Observable, Subject, takeUntil, Subscription } from 'rxjs';
import { SsrService } from '../../services/ssr.service';
import { ThemeService } from '@app/core/services/theme.service';
import { ModalService } from '../../services/modal.service';
import { ModalConfig } from '../../models/modal-config.model';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  logged: boolean;
  showMobileMenu = false;

  tree: Tree;
  pages: WebItem[];
  isDarkTheme: Observable<boolean>;

  subModal: Subscription;
  notifier = new Subject<void>();

  constructor(private themeService: ThemeService,
    private modalService: ModalService,
    private ssrService: SsrService,
    private authService: AuthorizeApiService,
    private routeService: RouteService,
    private connexionInfo: ConnectionInfoService,
    private router: Router) { }

  ngOnInit(): void {
    if (!this.ssrService.isServer()) {
      console.log('checking login status...');
      this.authService.CheckToken().then(logged => {
        this.logged = logged;
        this.connexionInfo.GetOnChangeConnexion().subscribe(token => {
          this.logged = this.connexionInfo.IsAuth();
          console.log('is logged: ', this.logged);
        });
      });
      this.routeService.subscribeConfig(tree => {
        this.tree = tree;
        this.initPages();
      }, 'subTreeHeader');
    }
  }

  initPages() {
    if (this.tree && this.tree.pages && this.tree.pages.length) {
      this.pages = this.tree.pages;
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onClickedOutside(e: Event): void {
    //this.idSection = null;
  }

  goTo(page: string) {
    if (page === 'login' || (page === 'admin' && !this.logged)) {
      this.showModalLogin();
    } else if (page === 'logout') {
      this.authService.LogOut().then(() => {
        this.logged = false;
        //this.router.navigate([this.page]);
      });
    } else {
      this.router.navigate([page]);
    }
  }

  goToPage(page: string) {
    this.router.navigate(['page/' + page]);
  }

  showModalLogin() {
    this.modalService.open({
      title: 'Connexion',
      validateLabel: 'Connexion',
      cancelLabel: 'Mot de passe oublié',
      size: {
        width: '',
        height: ''
      },
      component: 'login'
    });
    this.modalService.returnData
    .pipe(takeUntil(this.notifier))
    .subscribe(result => {
      console.log('data received from modal: ', result);
      this.notifier.next();
      this.notifier.complete();
    });
  }
}
