import { Component, OnInit } from '@angular/core';
import { AdherentService } from '@app/core/services/adherent.service';
import { Adherent } from '@app/core/models/adherent.model';
import { ThemeService } from '@app/core/services/theme.service';
import { environment } from '@env/environment';
import { LegendPosition } from '@swimlane/ngx-charts';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    adherents: Adherent[] = [];
    pieChartOptions: any;
    geoData: any[] = [];
    typeData: any[] = [];
    below = LegendPosition.Below;
    chartColor = { fill: '#2b2b2b' };
    constructor(
        private themeService: ThemeService,
        private adherentService: AdherentService
    ) {
        console.log('dashboard constructor');
        this.themeService.isDarkTheme.subscribe((isDark: boolean) => {
            this.chartColor = { fill: isDark ? '#eee' : '#2b2b2b' };
        });
    }

    ngOnInit(): void {
        console.log('dashboard init');
        
        this.adherentService.obsAdherents.subscribe(data => {
            this.adherents = data;
            if (data && data.length) {
                console.log('adherents: ', this.adherents);
                const total = this.adherents.length;
                this.geoData = [
                    { name: "Colomiers", value: this.adherents.filter(a => a.PostalCode === environment.postalcode).length },
                    { name: "Externe", value: this.adherents.filter(a => a.PostalCode !== environment.postalcode).length }
                ];
                this.typeData = [
                    { name: "Compétition", value: this.adherents.filter(a => a.Category === 'C').length },
                    { name: "Loisir", value: this.adherents.filter(a => a.Category === 'L').length },
                    { name: "Enfants", value: this.adherents.filter(a => a.Category === 'E').length },
                ];
            }
        });
        if (!this.adherentService.obsAdherents.value?.length) {
            this.adherentService.getListe();
        }
    }

    formatLabel() {

    }

    private getYvalue(count: number, total: number): number {
        return count / total * 100;
    }
}
