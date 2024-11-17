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
  categoryData: any[] = [];
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
    this.initStats()
  }

  initStats() {
    this.adherentService.getStats().then(stats => {
      if (stats) {
        this.geoData = stats.filter(s => s.type === 'geo').map(s => {
          return {
            name: s.label,
            value: s.value
          };
        });
        this.categoryData = stats.filter(s => s.type === 'category').map(s => {
          return {
            name: s.label,
            value: s.value
          };
        });
      }
    });
  }

  formatLabel() {

  }

  private getYvalue(count: number, total: number): number {
    return count / total * 100;
  }
}
