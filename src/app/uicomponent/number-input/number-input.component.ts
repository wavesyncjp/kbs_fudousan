import { Component, OnInit , Input, Output, EventEmitter } from '@angular/core';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.css']
})
export class NumberInputComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
 // 数値または文字列としての入力値
  @Input() value: number | string;

  // カンマでフォーマットするかどうかのフラグ（デフォルトは true）
  @Input() formatWithCommas: boolean = true;

  // 小数点を許可するかどうかのフラグ（デフォルトは false）
  @Input() allowDecimal: boolean = false;

  // 小数点の精度（デフォルトは 2）
  @Input() decimalPrecision: number = 2;

  // 最大長（デフォルトは 15）
  @Input() maxLength: number = 15;

  // 値が変更されたときに発火するイベント
  @Output() valueChange = new EventEmitter<number | string>();

  onInputChange(value: any) {
      value = this.numberFormat(value); 
      this.value = value;
      this.valueChange.emit(value);
  }

  numericOnly(event): boolean {
    const inputChar = event.key;
    const currentValue = event.target.value;

    // 入力が最大長を超えるかどうかを確認
    if (this.maxLength && currentValue.length >= this.maxLength) {
      event.preventDefault();
      return false;
    }
    
    // 0から9の数字と、小数点が許可されている場合は小数点
    if (inputChar.match(/[0-9]/) || (this.allowDecimal && inputChar === '.')) {
      if (this.allowDecimal) {
        if(inputChar === '.'){
          if (currentValue.includes('.')) {
            event.preventDefault();
            return false;
          }

          if (this.decimalPrecision > 0 && currentValue.includes('.') && currentValue.split('.')[1].length >= this.decimalPrecision) {
            event.preventDefault();
            return false;
          }
        }
        // 数字
        else{
          const selectionStart = event.target.selectionStart;
          const selectionEnd = event.target.selectionEnd;
          const newValue = currentValue.slice(0, selectionStart) + inputChar + currentValue.slice(selectionEnd);

          if (this.decimalPrecision > 0 && newValue.includes('.') && newValue.split('.')[1].length > this.decimalPrecision) {
            event.preventDefault();
            return false;
          }
        }
      }
      return true;
    } 
    //0から9の数字と、小数点が許可されている場合は小数点以外
    else {
      event.preventDefault();
      return false;
    }
  }

  numberFormat(val: number | string) {
    // 空の場合そのまま返却
    if (isNullOrUndefined(val) || val === '') return '';
    // 全角から半角へ変換し、既にカンマが入力されていたら事前に削除
    if (isNaN(Number(val))) val = val.toString().replace(/,/g, "").trim();
    
    if (this.allowDecimal) {
      const currentValue = val.toString();

      // 小数点入力が最大長を超える場合
      if (this.decimalPrecision > 0 && currentValue.includes('.') && currentValue.split('.')[1].length >= this.decimalPrecision) {
        const numericValue = parseFloat(currentValue.replace(/,/g, ""));
        val = numericValue.toFixed(this.decimalPrecision);
      }
    }
  
    // 整数部分を3桁カンマ区切りへ
    if(this.formatWithCommas){
      val = isNaN(Number(val)) ? String(val) : Number(val).toLocaleString();
    }

    return val;
  }
}
