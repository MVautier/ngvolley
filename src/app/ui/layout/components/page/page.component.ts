import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { makeStateKey } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomError } from '@app/core/models/custom-error.model';
import { WebItem } from '@app/core/models/web-item.model';
import { RouteService } from '@app/core/services/route.services';
import { TransferStateService } from '@app/core/services/transfert-state.service';
//import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { Response } from 'express';
import { Subscription } from 'rxjs';
import { SsrService } from '../../services/ssr.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, OnDestroy {
  page: WebItem;
  subPage: Subscription;
  //error: CustomError;

  constructor(
    private router: Router,
    //@Optional() @Inject(RESPONSE) private response: Response,
    private routeService: RouteService,
    private ssrService: SsrService,
    private transferState: TransferStateService,
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    //console.log('===================== init page');
    this.subPage = this.routeService.obsPage.subscribe(page => {
      this.page = page;
      this.initData();
    });
  }

  ngOnDestroy(): void {
    //console.log('===================== destroy page');
    if (this.subPage) {
      this.subPage.unsubscribe();
    }
  }

  initData() {
    //this.error = null;
    const tree = this.routeService.getCurrentConfig();
    if (this.page) {
      document.title = this.page.Title;
      const slug = this.page.Slug;
      //console.log('configured page for ', slug, ': ', this.page);
      const posts = tree.posts.filter(post => post.IdPages && post.IdPages.includes(this.page.IdItem));
      if (posts && posts.length) {
        //console.log('configured posts for ', slug, ': ', posts);
      } else {
        //console.log('no configured posts for ' + slug);
      }
    } else {
      const errorKey = makeStateKey<any>('CUSTOM_ERRORS');
      const page = this.route.snapshot.paramMap.get('page');
      console.log('no configured page for ' + page);
      const error = {
        url: page,
        status: 404,
        message: 'Cette page n\'existe pas ou a été déplacée'
      };
      this.transferState.set(errorKey, [...[error]]);
      // if (this.ssrService.isServer()) {
      //   if (this.response) {
      //     console.log('response in page: ', this.response);
      //     this.response.status(404);
      //   }
      // } else {
      //   this.router.navigateByUrl('/error', {skipLocationChange: true});
      // }
      this.router.navigateByUrl('/error', {skipLocationChange: true});
    }
  }
}
