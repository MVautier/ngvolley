import { Injectable } from '@angular/core';
import { NavigationEnd, Route, Router } from '@angular/router';
import { User } from '@app/authentication/models/user.model';
import { PageComponent } from '@app/ui/layout/components/page/page.component';
import { environment } from '@env/environment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Tree } from '../models/tree.model';
import { WebItem } from '../models/web-item.model';
import { ApiPingService } from './api-ping.service';
import { HttpDataService } from './http-data.service';

@Injectable()
export class AdminService {

    constructor(
        private http: HttpDataService<any>) {

    }

    getTree(): Promise<Tree> {
        return new Promise((resolve, reject) => {
            try {
                this.http.get(environment.apiUrl + 'WebItem/tree').then((tree: Tree) => {
                    resolve(tree);
                }).catch(err => {
                    reject(err);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    addOrUpdateItem(item: WebItem): Promise<WebItem> {
        return this.http.post(environment.apiUrl + 'WebItem/add', item);
    }
}