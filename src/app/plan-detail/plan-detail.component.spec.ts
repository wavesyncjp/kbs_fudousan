import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlanDetailComponent } from './plan-detail.component';

describe('PlanDetailComponent', () => {
  let component: PlanDetailComponent;
  let fixture: ComponentFixture<PlanDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
