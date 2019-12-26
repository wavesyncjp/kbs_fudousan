import { formatDate } from '@angular/common';

export class Converter {
    public formatDay(val: Date, format: string) {
        if (val === undefined || val == null) {
            return '';
        }
        return formatDate(val, format, 'en-US');
    }
}
