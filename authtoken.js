const fs = require("fs");
const request = require('request');
const authconfig = require('./config/AUTHCONFIG.json');

var dataString = `grant_type=refresh_token&refresh_token=${authconfig.refreshToken}`;

var options = {
    url: 'https://api.dropbox.com/oauth2/token',
    method: 'POST',
    body: dataString,
    auth: {
        'user': authconfig.appKey,
        'pass': authconfig.appSecret
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
};

request(options, callback).pipe(fs.createWriteStream('./config/ACCESSCONFIG.json'));