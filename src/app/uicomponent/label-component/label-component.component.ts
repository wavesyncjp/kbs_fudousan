import { Component, OnInit, Input, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-label',
  templateUrl: './label-component.component.html',
  styleUrls: ['./label-component.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => LabelComponentComponent),
    },
  ],
})
export class LabelComponentComponent implements OnInit {

  @Input()
  value: string = "";

  @Input()
  length: number = 0;

  constructor() { }

  ngOnInit() {
  }

  getTitle(value: string, length: number){
    let val = value;
    if(val.length > length) {
      val = val.substring(0, length) + '…';
    }
    return val;
  }

  getValue(value: string, length: number){
    let val = value;
    if(val.length <= length) {
      val = '';
    }
    return val;
  }
}
