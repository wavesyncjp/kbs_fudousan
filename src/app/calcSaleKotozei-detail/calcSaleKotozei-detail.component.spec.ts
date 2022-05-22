import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalcSaleKotozeiDetailComponent } from './calcSaleKotozei-detail.component';

describe('CalcSaleKotozeiDetailComponent', () => {
  let component: CalcSaleKotozeiDetailComponent;
  let fixture: ComponentFixture<CalcSaleKotozeiDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CalcSaleKotozeiDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalcSaleKotozeiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
