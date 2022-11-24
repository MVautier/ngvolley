import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '@app/authentication/models/user.model';
import { ConnectionInfoService } from '@app/authentication/services/connexion-info.service';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { RouteService } from '@app/core/services/route.services';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss']
})
export class ItemCardComponent implements OnInit {
  @Input() tree: Tree;
  @Input() id: number;
  @Output() edit: EventEmitter<WebItem> = new EventEmitter<WebItem>(null);
  @Output() duplicate: EventEmitter<WebItem> = new EventEmitter<WebItem>(null);
  @Output() remove: EventEmitter<WebItem> = new EventEmitter<WebItem>(null);
  item: WebItem;
  posts: WebItem[] = [];
  postsTitle: string;
  user: User;

  constructor(
    private routeService: RouteService,
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
      this.item = this.tree.pages.find(p => p.id === this.id);
      if (this.item) {
        this.postsTitle = 'Articles';
        this.posts = this.tree.posts.filter(post => post.IdPages && post.IdPages.includes(this.item.IdItem));
        if (this.posts && this.posts.length) {
          this.postsTitle = this.posts.length + ' article' + (this.posts.length > 1 ? 's' : '');
          console.log('configured posts for ', this.item, ': ', this.posts);
        } else {
          console.log('no configured posts for ' + this.item);
        }
      } else {
        console.log('no configured page for ' + this.item);
      }
    }
  }

  onEdit() {
    this.edit.emit(this.item);
  }

  onDuplicate() {
    const copy: WebItem = this.routeService.duplicate(this.item, this.user, 'page');
    this.duplicate.emit(copy);
  }

  onRemove() {
    this.remove.emit(this.item);
  }

  toggleStatus() {
    this.item.Public = !this.item.Public;
  }
}
