import { Component, Input, OnInit } from '@angular/core';
import { WebItem } from '@app/core/models/web-item.model';

@Component({
  selector: 'app-page-card',
  templateUrl: './page-card.component.html',
  styleUrls: ['./page-card.component.scss']
})
export class PageCardComponent implements OnInit {
  @Input() page: WebItem;
  constructor() { }

  ngOnInit(): void {
  }

  edit() {
    
  }

  setPublic() {
    this.page.Public = true;
  }

  setPrivate() {
    this.page.Public = false;
  }

  remove() {

  }
}
