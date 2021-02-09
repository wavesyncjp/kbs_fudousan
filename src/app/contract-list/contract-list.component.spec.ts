import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContractListComponent } from './contract-list.component';

describe('ContractListComponent', () => {
  let component: ContractListComponent;
  let fixture: ComponentFixture<ContractListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
