import {Injectable} from '@angular/core';
import { UndoItem } from '../../lib/models/undo-item.model';

@Injectable()
export class UndoManagerService {
    items: UndoItem[];
    position: number;
    enabled: boolean = false;

    constructor() {
        this.items = [];
        this.position = -1;
    }

    init(enabled: boolean) {
        this.enabled = enabled;
    }

    addItem(item: UndoItem) {
        if (this.enabled) {
            this.items.unshift(item);
            this.position--;
        }
    }

    undo() {
        if (this.enabled) {
            if (this.position < 0) {
                this.position = 0;
            }
            const item = this.items[this.position];
            if (item.undo) {
                this.position++;
                item.undo(item.element, item.originalContent);
            }
        }
    }

    redo() {
        if (this.enabled) {
            if (this.position >= this.items.length) {
                this.position = this.items.length - 1;
            }
            const item = this.items[this.position];
            if (item.redo) {
                this.position--;
                item.redo(item.element, item.newContent);
            }
        }
    }

    canUndo(): boolean {
        return this.enabled && this.items.length > 0 && this.position < this.items.length;
    }

    canRedo(): boolean {
        return this.enabled && this.position >= 0;
    }
}