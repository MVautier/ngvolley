import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpDataService } from './http-data.service';

@Injectable()
export class ApiPingService {
    constructor(private http: HttpDataService<any>) {

    }

    getApiStatus(): Promise<boolean> {
        return this.http.get(environment.apiUrl + 'ping');
    }
}