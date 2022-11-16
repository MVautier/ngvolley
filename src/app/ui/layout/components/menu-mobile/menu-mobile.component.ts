import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizeApiService } from '@app/authentication/services/authorize-api.service';
import { ConnectionInfoService } from '@app/authentication/services/connexion-info.service';
import { WindowState } from '@app/core/models/window-state.model';
import { environment } from 'src/environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first, Subscription } from 'rxjs';
import { ModalLoginComponent } from '@app/authentication/components/modal-login/modal-login.component';
import { WebItem } from '@app/core/models/web-item.model';
import { Tree } from '@app/core/models/tree.model';
import { RouteService } from '@app/core/services/route.services';

@Component({
  selector: 'app-menu-mobile',
  templateUrl: './menu-mobile.component.html',
  styleUrls: ['./menu-mobile.component.scss']
})
export class MenuMobileComponent implements OnInit, OnDestroy {
  @Input() showMobileMenu: boolean;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  modalRef: BsModalRef;
  isProd = environment.production;
  env = environment;
  identite: string;
  page: string;
  logged: boolean;
  tree: Tree;
  pages: WebItem[];
  subTree: Subscription;
  subRoute: Subscription;

  constructor(
    private modalService: BsModalService, 
    private authService: AuthorizeApiService,
    private routeService: RouteService,
    private connexionInfo: ConnectionInfoService,
    private router: Router) {
      this.authService.CheckToken().then(logged => {
        this.logged = logged;
        this.connexionInfo.GetOnChangeConnexion().subscribe(token => {
          this.logged = this.connexionInfo.IsAuth();
          console.log('is logged: ', this.logged);
        });
      });
      this.subTree = this.routeService.tree.subscribe(tree => {
        this.tree = tree;
        this.initPages();
      });
      this.subRoute = this.routeService.page.subscribe(page => {
        this.page = page?.Slug;
      });
  }

  ngOnInit() {
    
  }

  ngOnDestroy(): void {
    if (this.subTree) {
      this.subTree.unsubscribe();
    }
    if (this.subRoute) {
      this.subRoute.unsubscribe();
    }
  }

  initPages() {
    if (this.tree && this.tree.pages && this.tree.pages.length) {
      this.pages = this.tree.pages;
    }
  }

  goTo(page: string) {
    if (page === 'login' || (page === 'admin' && !this.logged)) {
      this.showModalLogin();
    } else if (page === 'logout') {
      this.authService.LogOut().then(() => {
        this.logged = false;
        this.page = 'home';
        this.router.navigate([this.page]);
      });
    } else {
      this.router.navigate([page]);
    }
  }

  goToPage(page: string) {
    this.router.navigate(['page/' + page]);
  }

  onClose() {
    this.close.emit();
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
