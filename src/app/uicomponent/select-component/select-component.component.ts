import { Component, OnInit, Input } from '@angular/core';
import { Code } from 'src/app/models/bukken';

@Component({
  selector: 'app-select-component',
  templateUrl: './select-component.component.html',
  styleUrls: ['./select-component.component.css']
})
export class SelectComponentComponent implements OnInit {

  @Input()
  codes: Code[];

  @Input()
  ngModel: string;

  constructor() { }

  ngOnInit() {
  }

}
