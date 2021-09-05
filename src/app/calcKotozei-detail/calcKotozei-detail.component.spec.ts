import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalcKotozeiDetailComponent } from './calcKotozei-detail.component';

describe('CalcKotozeiDetailComponent', () => {
  let component: CalcKotozeiDetailComponent;
  let fixture: ComponentFixture<CalcKotozeiDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CalcKotozeiDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalcKotozeiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
