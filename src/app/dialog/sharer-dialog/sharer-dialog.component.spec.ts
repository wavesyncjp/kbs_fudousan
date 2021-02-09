import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SharerDialogComponent } from './sharer-dialog.component';

describe('SharerDialogComponent', () => {
  let component: SharerDialogComponent;
  let fixture: ComponentFixture<SharerDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SharerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
