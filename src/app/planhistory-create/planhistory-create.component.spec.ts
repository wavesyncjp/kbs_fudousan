import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanHistoryCreateComponent } from './planhistory-create.component';

describe('PlanHistoryCreateComponent', () => {
  let component: PlanHistoryCreateComponent;
  let fixture: ComponentFixture<PlanHistoryCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanHistoryCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanHistoryCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
