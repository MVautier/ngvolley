import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouteService } from '@app/core/services/route.services';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {

  
  constructor(private routeService: RouteService) { }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.routeService.start();
  }
  
}
