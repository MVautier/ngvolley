import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { RouteService } from '@app/core/services/route.services';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, OnDestroy {
  page: WebItem;
  init = false;

  constructor(
    private routeService: RouteService,
    private route: ActivatedRoute
    ) { 
      console.log('constructor on page');
      this.routeService.subscribePage(page => {
        console.log('getting page from router service');
        this.page = page;
        this.initData();
      }, 'subPageInPageComponent');
    }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }

  initData() {
    const tree = this.routeService.getCurrentConfig();
    if (this.page) {
      document.title = this.page.Title;
      const slug = this.page.Slug;
      console.log('configured page for ', slug, ': ', this.page);
      const posts = tree.posts.filter(post => post.IdPages && post.IdPages.includes(this.page.IdItem));
      if (posts && posts.length) {
        console.log('configured posts for ', slug, ': ', posts);
      } else {
        console.log('no configured posts for ' + slug);
      }
    } else {
      const page = this.route.snapshot.paramMap.get('page');
      console.log('no configured page for ' + page);
    }
  }

}
