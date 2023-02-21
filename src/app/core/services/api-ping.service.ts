import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { firstValueFrom } from 'rxjs';
import { HttpDataService } from './http-data.service';

@Injectable()
export class ApiPingService {
    constructor(private http: HttpDataService<any>) {

    }

    getApiStatus(): Promise<boolean> {
        return this.http.get(environment.apiUrl + 'ping');
    }

    getIPAddress(): Promise<string>  {  
        return new Promise((resolve, reject) => {
            // this.http.getPublic("https://geolocation-db.com/json/").then((res: any) => {
            //     resolve(res.IPv4);
            // })
            resolve('127.0.0.1');
        });  
    }
}