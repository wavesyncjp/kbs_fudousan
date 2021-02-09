import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlanListComponent } from './plan-list.component';

describe('PlanListComponent', () => {
  let component: PlanListComponent;
  let fixture: ComponentFixture<PlanListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
