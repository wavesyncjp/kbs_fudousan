import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BukkenplaninfoDetailComponent } from './bukkenplaninfo-detail.component';

describe('BukkenplaninfoDetailComponent', () => {
  let component: BukkenplaninfoDetailComponent;
  let fixture: ComponentFixture<BukkenplaninfoDetailComponent>;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BukkenplaninfoDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BukkenplaninfoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
