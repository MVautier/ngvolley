import { isPlatformServer } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "@env/environment";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({providedIn: 'root'})
export class LayoutService {
    obsMenuOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(environment.sidenavOpened);
    constructor() {
      console.log('========================== LayoutService constructor')
    }
  
    setMenuOpened(opened: boolean) {
        this.obsMenuOpened.next(opened);
    }
}