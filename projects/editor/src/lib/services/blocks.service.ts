import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {Inject, Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Block } from '../models/block.model';


@Injectable()
export class BlocksService {
    dragBlock: BehaviorSubject<Block> = new BehaviorSubject<Block>(null);
    blocks: BehaviorSubject<Block[]> = new BehaviorSubject<Block[]>([
        {
            initial: true,
            content: 'Déposez un élément ici',
            preview: null,
            width: 0,
            height: 0
          }
    ]);
    constructor() {
        console.log('=============== Block service constructor');
    }

    dropped(event: CdkDragDrop<Block[]>) {
        let blocks = this.blocks.value;
        if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex,
          );
          this.dragBlock.next(event.container.data[event.currentIndex]);
        }
        if (blocks.length > 1) {
          blocks = blocks.filter(b => !b.initial);
        }
        this.blocks.next(blocks);
      }
}