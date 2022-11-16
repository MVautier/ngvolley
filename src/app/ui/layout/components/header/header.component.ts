import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalLoginComponent } from '@app/authentication/components/modal-login/modal-login.component';
import { AuthorizeApiService } from '@app/authentication/services/authorize-api.service';
import { ConnectionInfoService } from '@app/authentication/services/connexion-info.service';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { WindowState } from '@app/core/models/window-state.model';
import { RouteService } from '@app/core/services/route.services';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() windowState: WindowState;
  logged: boolean;
  showMobileMenu = false;
  modalRef: BsModalRef;
  page: string;
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
      console.log('checking login status...');
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

  ngOnInit(): void {
    
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
        this.router.navigate([this.page]);
      });
    } else {
      this.router.navigate([page]);
    }
  }

  goToPage(page: string) {
    this.router.navigate(['page/' + page]);
  }

  openMobileMenu() {
    this.showMobileMenu = true;
    document.body.className = 'no-scroll';
  }

  onClose() {
    this.showMobileMenu = false;
    document.body.className = '';
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
