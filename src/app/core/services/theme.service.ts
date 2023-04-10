import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Subject } from "rxjs";

@Injectable({providedIn: 'root'})
export class ThemeService {
    public isDarkTheme: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    //isDarkTheme = this._darkTheme.asObservable();

    constructor() {
      console.log('========================== ThemeService constructor');
    }
  
    setTheme(isDarkTheme: boolean) {
      console.log('setDarkTheme');
      this.isDarkTheme.next(isDarkTheme);
    }

    getTheme(): boolean {
      return this.isDarkTheme.value;
    }

}