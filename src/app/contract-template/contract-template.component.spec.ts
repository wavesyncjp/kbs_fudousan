import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContractTemplateComponent } from './contract-template.component';

describe('ContractTemplateComponent', () => {
  let component: ContractTemplateComponent;
  let fixture: ComponentFixture<ContractTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
