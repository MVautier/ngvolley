import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdherentFilter } from '@app/core/models/adherent-filter.model';
import { Adherent } from '@app/core/models/adherent.model';
import { Filter } from '@app/core/models/filter.model';
import { AdherentService } from '@app/core/services/adherent.service';

@Component({
    selector: 'app-adherent-page',
    templateUrl: './adherent-page.component.html',
    styleUrls: ['./adherent-page.component.scss']
})
export class AdherentPageComponent implements OnInit {
    adherents: Adherent[] = [];
    displayedColumns: string[] = ['IdAdherent', 'LastName', 'FirstName'];
    filter: AdherentFilter;
    reset: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private adherentService: AdherentService
        ) { }

    ngOnInit(): void { }

    onFilter(filter: AdherentFilter) {
        this.filter = filter;
        this.reset = false;
    }

    resetFilter() {
        this.filter = null;
        this.reset = true;
    }
}
