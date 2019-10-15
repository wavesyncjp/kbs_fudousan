import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BukkenDetailComponent } from './bukken-detail.component';

describe('BukkenDetailComponent', () => {
  let component: BukkenDetailComponent;
  let fixture: ComponentFixture<BukkenDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BukkenDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BukkenDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
