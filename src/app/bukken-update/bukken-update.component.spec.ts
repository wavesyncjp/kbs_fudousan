import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BukkenUpdateComponent } from './bukken-update.component';

describe('BukkenUpdateComponent', () => {
  let component: BukkenUpdateComponent;
  let fixture: ComponentFixture<BukkenUpdateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BukkenUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BukkenUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
