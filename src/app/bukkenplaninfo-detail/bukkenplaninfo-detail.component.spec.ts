import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BukkenplaninfoDetailComponent } from './bukkenplaninfo-detail.component';

describe('BukkenplaninfoDetailComponent', () => {
  let component: BukkenplaninfoDetailComponent;
  let fixture: ComponentFixture<BukkenplaninfoDetailComponent>;

  beforeEach(waitForAsync(() => {
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
