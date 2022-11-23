import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '@app/authentication/models/user.model';
import { ConnectionInfoService } from '@app/authentication/services/connexion-info.service';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { PagesService } from '../../services/pages.service';

@Component({
  selector: 'app-page-card',
  templateUrl: './page-card.component.html',
  styleUrls: ['./page-card.component.scss']
})
export class PageCardComponent implements OnInit {
  @Input() tree: Tree;
  @Input() idpage: number;
  @Output() edit: EventEmitter<WebItem> = new EventEmitter<WebItem>(null);
  @Output() duplicate: EventEmitter<WebItem> = new EventEmitter<WebItem>(null);
  @Output() remove: EventEmitter<WebItem> = new EventEmitter<WebItem>(null);
  page: WebItem;
  posts: WebItem[] = [];
  postsTitle: string;
  user: User;

  constructor(
    private pagesService: PagesService,
    private connexionInfo: ConnectionInfoService
    ) { }

  ngOnInit(): void {
    this.user = this.connexionInfo.UserInfo;
    if (this.user) {
      this.initPage();
    }
  }

  initPage() {
    if (this.tree?.pages?.length) {
      this.page = this.tree.pages.find(p => p.IdItem === this.idpage);
      if (this.page) {
        this.postsTitle = 'Articles';
        this.posts = this.tree.posts.filter(post => post.IdPages && post.IdPages.includes(this.page.IdItem));
        if (this.posts && this.posts.length) {
          this.postsTitle = this.posts.length + ' article' + (this.posts.length > 1 ? 's' : '');
          console.log('configured posts for ', this.page, ': ', this.posts);
        } else {
          console.log('no configured posts for ' + this.page);
        }
      } else {
        console.log('no configured page for ' + this.page);
      }
    }
  }

  onEdit() {
    this.edit.emit(this.page);
  }

  onDuplicate() {
    const copy: WebItem = this.pagesService.duplicate(this.page, this.user, 'page');
    this.duplicate.emit(copy);
  }

  onRemove() {
    this.remove.emit(this.page);
  }

  toggleStatus() {
    this.page.Public = !this.page.Public;
  }

  // setPublic() {
  //   this.page.Public = true;
  // }

  // setPrivate() {
  //   this.page.Public = false;
  // }
  
}
