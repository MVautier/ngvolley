import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Block } from '../../models/block.model';
import { BlocksService } from '../../services/blocks.service';

@Component({
  selector: 'lib-blocks-list',
  templateUrl: './blocks-list.component.html',
  styleUrls: ['./blocks-list.component.scss']
})
export class BlocksListComponent implements OnInit, OnDestroy {
  ipsum: string = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras metus diam, lacinia at aliquam sed, 
  pulvinar et turpis. Morbi facilisis ex lorem, id imperdiet arcu dignissim sed.`;
  ipsum_short: string = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras metus diam, lacinia at aliquam sed.`;
  defaultSrc: string = 'assets/images/img-placeholder.png';
  blocks: Block[] = [];
  dragIndex = -1;
  subDrag: Subscription;

  constructor(private blockService: BlocksService) { }

  ngOnInit(): void {
    this.initBlocks();
    this.subDrag = this.blockService.dragBlock.subscribe(block => {
      if (block && this.dragIndex >= 0) {
        this.blocks.splice(this.dragIndex, 0, block);
      }
    })
  }

  initBlocks() {
    this.blocks = [
      // { content: `<div class="column w-30"><img src="${this.defaultSrc}"></div>
      //             <div class="column w-70"><h1>Mon titre</h1><p>${this.ipsum}</p></div>` },
      { content: `<div class="column w-40"><img src="${this.defaultSrc}"><h1>Mon titre</h1><p>${this.ipsum_short}</p></div>
                  <div class="column w-40"><img src="${this.defaultSrc}"><h1>Mon titre</h1><p>${this.ipsum_short}</p></div>` },
      // { content: '<div class="column w-100">Mon texte</div>' }
    ];
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
