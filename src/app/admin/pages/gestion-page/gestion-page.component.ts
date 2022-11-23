import { Component, OnInit } from '@angular/core';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { RouteService } from '@app/core/services/route.services';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-page',
  templateUrl: './gestion-page.component.html',
  styleUrls: ['./gestion-page.component.scss']
})
export class GestionPageComponent implements OnInit {
  tree: Tree;

  constructor(
    private router: Router,
    private routeService: RouteService
    ) { 
    this.routeService.subscribeConfig(tree => {
      if (tree) {
        this.initPages(tree);
      }
    }, 'subTreePages');
  }

  ngOnInit(): void {
  }

  initPages(tree: Tree) {
    if (tree?.pages?.length) {
      this.tree = tree;
    }
    console.log('tree in pages manager: ', this.tree);
  }

  duplicate(page: WebItem) {
    console.log('duplicate: ', page);
    this.routeService.addPage(page);
  }

  remove(page: WebItem) {
    console.log('remove: ', page);
    this.routeService.removePage(page);
  }

  add() {

  }

  edit(page: WebItem) {
    this.router.navigate(['admin/pages/' + page.Slug + '/edit']);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tree.pages, event.previousIndex, event.currentIndex);
  }
}
