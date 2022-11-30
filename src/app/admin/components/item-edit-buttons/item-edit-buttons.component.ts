import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-item-edit-buttons',
  templateUrl: './item-edit-buttons.component.html',
  styleUrls: ['./item-edit-buttons.component.scss']
})
export class ItemEditButtonsComponent implements OnInit {
  @Input() isExpert: boolean = false;
  @Output() modeChange: EventEmitter<boolean> = new EventEmitter<boolean>(null);

  constructor() { }

  ngOnInit(): void {
  }

  toggleMode() {
    this.isExpert = !this.isExpert;
    console.log('builder mode: ', this.isExpert ? 'expert' : 'blocks');
    this.modeChange.emit(this.isExpert);
  }

}
