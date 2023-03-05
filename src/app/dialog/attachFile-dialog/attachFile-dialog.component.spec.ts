import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AttachFileDialogComponent } from './attachFile-dialog.component';

describe('AttachFileDialogComponent', () => {
  let component: AttachFileDialogComponent;
  let fixture: ComponentFixture<AttachFileDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachFileDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
