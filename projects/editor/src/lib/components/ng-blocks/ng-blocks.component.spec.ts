import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgBlocksComponent } from './ng-blocks.component';

describe('NgBlocksComponent', () => {
  let component: NgBlocksComponent;
  let fixture: ComponentFixture<NgBlocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgBlocksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
