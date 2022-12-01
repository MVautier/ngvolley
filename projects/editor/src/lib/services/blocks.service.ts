import {Inject, Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Block } from '../models/block.model';


@Injectable()
export class BlocksService {
    dragBlock: BehaviorSubject<Block> = new BehaviorSubject<Block>(null);

    constructor() {
        console.log('=============== Block service constructor');
    }
}