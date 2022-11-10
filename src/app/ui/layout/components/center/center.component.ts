import { Component, Input, OnInit } from '@angular/core';
import { WindowState } from '@app/core/models/window-state.model';

@Component({
  selector: 'app-center',
  templateUrl: './center.component.html',
  styleUrls: ['./center.component.scss']
})
export class CenterComponent implements OnInit {
  @Input() windowState: WindowState;
  constructor() { }

  ngOnInit(): void {
  }

}
