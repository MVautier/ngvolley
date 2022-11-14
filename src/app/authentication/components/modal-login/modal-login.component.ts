import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthorizeApiService } from '@app/authentication/services/authorize-api.service';
import { RegexShared } from '@app/core/services/regex-shared';

@Component({
  selector: 'app-modal-login',
  templateUrl: './modal-login.component.html',
  styleUrls: ['./modal-login.component.scss']
})
export class ModalLoginComponent implements OnInit {
  
  @Output() onSuccessLogin: EventEmitter<void> = new EventEmitter<void>();
  @Output() cancelEvent: EventEmitter<void> = new EventEmitter<void>();
  email: string = 'dominici.martial@orange.fr';
  password: string = '';
  authError = false;
  displayPassword = false;
  constructor(private authService: AuthorizeApiService) { }

  ngOnInit(): void {
  }

  onClickOutsideForm($event: any) {

  }

  public onClickOnConnection(): void {
    this.authError = !this.checkEmail();
    this.authService.Login({
      Email: this.email,
      Password: this.password
    }).then((response) => {
      this.onSuccessLogin.emit();
    }).catch((error) => {
      console.log('error login', error);
      this.authError = true;
    });
  }

  public onClickOnPasswordForgotten() {

  }

  public checkEmail(): boolean {
    if (!this.email || this.email.length < 3) {
      return false;
    }
    return new RegexShared().regexEmail.test(this.email);
  }
}
