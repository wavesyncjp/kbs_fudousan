import { Component, OnInit, Input, forwardRef, EventEmitter, Output } from '@angular/core';
import { Code } from 'src/app/models/bukken';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-select-component',
  templateUrl: './select-component.component.html',
  styleUrls: ['./select-component.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SelectComponentComponent),
    },
  ],
})
export class SelectComponentComponent implements OnInit, ControlValueAccessor  {

  @Input()
  codes: Code[];

  @Input()
  exclass: false;

  @Output() changed: EventEmitter<any> = new EventEmitter();

  @Input()
  isError: false;

  @Input()
  isDisabled: false;

  /*@Input()
  noBlank: true;*/

  // tslint:disable-next-line:variable-name
  _value: string;
  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (_: any) => void = () => {};

  constructor() { }

  ngOnInit() {
  }
  get value(): string {
    return this._value;
  }
  @Input('value')
  set value(text: string) {
    if (this._value !== text) {
      this._value = text;
      this.onChangeCallback(text);
    }
  }
  writeValue(text: string): void {
    if (text !== this.value) {
      this.value = text;
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {}

  change(event, oldValue: string) {
    // tslint:disable-next-line:object-literal-shorthand
    this.changed.emit(event);
  }

  getClass() {
    const css = [];
    if (!this.exclass) {
      css.push('width140');
    } else {
      css.push('width300');
    }
    if (this.isError) {
      css.push('error');
    }
    return css.join(' ');
  }
}
