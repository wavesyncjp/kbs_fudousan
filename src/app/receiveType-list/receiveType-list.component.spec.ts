import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReceiveTypeListComponent } from './receiveType-list.component';

describe('ReceiveTypeListComponent', () => {
  let component: ReceiveTypeListComponent;
  let fixture: ComponentFixture<ReceiveTypeListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveTypeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
