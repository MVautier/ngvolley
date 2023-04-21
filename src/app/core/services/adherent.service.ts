import { Injectable } from "@angular/core";
import { Adherent } from "@app/core/models/adherent.model";
import { HttpDataService } from "@app/core/services/http-data.service";
import { environment } from "@env/environment";
import { BehaviorSubject } from "rxjs";
import { Category } from "../models/category.model";

@Injectable()
export class AdherentService {
    public obsAdherents: BehaviorSubject<Adherent[]> = new BehaviorSubject<Adherent[]>([]);
    public obsCategories: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);

    constructor(private http: HttpDataService<any>) {

    }
    getListe(): Promise<Adherent[]> {
        return new Promise((resolve, reject) => {
            try {
                if (this.obsAdherents.value && this.obsAdherents.value.length) {
                    resolve(this.obsAdherents.value);
                } else {
                    this.http.get(environment.apiUrl + 'Adherent').then((datas: Adherent[]) => {
                        const adherents: Adherent[] = [];
                        datas.forEach(data => {
                            adherents.push(Adherent.fromJson(data));
                        });
                        this.obsAdherents.next(adherents);
                        resolve(adherents);
                    }).catch(err => {
                        reject(err);
                    });
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    getCategories(): Promise<Category[]> {
        return new Promise((resolve, reject) => {
            try {
                if (this.obsCategories.value && this.obsCategories.value.length) {
                    resolve(this.obsCategories.value);
                } else {
                    this.http.get(environment.apiUrl + 'Adherent/category').then((categs: Category[]) => {
                        this.obsCategories.next(categs);
                        resolve(categs);
                    }).catch(err => {
                        reject(err);
                    });
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    addOrUpdate(adherent: Adherent): Promise<Adherent> {
        return new Promise((resolve, reject) => {
            try {
                this.http.post(environment.apiUrl + 'Adherent', adherent).then((result: Adherent) => {
                    resolve(result);
                }).catch(err => {
                    reject(err);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}