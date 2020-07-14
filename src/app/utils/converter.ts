import { formatDate } from '@angular/common';
import { DatePipe } from '@angular/common';
import { parse } from 'date-fns';

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
    
    public static stringToNumber(val: String) {
        let ret = val != null ? Number(val.replace(/,/g, "").trim()) : null;
        return ret;
    }
    
    public static numberToString(val: number) {
        let ret;
        if(val == 0) ret = '';
        else if(val != null) ret = Number(val).toLocaleString();
        return ret;
    }
    public static dateToString(val: Date, format: string, datePipe: DatePipe) {
        let ret = val != null ? datePipe.transform(val, format) : null;
        return ret;
    }
    

    public static stringToDate(val: string, format: string) {
        let ret = parse(val, format, new Date());
        return ret;
    }
    

}
