import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { RouteService } from '@app/core/services/route.services';

@Component({
  selector: 'app-page-edit',
  templateUrl: './page-edit.component.html',
  styleUrls: ['./page-edit.component.scss']
})
export class PageEditComponent implements OnInit {
  tree: Tree;
  slug: string;
  title;
  page: WebItem;
  constructor(
    private routeService: RouteService,
    private router: Router,
    private route: ActivatedRoute
    ) { 
      this.routeService.subscribeConfig(tree => {
        if (tree) {
          console.log('editing page: tree ', tree);
          this.tree = tree;
          this.initPage(tree);
        }
      }, 'subTreePageEdit');
    }

  ngOnInit(): void {
    this.slug = this.route.snapshot.params['slug'];
    this.initPage(this.tree);
    console.log('editing slug: ', this.slug);
  }

  goBack() {
    this.router.navigate(['admin/pages']);
  }

  onKeyUp(event: any) {
    console.log('keyup on editable: ', event);
    const item = event.target;
    if (item) {
      event.stopImmediatePropagation();
      this.page.Title = item.innerText;
      
    }
    
  }

  initPage(tree: Tree) {
    if (this.tree && this.slug) {
      this.page = this.tree.pages.find(p => p.Slug === this.slug);
      console.log('editing page: ', this.page);
      if (this.page) {
        this.title = this.page.Title;
      }
    }
    
  }

}
