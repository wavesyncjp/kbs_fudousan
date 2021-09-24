import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReceiveTypeDetailComponent } from './receiveType-detail.component';

describe('ReceiveTypeDetailComponent', () => {
  let component: ReceiveTypeDetailComponent;
  let fixture: ComponentFixture<ReceiveTypeDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveTypeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveTypeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
