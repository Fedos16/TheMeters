const fs = require('fs');
var {google} = require('googleapis');
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
// Функция авторизации в гугл
var GoogleSheets = async (listMajors) => {
    // АВТОРИЗАЦИЯ В ГУГЛ ТАБЛИЦАХ И ЗАПРОС ДАННЫХ
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
    const TOKEN_PATH = 'token_sheets.json';
    fs.readFile('credentials_sheets.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);

        authorize(JSON.parse(content), listMajors);
    });
    function authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
        fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
        });
    }
    function getNewToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) console.error(err);
            console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
        });
    }
}

module.exports = {
    TextDateToDate, DateInString, GoogleSheets
}