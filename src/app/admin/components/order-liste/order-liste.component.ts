import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Adherent } from '@app/core/models/adherent.model';
import { OrderFull } from '@app/core/models/order-full.model';
import { AdherentService } from '@app/core/services/adherent.service';
import { FileService } from '@app/core/services/file.service';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';
import { UtilService } from '@app/core/services/util.service';

@Component({
    selector: 'app-order-liste',
    templateUrl: './order-liste.component.html',
    styleUrls: ['./order-liste.component.scss']
})
export class OrderListeComponent implements OnInit {
    data: OrderFull[] = [];
    data_manual: OrderFull[] = [];
    all_data: OrderFull[] = [];
    all_data_manual: OrderFull[] = [];
    start: Date;
    end: Date;
    totalC3l: number = 0;
    totalClub: number = 0;
    total: number = 0;
    search: string;

    orders: OrderFull[] = [];
    orders_manual: OrderFull[] = [];

    constructor(
        private adherentService: AdherentService, 
        private pdf: PdfMakerService,
        private datePipe: DatePipe,
        private file: FileService,
        private util: UtilService) { }

    ngOnInit(): void {
        const d = new Date();
        this.start = this.util.UtcDate(new Date(d.getFullYear(), d.getMonth(), 1));
        this.end = this.util.UtcDate(d);
        this.getData();
    }

    getData() {
        this.adherentService.getOrders(this.start, this.end, true).then(results => {
            this.all_data = results;
            this.data = this.sortData(results, true);
            console.log('success orders: ', this.data);
            this.setTotaux();
        }).catch(err => {
            console.log('error getting orders: ', err);
        });
        this.adherentService.getOrders(this.start, this.end, false).then(results => {
            this.all_data_manual = results;
            this.data_manual = this.sortData(results, false);
            console.log('success manual: ', this.data_manual);
        }).catch(err => {
            console.log('error getting manual: ', err);
        });
    }

    onSearch() {
        if (this.search) {
            const regex: RegExp = new RegExp(this.search, 'gmi');
            this.data = this.all_data.filter(a => a.LastName.match(regex));
            this.data_manual = this.all_data_manual.filter(a => a.LastName.match(regex));
        } else {
            this.data = this.sortData(this.all_data, true);
            this.data_manual = this.sortData(this.all_data_manual, false);
        }
        this.setTotaux();
    }

    sortData(data: OrderFull[], isHelloAsso: boolean): OrderFull[] {
        if (isHelloAsso) {
            return data.sort((a: OrderFull, b: OrderFull) => (a.Date > b.Date) ? 1 : ((b.Date > a.Date) ? -1 : 0));
        } else {
            return data.sort((a: OrderFull, b: OrderFull) => (a.InscriptionDate > b.InscriptionDate) ? 1 : ((b.InscriptionDate > a.InscriptionDate) ? -1 : 0));
        }
        
    }

    export(type: string) {
        const title = 'Paiements du ' + this.datePipe.transform(this.start, 'dd/MM/yyyy') + ' au ' + this.datePipe.transform(this.end, 'dd/MM/yyyy');
        if (type === 'pdf') {
            this.pdf.buildOrderList(this.data, this.data_manual, title).then(blob => {
                this.file.download(blob, 'export.pdf');
            }).catch(err => {
                console.log('error exporting orders: ', err);
            });
        }
    }

    onDateChange(mode: string, event: any) {
        const d = this.util.UtcDate(new Date(event.target.value));
        console.log('date changed in ', mode, ' mode: ', d);
        if (mode === 'start') {
            this.start = d;
        }
        if (mode === 'end') {
            this.end = d;
        }
        this.getData();
    }

    setTotaux() {
        this.totalC3l = 0;
        this.totalClub = 0;
        this.total = 0;
        if (this.data && this.data.length) {
            this.totalC3l = this.data.map(a => a.CotisationC3L).reduce((a, b) => {return a + b});
            this.total = this.data.map(a => a.Total).reduce((a, b) => {return a + b});
            this.totalClub = this.total - this.totalC3l;
        }
    }

}
