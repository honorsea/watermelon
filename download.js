const fs = require("fs");
const rcn = require("./config.json");
const dropboxV2Api = require('dropbox-v2-api');
let rcnaccess = require("./bruh.json");

const dropbox = dropboxV2Api.authenticate({
    token: rcnaccess.access_token
});

let pickednickname = process.argv.splice(2).toString();
let pickedrom = rcn.roms.find(o => o.nickname === pickednickname);
console.log(pickedrom)

dropbox({
    resource: 'files/get_metadata',
    parameters: {
        path: `/Delta Emulator/GameSave-${pickedrom.deeplink}-gameSave`,
	}
}, (err, result, response) => {
    if(err){ return console.log(err); }
    const datedelta = new Date(result.client_modified);
    console.log(result);
    console.log("Delta time: "+datedelta.getTime())
    fs.stat(`./roms/${pickedrom.romname}.sav`, function(err, stats){
        var mtime = stats.mtime;
        console.log("Local time: "+mtime.getTime());
        if (datedelta.getTime()>mtime.getTime()) {
            console.log("Your save file is not up to date. Downloading from dropbox now...")
            dropbox({
                resource: 'files/download',
                parameters: {
                    path: `/Delta Emulator/GameSave-${pickedrom.deeplink}-gameSave`
                }
            }, (err, result, response) => {
                console.log('download is complete darling')
            })
            .pipe(fs.createWriteStream(`./roms/${pickedrom.romname}.sav`));
          } else {
            console.log("Your save file is up to date.")
        }
    });
});