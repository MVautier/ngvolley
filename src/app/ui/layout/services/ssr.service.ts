import { isPlatformServer } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({providedIn: 'root'})
export class SsrService {

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
      console.log('========================== SsrService constructor')
    }
  
    isServer(): boolean {
        return isPlatformServer(this.platformId);
    }
}