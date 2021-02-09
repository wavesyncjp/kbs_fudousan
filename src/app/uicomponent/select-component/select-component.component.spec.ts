import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectComponentComponent } from './select-component.component';

describe('SelectComponentComponent', () => {
  let component: SelectComponentComponent;
  let fixture: ComponentFixture<SelectComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
