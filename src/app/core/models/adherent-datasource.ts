import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { AdherentService } from "../services/adherent.service";
import { BehaviorSubject, Observable, catchError, finalize, of } from "rxjs";
import { Adherent } from "./adherent.model";
import { PagedList } from "./paged-list.model";
import { AdherentFilter } from "./adherent-filter.model";

export class AdherentDataSource extends DataSource<Adherent> {

    private adherentsSubject = new BehaviorSubject<Adherent[]>([]);
    public countSubject = new BehaviorSubject<number>(0);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading = this.loadingSubject.asObservable();

    constructor(private adherentService: AdherentService) {
        super();
    }
    connect(collectionViewer: CollectionViewer): Observable<Adherent[]> {
        return this.adherentsSubject.asObservable();
    }
    disconnect(collectionViewer: CollectionViewer) {
        this.adherentsSubject.complete();
        this.loadingSubject.complete();
        this.countSubject.complete();
    }

    loadData(
        filter: AdherentFilter = new AdherentFilter(),
        sort: string = 'asc',
        sortColumn: string = 'IdAdherent',
        page: number = 0,
        size: number = 10) {
        this.loadingSubject.next(true);
        this.adherentService.findAdherents(filter, sort, sortColumn, page, size)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(result => {
                this.adherentsSubject.next((result as PagedList<Adherent>).Datas);
                this.countSubject.next((result as PagedList<Adherent>).Count);
            });
    }
}