import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MailingListService {
  private listSubject = new BehaviorSubject<string[]>([]);
  list$ = this.listSubject.asObservable();

  add(email: string): boolean {
    const value = email?.trim();
    if (!value) {
      return false;
    }
    const exists = this.listSubject.value.some(e => e.toLowerCase() === value.toLowerCase());
    if (exists) {
      return false;
    }
    this.listSubject.next([...this.listSubject.value, value]);
    return true;
  }

  remove(email: string): void {
    this.listSubject.next(this.listSubject.value.filter(e => e !== email));
  }

  clear(): void {
    this.listSubject.next([]);
  }

  get value(): string[] {
    return this.listSubject.value;
  }
}
