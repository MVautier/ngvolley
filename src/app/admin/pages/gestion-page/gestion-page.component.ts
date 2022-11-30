import { Component, OnInit } from '@angular/core';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { RouteService } from '@app/core/services/route.services';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { UtilService } from '@app/admin/services/util.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalComponent } from '@app/ui/layout/components/modal/modal.component';
import { first } from 'rxjs';

@Component({
  selector: 'app-gestion-page',
  templateUrl: './gestion-page.component.html',
  styleUrls: ['./gestion-page.component.scss']
})
export class GestionPageComponent implements OnInit {
  tree: Tree;
  inTrash: WebItem[] = [];
  modalRef: BsModalRef;

  constructor(
    private router: Router,
    private routeService: RouteService,
    private modalService: BsModalService,
    private util: UtilService
    ) { 
    this.routeService.subscribeConfig(tree => {
      if (tree) {
        this.initPages(tree);
      }
    }, 'subTreePages');
  }

  ngOnInit(): void {
  }

  initPages(tree: Tree) {
    if (tree?.pages?.length) {
      this.tree = tree;
    }
    console.log('tree in pages manager: ', this.tree);
  }

  duplicate(page: WebItem) {
    console.log('duplicate: ', page);
    this.routeService.addPage(page);
  }

  remove(page: WebItem) {
    console.log('remove: ', page);
    const item = this.inTrash.find(p => p.id === page.id);
    if (!item) {
      this.inTrash.push(page);
    }
  }

  empty() {
    this.showModalDelete();
  }

  showModalDelete() {
    this.modalRef = this.modalService.show(
      ModalComponent,
      Object.assign({}, { class: 'modal-preheader-warning-wrapper' })
    );
    const s = this.inTrash.length > 1 ? 's' : '';
    const a = this.inTrash.length > 1 ? 'ces' : 'cette';
    this.modalRef.content.title = 'Suppression de page' + s;
    this.modalRef.content.text = 'Etes-vous sûr(e) de vouloir supprimer ' + a + ' page' + s + ' ?';
    this.modalRef.content.validate.pipe(first()).subscribe(() => {
      this.routeService.removePages(this.inTrash);
      this.inTrash = [];
      this.modalRef.hide();
    });
    this.modalRef.content.cancel.pipe(first()).subscribe(() => {
      this.modalRef.hide();
    });
  }

  add() {
    const item = WebItem.newItem('page');
    item.id = this.util.getNextId(this.tree.pages);
    this.tree.pages.push(item);
  }

  edit(page: WebItem) {
    this.router.navigate(['admin/pages/' + page.id + '/edit']);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tree.pages, event.previousIndex, event.currentIndex);
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
