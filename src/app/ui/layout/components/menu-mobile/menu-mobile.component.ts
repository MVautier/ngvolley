import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WindowState } from '@app/core/models/window-state.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-menu-mobile',
  templateUrl: './menu-mobile.component.html',
  styleUrls: ['./menu-mobile.component.scss']
})
export class MenuMobileComponent implements OnInit {
  @Input() showMobileMenu: boolean;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();


  isProd = environment.production;
  env = environment;
  identite: string;
  page: string;


  constructor() {

  }

  ngOnInit() {

  }

  onClose() {
    this.close.emit();
  }
}
