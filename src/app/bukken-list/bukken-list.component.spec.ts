import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BukkenListComponent } from './bukken-list.component';

describe('BukkenListComponent', () => {
  let component: BukkenListComponent;
  let fixture: ComponentFixture<BukkenListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BukkenListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BukkenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
