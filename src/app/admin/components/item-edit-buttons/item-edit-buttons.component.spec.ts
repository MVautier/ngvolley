import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemEditButtonsComponent } from './item-edit-buttons.component';

describe('ItemEditButtonsComponent', () => {
  let component: ItemEditButtonsComponent;
  let fixture: ComponentFixture<ItemEditButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemEditButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemEditButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
