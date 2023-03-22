import { Component, Input, OnInit } from '@angular/core';
import { Block } from '../../models/block.model';

@Component({
  selector: 'lib-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit {
  @Input() block: Block;
  @Input() handle: boolean;
  showMove = false;

  constructor() { }

  ngOnInit(): void {
  }

  toggleMove() {
    this.showMove = !this.showMove;
  }
}
