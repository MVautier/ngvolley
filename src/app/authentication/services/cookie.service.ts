import { Inject, Injectable, Optional } from '@angular/core';
import { environment } from '@env/environment';
//import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
import { Request, Response } from 'express';


@Injectable()
export class CookieService {
  private document!: any;
  private documentIsAccessible!: any;
  cookies: any = {};
  constructor(
    //@Optional() @Inject(REQUEST) private req: Request<any>,
    //@Optional() @Inject(RESPONSE) private res: Response<any>
  ) {
    // if (this.req !== null) {
    //   this.cookies = this.req.cookies;
    // } else {
    //   this.document = document;
    //   this.documentIsAccessible = window.document !== undefined;
    // }
    this.document = document;
      this.documentIsAccessible = window.document !== undefined;
    // this.document = window.document;
    //   this.documentIsAccessible = window.document !== undefined;
  }

  Check(name: string): boolean {
    if (!this.documentIsAccessible) {
      return false;
    }

    const regExp = this.GetCookieRegExp(encodeURIComponent(name));
    return regExp.test(this.document.cookie);
  }

  Get(name: string): string {
    const cookies: { [key: string]: string | null } = this.getPairs();
    if (this.documentIsAccessible && this.Check(name)) {
      const regExp = this.GetCookieRegExp(encodeURIComponent(name));
      const result = regExp.exec(this.document.cookie);
      if (result) {
        return decodeURIComponent(result[1]);
      }
    }

    return null;
  }

  GetAll(): any {
    if (!this.documentIsAccessible) {
      return {};
    }

    const cookies: string[] = [];
    const document = this.document;
    if (document.cookie && document.cookie !== '') {
      const split = document.cookie.split(';');
      for (let i = 0; i < split.length; i += 1) {
        const currentCookie = split[i].split('=');
        currentCookie[0] = currentCookie[0].replace(/^ /, '');
        cookies[decodeURIComponent(currentCookie[0]) as any] = decodeURIComponent(currentCookie[1]);
      }
    }

    return cookies;
  }

  Set(name: string, value: string, expires?: string | Date | number, path?: string, domain?: string, secure?: boolean): void {
    if (!this.documentIsAccessible) {
      return;
    }

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)};`;

    if (expires) {
      if (typeof expires === 'number') {
        const dateExpires = new Date(expires);
        cookieString += `expires=${dateExpires.toUTCString()};`;
      } else {
        cookieString += `expires=${expires};`;
      }
    }
    if (path) {
      cookieString += `path=${path};`;
    }
    if (domain) {
      cookieString += `domain=${domain};`;
    }
    if (secure) {
      cookieString += 'secure;httpsonly;';
    } else {
      cookieString += 'secure;httponly;';
    }

    this.document.cookie = cookieString;
  }

  Delete(name: string, domain: string, path: string): void {
    if (!this.documentIsAccessible) {
      return;
    }

    const stringToDeleteCookie = `${name}=;domain=${domain};path=${path};expires=Thu, 01 Jan 1970 00:00:01 GMT`;

    this.document.cookie = stringToDeleteCookie;
  }

  DeleteAll(path?: string, domain?: string): void {
    if (!this.documentIsAccessible) {
      return;
    }

    const cookies = this.GetAll();
    for (const cookieName in cookies) {
      if (cookies.hasOwnProperty(cookieName)) {
        this.Delete(cookieName, 'idaia.group', environment.cookiePath);
        this.Delete(cookieName, environment.cookieDomain, environment.cookiePath);
      }
    }
  }

  private GetCookieRegExp(name: string): RegExp {
    const escapedName = name.replace(/([\[\]\{\}\(\)\|\=\;\+\?\,\.\*\^\$])/ig, '\\$1');
    return new RegExp(`(?:^${escapedName}|;\\s*${escapedName})=(.*?)(?:;|$)`, 'g');
  }

  private getPairs(): { [key: string]: string | null } {
    // if (this.req === null) {
    //   const parsed = this.document.cookie.split('; ');
    //   const cookies: { [key: string]: string | null } = {};
    //   parsed.forEach((element: string) => {
    //     if (element) {
    //       const pair = element.split('=');
    //       cookies[pair[0]] = typeof pair[1] !== 'undefined' ? pair[1] : null;
    //     }
    //   });
    //   return cookies;
    // } else {
    //   return this.cookies;
    // }
    return this.cookies;
  }
}
