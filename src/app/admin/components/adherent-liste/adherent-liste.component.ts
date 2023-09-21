import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { AdherentAdminService } from '@app/admin/services/adherent-admin.service';
import { AdherentDataSource } from '@app/core/models/adherent-datasource';
import { AdherentFilter } from '@app/core/models/adherent-filter.model';
import { Adherent } from '@app/core/models/adherent.model';
import { AdherentService } from '@app/core/services/adherent.service';
import { FileService } from '@app/core/services/file.service';
import { UtilService } from '@app/core/services/util.service';
import { Subscription, filter, merge, tap } from 'rxjs';

@Component({
    selector: 'app-adherent-liste',
    templateUrl: './adherent-liste.component.html',
    styleUrls: ['./adherent-liste.component.scss']
})
export class AdherentListeComponent implements OnInit, AfterViewInit {
    dataSource: AdherentDataSource;
    adherent: Adherent;
    adherentsCount: number = 0;
    start?: Date;
    end?: Date;
    filter: AdherentFilter;
    columns = [
        { columnDef: 'IdAdherent', header: 'Id', cell: (element: Adherent) => `${element.IdAdherent}` },
        { columnDef: 'LastName', header: 'Nom', cell: (element: Adherent) => `${element.LastName}` },
        { columnDef: 'FirstName', header: 'Prénom', cell: (element: Adherent) => `${element.FirstName}` },
        { columnDef: 'Category', header: 'Catégorie', cell: (element: Adherent) => `${element.Category}` },
        { columnDef: 'Section', header: 'Section', cell: (element: Adherent) => `${element.Section}` },
        { columnDef: 'Payment', header: 'Paiement', cell: (element: Adherent) => `${element.Payment}` }
    ];
    displayedColumns: string[] = this.columns.map(c => c.columnDef);
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    sub_router: Subscription;
    selectedAdherent: Adherent;
    
    constructor(
        private route: ActivatedRoute, 
        @Inject(MAT_DATE_LOCALE) private _locale: string,
        private fileService: FileService,
        private _adapter: DateAdapter<any>,
        private router: Router,
        private util: UtilService,
        private adherentAdminService: AdherentAdminService,
        private adherentService: AdherentService) {
            this.sub_router = this.router.events
            .pipe(
                filter(event => event instanceof NavigationStart))
                .subscribe((event: NavigationStart) => {
            

            });
        }

    ngOnInit(): void {
        this._locale = 'fr';
        this._adapter.setLocale(this._locale);
        this.adherent = this.route.snapshot.data["adherent"];
        this.dataSource = new AdherentDataSource(this.adherentService);
        this.dataSource.countSubject.subscribe(count => {
            this.adherentsCount = count;
        });
        this.dataSource.loadData(new AdherentFilter());
    }

    ngAfterViewInit(): void {
        // reset the paginator after sorting
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

        // on sort or paginate events, load a new page
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => this.loadData(this.filter))
            )
            .subscribe();
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    }

    export() {
        this.adherentService.exportExcel(this.filter || new AdherentFilter()).then(blob => {
            this.fileService.download(blob, 'ExportAdherent.xlsx');
        }).catch(err => {
            console.error('error exporting adherents: ', err);
          });
    }

    exportDocs(type: string = 'adhesion') {
        const filter = this.filter || new AdherentFilter();
        this.adherentService.getDocuments(filter, type).then(blob => {
            this.fileService.download(blob, type + 's.zip');
        });
    }

    loadData(filter: AdherentFilter) {
        // this.filter = filter;
        // this.adherentAdminService.setFilter(filter);
        // this.paginator.pageIndex = 0;
        this.dataSource.loadData(
            this.filter,
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    filterChanged(filter: AdherentFilter){
        this.filter = filter;
        this.adherentAdminService.setFilter(filter);
        this.paginator.pageIndex = 0;
    }

    showCard(row: Adherent) {
        console.log('Row clicked: ', row);
        this.selectedAdherent = this.rowToAdherent(row);
    }

    reload() {
        this.loadData(this.filter);
    }

    rowToAdherent(row: Adherent): Adherent {
        const adherent = this.util.bindDates(row); 
        return adherent;
    }

    adherentChange(adherent: Adherent) {
        this.dataSource.updateRow(adherent);
    }

    hideCard() {
        this.selectedAdherent = null;
    }

    manualFill() {
        this.selectedAdherent = new Adherent(null);
    }
}
