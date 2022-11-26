import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgToolbarSetComponent } from './ng-toolbar-set.component';

describe('NgToolbarSetComponent', () => {
  let component: NgToolbarSetComponent;
  let fixture: ComponentFixture<NgToolbarSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgToolbarSetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgToolbarSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
