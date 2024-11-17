import { Injectable } from "@angular/core";
import { Adherent } from "@app/core/models/adherent.model";
import { HttpDataService } from "@app/core/services/http-data.service";
import { environment } from "@env/environment";
import { BehaviorSubject, Observable, firstValueFrom, map } from "rxjs";
import { Category } from "../models/category.model";
import { HttpClient, HttpParams } from "@angular/common/http";
import { UtilService } from "./util.service";
import { PagedList } from "../models/paged-list.model";
import { AdherentFilter } from "../models/adherent-filter.model";
import { Order } from "../models/order.model";
import { OrderFull } from "../models/order-full.model";
import { AdherentSearch } from "../models/adherent-search.model";
import { OrderSearch } from "../models/order-search.model";
import { AdherentStat } from "@app/admin/models/adherent-stat.model";

@Injectable()
export class AdherentService {
  public obsAdherents: BehaviorSubject<Adherent[]> = new BehaviorSubject<Adherent[]>([]);
  public obsCategories: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
  public obsTeams: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(['Féminine', 'Masculine 1', 'Masculine 2', 'Masculine 3', 'Masculine 4', 'Mixte 1', 'Mixte 2', 'Mixte 3']);
  public obsSeason: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(
    private util: UtilService,
    private httpClient: HttpClient,
    private http: HttpDataService<any>) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    this.obsSeason.next(m >= 4 ? y : y - 1);

  }

  getStats(): Promise<AdherentStat[]> {
    return firstValueFrom(this.httpClient.get<AdherentStat[]>(environment.apiUrl + 'Adherent/stats'));
  }

  getOrders(search: OrderSearch): Promise<OrderFull[]> {
    return firstValueFrom(this.httpClient.post<OrderFull[]>(environment.apiUrl + 'Adherent/orders', search));
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

  searchAdherent(nom: string, prenom: string, birthdayDate: Date = null): Promise<Adherent> {
    return new Promise((resolve, reject) => {
      const search: AdherentSearch = {
        nom: nom,
        prenom: prenom,
        birthdayDate: this.util.UtcDate(new Date(birthdayDate))
      };
      this.http.post<AdherentSearch>(environment.apiUrl + 'Adherent/search', search).then((result: Adherent) => {
        resolve(result);
      }).catch(err => {
        reject(err);
      });
    });
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

  exportOrders(start: Date, end: Date): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const url = `${environment.apiUrl}Adherent/export/order`;
      const filter: AdherentFilter = {
        DateRange: {
          Start: start,
          End: end
        },
        Saison: this.obsSeason.value
      }
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