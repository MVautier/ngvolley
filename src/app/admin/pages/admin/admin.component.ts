import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LayoutService } from '@app/admin/services/layout.service';
import { Tree } from '@app/core/models/tree.model';
import { RouteService } from '@app/core/services/route.services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  subTree: Subscription;
  subRouter: Subscription;
  tree: Tree;

  constructor(
    private routeService: RouteService,
    private router: Router,
    private layoutService: LayoutService
    ) { }

  ngOnInit(): void {
    this.subTree = this.routeService.tree.subscribe(tree => {
      this.tree = tree;
      this.initUI();
    });
    // this.subRouter = this.router.events.subscribe(s => {
    //   if (s instanceof NavigationEnd) {
    //     //console.log('sub router in admin: ', s);
    //     //this.currentRoute = s.url;          
    //           console.log(s.url);
    //   }
    // });
    //console.log('sub router in admin: ', this.router.parseUrl(this.router.url));
  }

  ngOnDestroy(): void {
    if (this.subTree) {
      this.subTree.unsubscribe();
    }
    // if (this.subRouter) {
    //   this.subRouter.unsubscribe();
    // }
  }

  initUI() {
    console.log('init admin UI', this.tree);
  }

}
