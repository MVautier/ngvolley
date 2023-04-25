import { Component, OnInit } from '@angular/core';
import { AuthorizeApiService } from '@app/authentication/services/authorize-api.service';
import { RegexShared } from '@app/core/services/regex-shared';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';
import { ModalService } from '@app/ui/layout/services/modal.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  config: ModalConfig;
  validate: (result: ModalResult) => {};
  cancel: (result: ModalResult) => {};

  email: string = '';
  password: string = '';
  authError = false;
  displayPassword = false;

  constructor(private authService: AuthorizeApiService, private modalService: ModalService) { }

  ngOnInit(): void {
  }

  public onClickOnPasswordForgotten() {

  }

  onValidate() {
    this.authError = !this.checkEmail();
    this.authService.Login({
      Email: this.email,
      Password: this.password
    }).then((response) => {
      this.validate({
        action: 'login',
        data: response
      });
    }).catch((error) => {
      console.log('error login', error);
      this.authError = true;
    });

  }

  onCancel() {
    this.cancel({
      action: 'cancel',
      data: null
    });
  }

  public checkEmail(): boolean {
    if (!this.email || this.email.length < 3) {
      return false;
    }
    return new RegexShared().regexEmail.test(this.email);
  }
}
