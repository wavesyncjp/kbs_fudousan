import { Component, OnInit, Input, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'label-ex',
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
export class MatcellComponentComponent implements OnInit  {

  @Input()
  title: string="";

  @Input()
  count : number = 0;
  
 constructor() { }

  ngOnInit() {
  }
  
  getTitle(title:string,count:number){
    let val = title ;
    if( val.length > count ) {
      val = val.substring(0, count)+'…';
    }else{
      val = title ;
    }
    return val;
  }

  getValue(title:string,count:number){
    let val = title ;
    if( val.length > count ) {
      return val;
    }else{
      val = '';
    }
    return val;
  }
}
