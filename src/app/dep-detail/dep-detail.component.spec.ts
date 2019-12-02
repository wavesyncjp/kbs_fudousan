import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepDetailComponent } from './dep-detail.component';

describe('DepDetailComponent', () => {
  let component: DepDetailComponent;
  let fixture: ComponentFixture<DepDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
