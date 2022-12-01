import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit {
  @Input() content: string;
  constructor() { }

  ngOnInit(): void {
  }

}
