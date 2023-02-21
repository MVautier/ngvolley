import { ErrorHandler, Injectable } from "@angular/core";
import { SsrService } from "@app/ui/layout/services/ssr.service";
import { BehaviorSubject } from 'rxjs';
import { CustomError } from "../models/custom-error.model";

@Injectable({providedIn: 'root'})
export class ErrorHandlerService extends ErrorHandler {
    public error: BehaviorSubject<CustomError> = new BehaviorSubject<CustomError>(null);

    constructor(private ssrService: SsrService) {
        console.log('=============== ErrorHandlerService constructor');
        super();
    }

    handleError(error: any): void {
        if(!this.ssrService.isServer()) {
            //this.zone.run(() => this.handleBrowser(error));
            this.handleBrowser(error);
        } else {
            //this.zone.run(() => this.handleServer(error));
            this.handleServer(error);
        }
    }

    handleBrowser(error: any): void {
        // Handle the client/browser side exceptions
        console.log('error thrown in browser', error);
        this.error.next({
          status: 500,
          message: error,
          url: ''
        });
      }
      
    handleServer(error: any): void {
        // Handle the server-side exceptions
        console.log('error thrown in server', error);
        this.error.next({
          status: 500,
          message: error,
          url: ''
        });
    }
  
    getError(): CustomError {
        return this.error.value;
    }

    setError(error: CustomError) {
        this.error.next(error);
    }
}