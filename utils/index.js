const fs = require('fs');
const readline = require('readline');

const config = require('../config');


var TextDateToDate = (textDate) => {
    let len = textDate.length;
    if (len < 10 && textDate != '') {
        let arr = String(textDate).split('.');
        let day = arr[0];
        let month = arr[1];
        let year = arr[2];
        if (day.length < 2) {
            day = '0' + day;
        }
        if (month.length < 2) {
            month = '0' + month;
        }
        if (year.length < 4) {
            year = '20'+year;
        }
        textDate = `${day}.${month}.${year}`;
    }
    let typeDev = config.IS_PRODUCTION;
    let h=3;
    if (!typeDev) {
        h=3;
    }
    return new Date(textDate.substr(6, 4), textDate.substr(3, 2)-1, textDate.substr(0, 2), h, 0, 0, 0);
}
var DateInString = (date) => {
    var dateS = new Date(date);
    var day = dateS.getDate();
    var month = dateS.getMonth()+1;
    var year = dateS.getFullYear();
    if (day < 10) day = '0'+day;
    if (month < 10) month = '0'+month;

    return `${day}.${month}.${year}`
}

module.exports = {
    TextDateToDate, DateInString
}