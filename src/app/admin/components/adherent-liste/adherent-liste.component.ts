import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { AdherentDataSource } from '@app/core/models/adherent-datasource';
import { AdherentFilter } from '@app/core/models/adherent-filter.model';
import { Adherent } from '@app/core/models/adherent.model';
import { AdherentService } from '@app/core/services/adherent.service';
import { FileService } from '@app/core/services/file.service';
import { merge, tap } from 'rxjs';

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
        { columnDef: 'Section', header: 'Section', cell: (element: Adherent) => `${element.Section}` }
    ];
    displayedColumns: string[] = this.columns.map(c => c.columnDef);
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    
    constructor(
        private route: ActivatedRoute, 
        @Inject(MAT_DATE_LOCALE) private _locale: string,
        private fileService: FileService,
        private _adapter: DateAdapter<any>,
        private adherentService: AdherentService) {}

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

    loadData(filter: AdherentFilter) {
        this.filter = filter;
        this.dataSource.loadData(
            this.filter,
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    onRowClicked(row) {
        console.log('Row clicked: ', row);
    }
}