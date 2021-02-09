import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BukkenDetailComponent } from './bukken-detail.component';

describe('BukkenDetailComponent', () => {
  let component: BukkenDetailComponent;
  let fixture: ComponentFixture<BukkenDetailComponent>;

  beforeEach(waitForAsync(() => {
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
