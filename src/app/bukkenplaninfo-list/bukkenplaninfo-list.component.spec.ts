import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BukkenplaninfoListComponent } from './bukkenplaninfo-list.component';

describe('BukkenplaninfoListComponent', () => {
  let component: BukkenplaninfoListComponent;
  let fixture: ComponentFixture<BukkenplaninfoListComponent>;
  
  beforeEach(waitForAsync(() => {
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
