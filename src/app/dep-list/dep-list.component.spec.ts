import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DepListComponent } from './dep-list.component';

describe('DepListComponent', () => {
  let component: DepListComponent;
  let fixture: ComponentFixture<DepListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DepListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
