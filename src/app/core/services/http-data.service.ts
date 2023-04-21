import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable()
export class HttpDataService<T> {
    resultat: Observable<Response>;
    constructor(private http: HttpClient) { }

    /* get(action: string): Observable<Array<T>> {
         return this.http.get<T>( action)
             .catch(this.handleError);
     }*/

    get<D>(action: string): Promise<D> {
        return firstValueFrom(this.http.get<D>(action, { withCredentials: true }));
    }

    getWithOptions<D>(action: string, options?: {}): Promise<D> {
        return firstValueFrom(this.http.get<D>(action, options));
    }

    getPublic<D>(action: string): Promise<D> {
        return firstValueFrom(this.http.get<D>(action, { withCredentials: false }));
    }

    post<D>(action: string, item: D, options?: {}): Promise<T> {
        return firstValueFrom(this.http.post<T>(action, item, options));
    }

    put<D>(action: string, item: D, options?: {}): Promise<T> {
        return firstValueFrom(this.http.put<T>( action, item, options));
    }
    
    patch<D>(action: string, item: D, options?: {}): Promise<T> {
        return firstValueFrom(this.http.patch<T>( action, item, options));
    }
    
    delete<D>(action: string): Promise<T> {
        return firstValueFrom(this.http.delete<T>(action));
    }

    deleteWithReturnValue<D>(action: string): Promise<D> {
      console.log('deleting cookies');
      return firstValueFrom(this.http.delete<D>(action));
  }
}