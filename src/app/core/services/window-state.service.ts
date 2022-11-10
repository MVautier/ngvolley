import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, fromEvent } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, startWith, tap } from 'rxjs/operators';
import { WindowState } from '../models/window-state.model';

@Injectable()
export class WindowStateService {
  private obsWindowState: BehaviorSubject<WindowState> = new BehaviorSubject<WindowState>({
    fullscreen: false,
    mobile: false,
    displayMenuMobile: false
  });
  private dicoSubscriptions: Subscription[] = [];

  constructor() {
    console.log('CONSTRUCT WINDOW STATE');
    
    // Create observable from the window event
    const _resize$ = fromEvent(window, 'resize')
      .pipe(
        debounceTime(200),
        map(() => window.innerWidth), // Don't use mapTo!
        distinctUntilChanged(),
        startWith(window.innerWidth),
        tap(width => {
          document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
          this.obsWindowState.next({
            fullscreen: this.obsWindowState.value.fullscreen,
            mobile: width < 991,
            displayMenuMobile: (width < 768) ? true: false
          });
        }),
      );
    _resize$.subscribe();
  }

  Subscribe(next?: (value: WindowState) => void, keySubscription?: string) {
    if (keySubscription) {
      this.Unsubscribe(keySubscription);
      const subscriber = this.obsWindowState.subscribe(next);
      this.dicoSubscriptions[keySubscription] = subscriber;
    }
  }

  Unsubscribe(keySubscription: string): void {
    if (this.dicoSubscriptions[keySubscription]) {
      this.dicoSubscriptions[keySubscription].unsubscribe();
    }
  }

  SetWindowState(state: WindowState) {
    this.obsWindowState.next(state);
  }

  GetWindowState(): WindowState {
    return this.obsWindowState.value;
  }
}