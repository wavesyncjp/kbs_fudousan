import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FbApprovalListComponent } from './fbApproval-list.component';

describe('FbApprovalListComponent', () => {
  let component: FbApprovalListComponent;
  let fixture: ComponentFixture<FbApprovalListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FbApprovalListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FbApprovalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
