const fs = require("fs");
const request = require('request');
const authconfig = require('./config/AUTHCONFIG.json');
const romconfig = require("./config/ROMCONFIG.json");
const dropboxV2Api = require('dropbox-v2-api');

var args = process.argv.slice(2);

var pickednickname = args[0].toString();
var pickedrom = romconfig.roms.find(o => o.nickname === pickednickname);
if (!pickedrom) {console.log("No rom selected. // Cannot find the rom."); process.exit();}

var dataString = `grant_type=refresh_token&refresh_token=${authconfig.refreshToken}`;
var options = {
    url: 'https://api.dropbox.com/oauth2/token',
    method: 'POST',
    body: dataString,
    auth: {
        'user': authconfig.appKey,
        'pass': authconfig.appSecret
}};

request(options, sync);

function sync(error, response, body) {
if (!error && response.statusCode == 200) {

var dropbox = dropboxV2Api.authenticate({
    token: JSON.parse(body).access_token
});

dropbox({
    resource: 'files/get_metadata',
    parameters: {
        path: `/Delta Emulator/GameSave-${pickedrom.deeplink}-gameSave`,
	}
}, (err, result, response) => {
    if(err){ return console.log(err); }
    const datedelta = new Date(result.client_modified);
    fs.stat(`./roms/${pickedrom.romname}.sav`, function(err, stats){
        var mtime = stats.mtime;
        if (!args[1] && datedelta.getTime()>mtime.getTime()) {
            console.log(`Your save file is not up to date. Downloading from Dropbox...`);
            download(dropbox)
          } else if (!args[1] && datedelta.getTime()<=mtime.getTime()) {
            console.log(`Your save file is up to date! Watching the save file for selected rom.`);
            fs.watchFile(`./roms/${pickedrom.romname}.sav`, (curr, prev) => { 
            console.log(`New save detected for ${pickedrom.romname}, uploading to Dropbox...`);
            upload(dropbox)  });
            } else {
                switch (args[1]) {
                    case 'fu':
                    case '-fu':
                        console.log("Force uploading now!");
                        upload(dropbox)
                    break;
                    case 'fd':
                    case '-fd':
                        console.log("Force downloading now!");
                        download(dropbox)
                    break;
                  }
          }
    });
})}};

function upload(dropbox) {
    dropbox({
        resource: 'files/upload',
        parameters: {
            path: `/Delta Emulator/GameSave-${pickedrom.deeplink}-gameSave`,
            mode: 'overwrite'
        },
        readStream: fs.createReadStream(`./roms/${pickedrom.romname}.sav`)
    }, (err, result, response) => {
        if (err) {console.log(err)};
        console.log('Upload is complete! You can re-run the app now.');
});
};

function download(dropbox) {
    dropbox({
        resource: 'files/download',
        parameters: {
            path: `/Delta Emulator/GameSave-${pickedrom.deeplink}-gameSave`
        }
    }, (err, result, response) => {
        if (err) {console.log(err)};
        console.log('Download is complete! You can re-run the app now.');
    }).pipe(fs.createWriteStream(`./roms/${pickedrom.romname}.sav`));
};