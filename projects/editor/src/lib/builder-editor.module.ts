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


@NgModule({
  declarations: [
    NgButtonComponent,
    NgEditorComponent,
    NgSelectComponent,
    NgEditorToolbarComponent,
    NgToolbarSetComponent,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxColorsModule
  ],
  exports: [
    NgButtonComponent,
    NgEditorComponent,
    NgSelectComponent,
    NgEditorToolbarComponent,
    NgToolbarSetComponent
  ],
  providers: [
    BrowserService,
    DomService,
    EditorService,
    ImageService,
    TableService,
    UndoManagerService,
    UtilService,
    SafeHtmlPipe
  ]
})
export class BuilderEditorModule { }
