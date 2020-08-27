import { Component } from '@angular/core';
import { BackendService } from '../backend.service';
import { BaseComponent } from '../BaseComponent';
import { Templandinfo } from '../models/templandinfo';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { JPDateAdapter } from '../adapters/adapters';
import { Planhistorylist } from '../models/planhistorylist';

@Component({
  selector: 'app-planhistory-list',
  templateUrl: './planhistory-list.component.html',
  styleUrls: ['./planhistory-list.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})
export class PlanHistoryListComponent extends BaseComponent {
  
  public history: Planhistorylist;

  ngOnInit() {
    const funcs = [];
    funcs.push(this.service.getPlanHistoryList(null));

    Promise.all(funcs).then(values => {

      this.history = values[0];
    });
  }

    
      
}