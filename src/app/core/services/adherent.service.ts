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
import { Order } from "../models/order.model";

@Injectable()
export class AdherentService {
    public obsAdherents: BehaviorSubject<Adherent[]> = new BehaviorSubject<Adherent[]>([]);
    public obsCategories: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
    public obsTeams: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(['Féminine', 'Masculine 1', 'Masculine 2', 'Masculine 3', 'Masculine 4', 'Mixte 1', 'Mixte 2', 'Mixte 3']);

    constructor(
        private util: UtilService,
        private http: HttpDataService<any>) { }

    getListe(force: boolean = false): Promise<Adherent[]> {
        return new Promise((resolve, reject) => {
            try {
                if (!force && this.obsAdherents.value && this.obsAdherents.value.length) {
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

    getOrders(start: Date, end: Date, isHelloasso: boolean): Promise<Adherent[]> {
        return new Promise((resolve, reject) => {
            const s = this.util.date2StringForFilter(start);
            const e = this.util.date2StringForFilter(end);
            const now = new Date();
            const y = now.getFullYear();
            const m = now.getMonth() + 1;
            const season = m >= 6 ? y : y - 1;
            this.getListe().then(liste => {
                let results: Adherent[] = [];
                if (isHelloasso) {
                    results = liste.filter(a => a.Saison === season && a.Order && a.Order.Date && this.util.date2StringForFilter(a.Order.Date) >= s && this.util.date2StringForFilter(a.Order.Date) <= e);
                } else {
                    results = liste.filter(a => a.Saison === season && !a.Order.Id
                        && a.Payment && a.Payment !== 'Terminé' && a.Payment !== 'En attente' && a.Payment !== ''
                        && a.InscriptionDate 
                        && this.util.date2StringForFilter(a.InscriptionDate) >= s 
                        && this.util.date2StringForFilter(a.InscriptionDate) <= e);
                }
                resolve(results);
            }).catch(err => {
                reject(err);
            });
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
                map(res => res)
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
            this.http.post<AdherentFilter>(url, filter, { responseType: 'blob' }).then(blob => {
                resolve(blob);
            }).catch(err => {
                reject(err);
            });
        });
    }

    getDocuments(filter: AdherentFilter, type: string): Promise<any> {
        const url = `${environment.apiUrl}Adherent/docs?type=${type}`;
        return new Promise((resolve, reject) => {
            this.http.post<AdherentFilter>(url, filter, { responseType: 'blob', withCredentials: true }).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }

    getEmails(filter: AdherentFilter): Promise<any> {
        const url = `${environment.apiUrl}Adherent/export/email`;
        return new Promise((resolve, reject) => {
            this.http.post<AdherentFilter>(url, filter, { responseType: 'blob', withCredentials: true }).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }
}