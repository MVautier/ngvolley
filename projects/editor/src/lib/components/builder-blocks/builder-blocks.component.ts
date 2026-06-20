import { Component, OnInit } from '@angular/core';
import { Block } from '../../models/block.model';

@Component({
    selector: 'lib-builder-blocks',
    templateUrl: './builder-blocks.component.html',
    styleUrls: ['./builder-blocks.component.scss'],
    standalone: false
})
export class BuilderBlocksComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
