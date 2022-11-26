import { Injectable } from '@angular/core';
import { WebItem } from '@app/core/models/web-item.model';

@Injectable()
export class UtilService {

    constructor() {

    }

    getNextId(items: WebItem[]): number {
        const max = Math.max.apply(Math, items.map(function(o) { return o.id; }));
        return max + 1;
    }
}