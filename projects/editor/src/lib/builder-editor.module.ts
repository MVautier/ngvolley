import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxColorsModule } from 'ngx-colors';

import { NgButtonComponent } from './components/ng-button/ng-button.component';
import { NgEditorComponent } from './components/ng-editor/ng-editor.component';
import { NgSelectComponent } from './components/ng-select/ng-select.component';
import { NgEditorToolbarComponent } from './components/ng-editor-toolbar/ng-editor-toolbar.component';
import { NgToolbarSetComponent } from './components/ng-toolbar-set/ng-toolbar-set.component';

import { BrowserService } from './services/browser.service';
import { DomService } from './services/dom.service';
import { EditorService } from './services/editor.service';
import { ImageService } from './services/image.service';
import { TableService } from './services/table.service';
import { UndoManagerService } from './services/undo-manager.service';
import { UtilService } from './services/util.service';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { BlocksService } from './services/blocks.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BlockContainerComponent } from './components/block-container/block-container.component';
import { BlockComponent } from './components/block/block.component';
import { BlocksListComponent } from './components/blocks-list/blocks-list.component';
import { BuilderBlocksComponent } from './components/builder-blocks/builder-blocks.component';


@NgModule({
  declarations: [
    NgButtonComponent,
    NgEditorComponent,
    NgSelectComponent,
    NgEditorToolbarComponent,
    NgToolbarSetComponent,
    SafeHtmlPipe,
    BlockContainerComponent,
    BlockComponent,
    BlocksListComponent,
    BuilderBlocksComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    NgxColorsModule
  ],
  exports: [
    NgButtonComponent,
    NgEditorComponent,
    NgSelectComponent,
    NgEditorToolbarComponent,
    NgToolbarSetComponent,
    BlockContainerComponent,
    BlocksListComponent,
    BlockComponent,
    BuilderBlocksComponent
  ],
  providers: [
    BrowserService,
    DomService,
    EditorService,
    ImageService,
    TableService,
    UndoManagerService,
    UtilService,
    SafeHtmlPipe,
    BlocksService
  ]
})
export class BuilderEditorModule { }
