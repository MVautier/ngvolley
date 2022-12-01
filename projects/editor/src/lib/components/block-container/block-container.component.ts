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
  blocks: Block[] = [{
    initial: true,
    content: 'Déposez un élément ici'
  }];
  
  constructor(private blockService: BlocksService) { }

  ngOnInit(): void {
  }

  dropped(event: CdkDragDrop<Block[]>) {
    
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.blockService.dragBlock.next(event.container.data[event.currentIndex]);
    }
    if (this.blocks.length > 1) {
      this.blocks = this.blocks.filter(b => !b.initial);
    }
  }
}
