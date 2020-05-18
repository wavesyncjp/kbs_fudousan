import { Converter } from './converter';

const Encoding = require('encoding-japanese');

export class Util {
    static stringToCSV(csvData: string, filename: string) {

        const convert = new Converter();
        filename = filename + '_' + convert.formatDay(new Date(), 'yyyyMMddHHmmss') + '.csv';

        csvData = csvData.split('\\r\\n').join('\r\n');
        let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
        //let blob = this.toSjis(csvData);
        let url = URL.createObjectURL(blob);

        let dwldLink = document.createElement("a");        
        let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
        if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
            dwldLink.setAttribute("target", "_blank");
        }
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", filename);
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
    }

    static toSjis(str: string): Blob {

        var unicode_array = this.strToUnicode(str);
        
        // SJISコードポイントの配列に変換
        var sjisArray = Encoding.convert( 
            unicode_array, // ※文字列を直接渡すのではない点に注意
            'SJIS',  // to
            'UNICODE' // from
        );
        
        // 文字コード配列をTypedArrayに変換する
        var uint8Array = new Uint8Array( sjisArray );
        
        // 指定されたデータを保持するBlobを作成する
        var blob = new Blob([ uint8Array ], { type: 'text/csv' });        
        return blob;
    }

    static strToUnicode( str: string ): string[]{
        let arr = [];
        for( var i = 0; i < str.length; i ++ ){
            arr.push( str.charCodeAt( i ) );
        }
        return arr;
    };
}
