import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharerDialogComponent } from './sharer-dialog.component';

describe('SharerDialogComponent', () => {
  let component: SharerDialogComponent;
  let fixture: ComponentFixture<SharerDialogComponent>;

  beforeEach(async(() => {
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
