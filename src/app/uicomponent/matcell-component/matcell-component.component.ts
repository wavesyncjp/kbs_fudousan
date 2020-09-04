import { Component, OnInit, Input, forwardRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Templandinfo } from 'src/app/models/templandinfo';

@Component({
  selector: 'app-matcell-component',
  templateUrl: './matcell-component.component.html',
  styleUrls: ['./matcell-component.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MatcellComponentComponent),
    },
  ],
})
export class MatcellComponentComponent implements OnInit, ControlValueAccessor  {
  infostaff = '';

  @Input()
  exclass: false;

  @Input()
  cusClass : string = '';

  @Output() changed: EventEmitter<any> = new EventEmitter();

  @Input()
  isError: false;

  @Input()
  isDisabled: false;

  @Input()
  noBlank: false;

  
  
  
  @Input('label-ex') private input :Templandinfo;
  
  _value: string;
  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (_: any) => void = () => {};

  constructor() { }

  ngOnInit() {
  }
  
  get value(): string {
    return this._value;
  }

    writeValue(obj:any):void{
      this.input.infoStaff = obj;
      this.onChangeCallback(obj);
    }

    registerOnChange(fn: any): void {
      this.onChangeCallback = fn;
    }
  
    registerOnTouched(fn: any): void {
      this.onTouchedCallback = fn;
    }
  
    setDisabledState(isDisabled: boolean): void {}

    change(event) {
      this.changed.emit(event);
    }

  getTitle(title:string,count:number){
    let val = title ;
    if( val.length > count ) {
      val = title.substring(0, count)+'…';
    }else{
      val = title ;
    }
    return val;
  }

  getValue(title:string,count:number){
    let val = title ;
    if( val.length >= count ) {
      return val;
    }else{
      val = '';
    }
    return val;
  }
}

