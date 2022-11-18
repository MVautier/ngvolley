import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { RouteService } from '@app/core/services/route.services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, OnDestroy {
  page: string;
  tree: Tree;
  current: WebItem;

  constructor(
    private routeService: RouteService,
    private router: Router,
    private route: ActivatedRoute
    ) { 
      this.routeService.subscribeConfig(tree => {
        this.tree = tree;
        this.initPage();
      }, 'subTreePage');
    }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

  initPage() {
    this.current = null;
    this.page = this.route.snapshot.paramMap.get('page');
    if (this.tree) {
      const p = this.tree.pages.find(page => page.Slug === this.page);
      if (p) {
        this.current = p;
        document.title = p.Title;
        console.log('configured page for ', this.page, ': ', p);
        const posts = this.tree.posts.filter(post => post.IdParent === p.IdItem);
        if (posts && posts.length) {
          console.log('configured posts for ', this.page, ': ', posts);
        } else {
          console.log('no configured posts for ' + this.page);
        }
      } else {
        console.log('no configured page for ' + this.page);
      }
    }
  }

}
