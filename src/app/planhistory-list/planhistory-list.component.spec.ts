import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanHistoryListComponent } from './planhistory-list.component';

describe('PlanHistoryListComponent', () => {
  let component: PlanHistoryListComponent;
  let fixture: ComponentFixture<PlanHistoryListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanHistoryListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanHistoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
