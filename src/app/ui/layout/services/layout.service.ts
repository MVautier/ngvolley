import { isPlatformServer } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({providedIn: 'root'})
export class LayoutService {
    obsMenuOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    constructor() {
      console.log('========================== LayoutService constructor')
    }
  
    setMenuOpened(opened: boolean) {
        this.obsMenuOpened.next(opened);
    }
}