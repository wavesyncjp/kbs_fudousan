import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.css']
})
export class TopComponent  extends BaseComponent {

  // view: any[] = ['50%', '100%'];

  // options for the chart
  postChart = {
    showXAxis: true,
    showYAxis: true,
    gradient: false,
    showLegend: false,
    showXAxisLabel: true,
    xAxisLabel: '部署',
    showYAxisLabel: true,
    yAxisLabel: '契約件数',
    timeline: true,
    barPadding: 50,
    colorScheme : {
      domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
    },
    chartData: []
  };

  empChart = {
    showXAxis: true,
    showYAxis: true,
    gradient: false,
    showLegend: false,
    showXAxisLabel: true,
    xAxisLabel: '担当',
    showYAxisLabel: true,
    yAxisLabel: '契約件数',
    timeline: true,
    barPadding: 100,
    colorScheme : {
      domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
    },
    chartData: []
  };

  constructor(public router: Router,
              public service: BackendService) {
      super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('ダッシュボード');
    this.service.isTopPage(true);

    const funcs = [];
    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.getEmps(null));

    Promise.all(funcs).then(values => {
      this.deps = values[0];
      this.emps = values[1];
      this.buildDepChart();
    });

  }

  buildDepChart() {
    const data = [];
    this.deps.forEach(dep => {
      data.push({
        name: dep.depName,
        value: Math.round(Math.random() * 100)
      });
    });
    this.postChart.chartData = data;

    const empData = [];
    this.emps.forEach(emp => {
      empData.push({
        name: emp.employeeName,
        value: Math.round(Math.random() * 100)
      });
    });
    this.empChart.chartData = empData;
  }

  onSelect(event) {
    this.router.navigate(['/bukkens']);
  }

}
