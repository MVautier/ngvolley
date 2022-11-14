import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalLoginComponent } from '@app/authentication/components/modal-login/modal-login.component';
import { AuthorizeApiService } from '@app/authentication/services/authorize-api.service';
import { ConnectionInfoService } from '@app/authentication/services/connexion-info.service';
import { WindowState } from '@app/core/models/window-state.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() windowState: WindowState;
  logged: boolean;
  showMobileMenu = false;
  modalRef: BsModalRef;
  page: string;

  constructor(
    private modalService: BsModalService, 
    private authService: AuthorizeApiService,
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
    }

  ngOnInit(): void {
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
      this.page = page;
      this.router.navigate([page]);
    }
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
