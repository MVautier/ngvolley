import { isPlatformServer } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({providedIn: 'root'})
export class LoaderService {
    private isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor() {
      console.log('========================== LoaderService constructor')
    }

    public loaderStatus(): BehaviorSubject<boolean> {
        return this.isLoading;
      }
  
    setLoading(loading: boolean) {
        this.isLoading.next(loading);
    }
}