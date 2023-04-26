import { Injectable } from "@angular/core";
import { Adherent } from "@app/core/models/adherent.model";
import { HttpDataService } from "@app/core/services/http-data.service";
import { environment } from "@env/environment";
import { BehaviorSubject, Observable, map } from "rxjs";
import { Category } from "../models/category.model";
import { HttpClient, HttpParams } from "@angular/common/http";
import { UtilService } from "./util.service";
import { PagedList } from "../models/paged-list.model";
import { AdherentFilter } from "../models/adherent-filter.model";

@Injectable()
export class AdherentService {
    public obsAdherents: BehaviorSubject<Adherent[]> = new BehaviorSubject<Adherent[]>([]);
    public obsCategories: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);

    constructor(
        private util: UtilService,
        private http: HttpDataService<any>) {

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

    findAdherents(
        filter: AdherentFilter, 
        sort: string = 'asc', 
        sortColumn: string = 'IdAdherent', 
        page: number = 0, 
        size: number = 10): Observable<PagedList<Adherent>> {
            const url = `${environment.apiUrl}Adherent/paged?sort=${sort}&sortColumn=${sortColumn}&page=${page}&size=${size}`;
            return this.http.postObs<AdherentFilter>(url, filter)
            .pipe(
                map(res =>  res)
            );
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
                this.http.post<Adherent>(environment.apiUrl + 'Adherent', adherent).then((result: Adherent) => {
                    resolve(result);
                }).catch(err => {
                    reject(err);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    exportExcel(filter: AdherentFilter): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const url = `${environment.apiUrl}Adherent/export`;
            this.http.post<AdherentFilter>(url, filter, { responseType: 'blob'}).then(blob => {
                resolve(blob);
            }).catch(err => {
                reject(err);
            });
        });
    }
}