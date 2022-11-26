import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';


@Component({
  selector: 'ng-button',
  templateUrl: './ng-button.component.html',
  styleUrls: ['./ng-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NgButtonComponent {

  @Input() iconClass = '';
  @Input() title = '';
  @Input() text = '';
  @Output() buttonClick = new EventEmitter();

  constructor() { }

}