import { formatDate } from '@angular/common';
import { DatePipe } from '@angular/common';
// 20240610 S_Update
// import { parse } from 'date-fns';
import { parse, format } from 'date-fns';
// 20240610 E_Update

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
        if(val == null || val == 0) ret = '';
        else ret = Number(val).toLocaleString();
        return ret;
    }
    public static dateToString(val: Date, format: string, datePipe: DatePipe) {
        let ret = val != null ? datePipe.transform(val, format) : null;
        return ret;
    }
    
    public static stringToDate(val: string, format: string) {
        let ret = val != null && val !== '' ? parse(val, format, new Date()) : null;
        return ret;
    }

    // 20240610 S_Add
    public static dateToString2(val: String, format: string, datePipe: DatePipe) {
        let ret = val != null ? datePipe.transform(val.toString(), format) : null;
        return ret;
    }
    public static stringToDate2(val: string, formatDate: string) {
        let ret = val != null && val !== '' ? parse(val, formatDate, new Date()) : null;
        if(ret != null){
            return format(ret, 'yyyy/M/d');
        }
        return val;
    }
    // 20240610 E_Add
}
