import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgEditorComponent } from './ng-editor.component';

describe('NgEditorComponent', () => {
  let component: NgEditorComponent;
  let fixture: ComponentFixture<NgEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
