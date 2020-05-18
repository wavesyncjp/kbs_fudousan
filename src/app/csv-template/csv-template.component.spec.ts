import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvTemplateComponent } from './csv-template.component';

describe('CsvTemplateComponent', () => {
  let component: CsvTemplateComponent;
  let fixture: ComponentFixture<CsvTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsvTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsvTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
