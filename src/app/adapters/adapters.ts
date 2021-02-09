import { NativeDateAdapter, MatPaginatorIntl, MAT_DATE_FORMATS } from '@angular/material';
import { Injectable } from "@angular/core";

@Injectable()
export class JPDateAdapter extends NativeDateAdapter {
    getDateNames(): string[] {
      return Array.from(Array(31), (v, k) => `${k + 1}`);
    }
}


@Injectable()
export class MatPaginatorIntlJa extends MatPaginatorIntl {
    itemsPerPageLabel = '件数';
    nextPageLabel     = '次へ';
    previousPageLabel = '戻る';

    getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) { return `${length} 件中 0`; }

      length = Math.max(length, 0);

      const startIndex = page * pageSize;

      const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;

      return `${length} 件中 ${startIndex + 1} - ${endIndex}`;
    }
}
