import { formatDate } from '@angular/common';

export class Converter {
    public formatDay(val: Date, format: string) {
        if (val === undefined || val == null) {
            return '';
        }
        return formatDate(val, format, 'en-US');
    }

    public static monthsDiff(date1, date2): number {
        let years = this.yearsDiff(date1, date2);
        let months =(years * 12) + (date2.getMonth() - date1.getMonth()) ;
        return months;
    }

    public static yearsDiff(date1, date2): number {
        let yearsDiff =  date2.getFullYear() - date1.getFullYear();
        return yearsDiff;
    }
    
    public static stringToNumber(before: String, after: number) {
        after = before != null ? +before.replace(/,/g, "").trim() : null;
        return after;
    }
    
    public static stringForNumber(val: number) {
        let ret;
        if(val == 0) ret = '';
        else if(val != null) ret = Number(val).toLocaleString();
        return ret;
    }

}
