import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Block } from '../../models/block.model';
import { BlocksService } from '../../services/blocks.service';

@Component({
  selector: 'lib-blocks-list',
  templateUrl: './blocks-list.component.html',
  styleUrls: ['./blocks-list.component.scss']
})
export class BlocksListComponent implements OnInit, OnDestroy {
  blocks: Block[] = [
    { content: '<h1>Mon titre</h1>' },
    { content: '<p>Mon texte</p>' }
  ];
  dragIndex = -1;
  subDrag: Subscription;

  constructor(private blockService: BlocksService) { }

  ngOnInit(): void {
    this.subDrag = this.blockService.dragBlock.subscribe(block => {
      if (block && this.dragIndex >= 0) {
        this.blocks.splice(this.dragIndex, 0, block);
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subDrag) {
      this.subDrag.unsubscribe();
    }
  }

  dragStart(block: Block) {
    this.dragIndex = this.blocks.findIndex(b => b.content === block.content);
  }
}
