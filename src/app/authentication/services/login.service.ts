import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable()
export class LoginService {

    public showAuthenticationForm(step: number, wantToGoTo = ''): any/*Promise<boolean>*/ {
        // this.hideAuthenticationForm();
        // this.nextPageToNavigate = wantToGoTo;
        // this.ui.connectionForm.isVisible = true;
        // if (!this.ssrService.isServer()) {
        //   document.body.classList.add('no-scroll');
        // }
    
        // this.ui.connectionForm.step = step;
        // return new Promise((resolve, reject) => {
        //   this.resolve = resolve;
        //   this.reject = reject;
        // });
    }

    public hideAuthenticationForm() {
        // this.ui.connectionForm.isVisible = false;
        
        // if (this.resolve) {
        //   this.resolve(this.isLogged);
        // }
        this.redirectAfterClosing();
    }

    public redirectAfterClosing() {
        // if (this.isLogged && this.nextPageToNavigate) {
        //   if (this.nextPageToNavigate.includes('reminder')) {
        //     this.router.navigateByUrl(this.nextPageToNavigate);
        //   } else {
        //     this.router.navigate([this.nextPageToNavigate]);
        //   }
        // }
    }
}