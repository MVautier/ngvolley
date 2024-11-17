import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Adherent } from '@app/core/models/adherent.model';
import { OrderFull } from '@app/core/models/order-full.model';
import { OrderSearch } from '@app/core/models/order-search.model';
import { AdherentService } from '@app/core/services/adherent.service';
import { FileService } from '@app/core/services/file.service';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';
import { UtilService } from '@app/core/services/util.service';
import { environment } from '@env/environment';

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
  Saison: string;
  saison?: number;
  firstSeason: number = environment.firstSeason;
  seasons: number[] = [];

  orders: OrderFull[] = [];
  orders_manual: OrderFull[] = [];

  constructor(
    private adherentService: AdherentService,
    private pdf: PdfMakerService,
    private datePipe: DatePipe,
    private file: FileService,
    private util: UtilService) { }

  ngOnInit(): void {
    this.saison = this.adherentService.obsSeason.value;
    this.initSeasons();
    const d = new Date();
    this.start = this.util.UtcDate(new Date(d.getFullYear(), d.getMonth(), 1));
    this.end = this.util.UtcDate(d);

    this.getData('date');
  }

  initSeasons() {
    this.seasons = [this.saison];
    let season = this.saison;
    while (season > this.firstSeason) {
      season--;
      this.seasons.push(season);
    }
  }

  getData(mode: string) {
    const start = mode === 'date' ? this.util.UtcDate(this.start) : null;
    const end = mode === 'date' ? this.util.UtcDate(this.end) : null;
    const season = mode === 'season' ? this.saison : null;
    const search: OrderSearch = {
      start: start,
      end: end,
      season: season
    };
    this.adherentService.getOrders(search).then(orders => {
      this.all_data = orders.filter(o => o.PaymentMode === 'Helloasso');
      this.data = orders.filter(o => o.PaymentMode === 'Helloasso');
      this.all_data_manual = orders.filter(o => o.PaymentMode === 'Manuel');
      this.data_manual = orders.filter(o => o.PaymentMode === 'Manuel');
      this.setTotaux();
    });
  }

  onSaisonChange(season: any) {
    console.log('saison: ', Number(season.value));
    this.saison = Number(season.value);
    this.getData('season');
  }

  onSearch() {
    if (this.search) {
      const regex: RegExp = new RegExp(this.search, 'gmi');
      this.data = this.all_data.filter(a => a.LastName.match(regex));
      this.data_manual = this.all_data_manual.filter(a => a.LastName.match(regex));
    } else {
      this.data = this.all_data.map(o => o);
      this.data_manual = this.all_data_manual.map(o => o);
    }
    this.setTotaux();
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
    if (type === 'excel') {
      this.adherentService.exportOrders(this.start, this.end).then(blob => {
        this.file.download(blob, 'exportPaiements.xlsx');
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
    this.getData('date');
  }

  setTotaux() {
    this.totalC3l = 0;
    this.totalClub = 0;
    this.total = 0;
    if (this.data && this.data.length) {
      this.totalC3l = this.data.map(a => a.CotisationC3L).reduce((a, b) => { return a + b });
      this.total = this.data.map(a => a.Total).reduce((a, b) => { return a + b });
      this.totalClub = this.total - this.totalC3l;
    }
  }

}
