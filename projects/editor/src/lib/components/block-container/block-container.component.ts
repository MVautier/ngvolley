import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Block } from '../../models/block.model';
import { BlocksService } from '../../services/blocks.service';

@Component({
  selector: 'lib-block-container',
  templateUrl: './block-container.component.html',
  styleUrls: ['./block-container.component.scss']
})
export class BlockContainerComponent implements OnInit {
  blocks: Block[] = [];
  
  constructor(private blockService: BlocksService) { }

  ngOnInit(): void {
    this.blockService.blocks.subscribe(blocks => {
      this.blocks = blocks;
    })
  }

  dropped(event: CdkDragDrop<Block[]>) {
    this.blockService.dropped(event);
  }
}
