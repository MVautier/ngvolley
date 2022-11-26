import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebItem } from '@app/core/models/web-item.model';
import { RouteService } from '@app/core/services/route.services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, OnDestroy {
  page: WebItem;
  subPage: Subscription;

  constructor(
    private routeService: RouteService,
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    console.log('===================== init page');
    this.subPage = this.routeService.obsPage.subscribe(page => {
      this.page = page;
      this.initData();
    });
  }

  ngOnDestroy(): void {
    console.log('===================== destroy page');
    if (this.subPage) {
      this.subPage.unsubscribe();
    }
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
