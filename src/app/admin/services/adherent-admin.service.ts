import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { AdherentFilter } from '@app/core/models/adherent-filter.model';
import { Adherent } from '@app/core/models/adherent.model';
import { WebItem } from '@app/core/models/web-item.model';
import { HttpDataService } from '@app/core/services/http-data.service';
import { environment } from '@env/environment';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class AdherentAdminService {
  obsFilter: BehaviorSubject<AdherentFilter> = new BehaviorSubject<AdherentFilter>(new AdherentFilter(null, 'id'));
  obsAdherent: BehaviorSubject<Adherent> = new BehaviorSubject<Adherent>(null);

  constructor(private http: HttpDataService<any>) {

  }

  downloadFile(uid: string, filename: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.getWithOptions(`${environment.apiUrl}Document/download/` + filename + '?uid=' + uid, { responseType: 'blob', withCredentials: true }).then(result => {
        resolve(result);
      }).catch(err => {
        reject(err);
      });
    });
  }

  setFilter(filter: AdherentFilter) {
    this.obsFilter.next(filter);
  }

  getFilter(): AdherentFilter {
    return this.obsFilter.value;
  }

  setAdherent(adherent: Adherent) {
    this.obsAdherent.next(adherent);
  }

  getAdherent(): Adherent {
    return this.obsAdherent.value;
  }
}