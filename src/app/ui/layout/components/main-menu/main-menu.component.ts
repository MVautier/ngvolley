import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
  @Input() showMobileMenu: boolean;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  constructor() { }

  ngOnInit(): void {
  }

  onClose(): void {
    this.close.emit();
  }

  onClickedOutside(e: Event): void {
    //this.idSection = null;
  }
}
