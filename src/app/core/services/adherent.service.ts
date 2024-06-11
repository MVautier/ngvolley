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
import { OrderFull } from "../models/order-full.model";

@Injectable()
export class AdherentService {
  public obsAdherents: BehaviorSubject<Adherent[]> = new BehaviorSubject<Adherent[]>([]);
  public obsCategories: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
  public obsTeams: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(['Féminine', 'Masculine 1', 'Masculine 2', 'Masculine 3', 'Masculine 4', 'Mixte 1', 'Mixte 2', 'Mixte 3']);
  public obsSeason: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(
    private util: UtilService,
    private http: HttpDataService<any>) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    this.obsSeason.next(m >= 4 ? y : y - 1);

  }

  getListe(force: boolean = false, admin: boolean = false): Promise<Adherent[]> {
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

  getOrders(start: Date, end: Date, isHelloasso: boolean): Promise<OrderFull[]> {
    return new Promise((resolve, reject) => {
      const s = this.util.date2StringForFilter(start);
      const e = this.util.date2StringForFilter(end);
      const season = this.obsSeason.value;
      this.getListe().then(liste => {
        let results: OrderFull[] = [];
        liste.forEach(a => {
          if (isHelloasso) {
            if (a.Saison === season && a.Orders.length) {
              a.Orders.forEach(o => {
                if (o.Date && this.util.date2StringForFilter(o.Date) >= s && this.util.date2StringForFilter(o.Date) <= e) {
                  results.push(new OrderFull(a, o));
                }
              });
            }

            // results = liste.filter(a => a.Saison === season 
            //     && a.Orders.length 
            //     && a.Orders.filter(o => o.Date !== undefined && o.Date !== null).length 
            //     // && this.util.date2StringForFilter(a.Order.Date) >= s 
            //     // && this.util.date2StringForFilter(a.Order.Date) <= e
            //     );
            // results = results.filter(a => a.Orders.map(o => this.util.date2StringForFilter(o.Date) <= s).length);
            // results = results.filter(a => a.Orders.map(o => this.util.date2StringForFilter(o.Date) >= e).length);
          } else {
            results = liste.filter(a => a.Saison === season
              && !a.Orders.filter(o => o.Id !== undefined && o.Id !== null).length
              && a.Payment && a.Payment !== 'Terminé' && a.Payment !== 'En attente' && a.Payment !== ''
              && a.InscriptionDate
              && this.util.date2StringForFilter(a.InscriptionDate) >= s
              && this.util.date2StringForFilter(a.InscriptionDate) <= e).map(a => new OrderFull(a, null));
          }
        });
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
        if (this.obsCategories.value?.length) {
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
        const adh = this.prepareAdherentForBdd(adherent);
        this.http.post<Adherent>(environment.apiUrl + 'Adherent', adh).then((result: Adherent) => {
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

  prepareAdherentForBdd(adherent: Adherent): Adherent {
    let d: Date;
    if (adherent.BirthdayDate) {
      d = new Date(adherent.BirthdayDate);
      adherent.BirthdayDate = this.util.UtcDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0));
    }
    if (adherent.HealthStatementDate) {
      d = new Date(adherent.HealthStatementDate);
      adherent.HealthStatementDate = this.util.UtcDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0));
    }

    if (adherent.InscriptionDate) {
      d = new Date(adherent.InscriptionDate);
      adherent.InscriptionDate = this.util.UtcDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0));
    }
    if (!adherent.Orders) {
      adherent.Orders = [];
    }
    adherent.FirstName = adherent.FirstName ? adherent.FirstName.trim() : adherent.FirstName;
    adherent.LastName = adherent.LastName ? adherent.LastName.trim() : adherent.LastName;
    return adherent;
  }
}