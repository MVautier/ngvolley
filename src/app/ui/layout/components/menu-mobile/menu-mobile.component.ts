import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizeApiService } from '@app/authentication/services/authorize-api.service';
import { ConnectionInfoService } from '@app/authentication/services/connexion-info.service';
import { WindowState } from '@app/core/models/window-state.model';
import { environment } from 'src/environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs';
import { ModalLoginComponent } from '@app/authentication/components/modal-login/modal-login.component';

@Component({
  selector: 'app-menu-mobile',
  templateUrl: './menu-mobile.component.html',
  styleUrls: ['./menu-mobile.component.scss']
})
export class MenuMobileComponent implements OnInit {
  @Input() showMobileMenu: boolean;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  modalRef: BsModalRef;
  isProd = environment.production;
  env = environment;
  identite: string;
  page: string;
  logged: boolean;

  constructor(
    private modalService: BsModalService, 
    private authService: AuthorizeApiService,
    private connexionInfo: ConnectionInfoService,
    private router: Router) {
      this.authService.CheckToken().then(logged => {
        this.logged = logged;
        this.connexionInfo.GetOnChangeConnexion().subscribe(token => {
          this.logged = this.connexionInfo.IsAuth();
          console.log('is logged: ', this.logged);
        });
      });
  }

  ngOnInit() {

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
