import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BukkenplaninfoListComponent } from './bukkenplaninfo-list.component';

describe('BukkenplaninfoListComponent', () => {
  let component: BukkenplaninfoListComponent;
  let fixture: ComponentFixture<BukkenplaninfoListComponent>;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BukkenplaninfoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BukkenplaninfoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
