import { ComponentFixture, TestBed } from '@angular/core/testing';

import {NgEditorToolbarComponent } from './ng-editor-toolbar.component';

describe('NgEditorToolbarComponent', () => {
  let component: NgEditorToolbarComponent;
  let fixture: ComponentFixture<NgEditorToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgEditorToolbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgEditorToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
