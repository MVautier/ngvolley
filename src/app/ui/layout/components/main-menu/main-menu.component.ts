import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ModalLoginComponent } from '@app/authentication/components/modal-login/modal-login.component';
import { AuthorizeApiService } from '@app/authentication/services/authorize-api.service';
import { ConnectionInfoService } from '@app/authentication/services/connexion-info.service';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { RouteService } from '@app/core/services/route.services';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first, Observable } from 'rxjs';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  logged: boolean;
  showMobileMenu = false;
  modalRef: BsModalRef;
  page: string;
  tree: Tree;
  pages: WebItem[];
  isDarkTheme: Observable<boolean>;

  constructor(private themeService: ThemeService,
    private modalService: BsModalService, 
    private authService: AuthorizeApiService,
    private routeService: RouteService,
    private connexionInfo: ConnectionInfoService,
    private router: Router) { }

  ngOnInit(): void {
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
      this.routeService.subscribePage(page => {
        this.page = page?.Slug;
      }, 'subPageHeader');
  }

  toggleDarkTheme(checked: boolean) {
    this.themeService.setDarkTheme(checked);
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
    this.modalRef = this.modalService.show(
      ModalLoginComponent,
      Object.assign({}, { class: 'gray modal-xlg' })
    );
    this.modalRef.content.onSuccessLogin.pipe(first()).subscribe(() => {
      this.modalRef.hide();
    });

    this.modalRef.content.cancelEvent.pipe(first()).subscribe(() => this.modalRef.hide());
  }
}
