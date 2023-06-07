import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { AdherentFilter } from '@app/core/models/adherent-filter.model';
import { Adherent } from '@app/core/models/adherent.model';
import { WebItem } from '@app/core/models/web-item.model';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class AdherentAdminService {
    obsFilter: BehaviorSubject<AdherentFilter> = new BehaviorSubject<AdherentFilter>(new AdherentFilter('id'));
    obsAdherent: BehaviorSubject<Adherent> = new BehaviorSubject<Adherent>(null);

    constructor() {

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