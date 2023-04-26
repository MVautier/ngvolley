import { Injectable } from "@angular/core";
import { Adherent } from "@app/core/models/adherent.model";
import { HttpDataService } from "@app/core/services/http-data.service";
import { environment } from "@env/environment";
import { BehaviorSubject, Observable, map } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { UtilService } from "./util.service";
import { UserRole } from "@app/core/models/user-role.model";
import { Role } from "@app/core/models/role.model";


@Injectable()
export class UserService {
    public obsRoles: BehaviorSubject<Role[]> = new BehaviorSubject<Role[]>([]);

    constructor(private util: UtilService, private http: HttpDataService<any>) {
        this.getRoles();
    }

    getListe(): Promise<UserRole[]> {
        return new Promise((resolve, reject) => {
            this.http.get(environment.apiUrl + 'User').then((datas: UserRole[]) => {
                resolve(datas);
            }).catch(err => {
                reject(err);
            });
        });
    }

    getRoles(): Promise<Role[]> {
        return new Promise((resolve, reject) => {
            if (this.obsRoles.value.length) {
                resolve(this.obsRoles.value);
            } else {
                this.http.get(environment.apiUrl + 'User/role').then((datas: Role[]) => {
                    this.obsRoles.next(datas);
                    resolve(this.obsRoles.value);
                }).catch(err => {
                    reject(err);
                });
            }
        });
    }
}