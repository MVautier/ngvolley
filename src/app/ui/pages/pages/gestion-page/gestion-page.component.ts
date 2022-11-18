import { Component, OnInit } from '@angular/core';
import { Tree } from '@app/core/models/tree.model';
import { RouteService } from '@app/core/services/route.services';

@Component({
  selector: 'app-gestion-page',
  templateUrl: './gestion-page.component.html',
  styleUrls: ['./gestion-page.component.scss']
})
export class GestionPageComponent implements OnInit {
  tree: Tree;

  constructor(private routeService: RouteService) { 
    this.routeService.subscribeConfig(tree => {
      this.tree = tree;
      this.initPages();
    }, 'subTreePages');
  }

  ngOnInit(): void {
  }

  initPages() {

  }

  addPage() {
    
  }

}
