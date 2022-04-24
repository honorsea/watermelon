const fs = require("fs");
const romconfig = require("./config/ROMCONFIG.json");
const dropboxV2Api = require('dropbox-v2-api');
let accessconfig = require("./config/ACCESSCONFIG.json");

const dropbox = dropboxV2Api.authenticate({
    token: accessconfig.access_token
});

let pickednickname = process.argv.splice(2).toString();
let pickedrom = romconfig.roms.find(o => o.nickname === pickednickname);
console.log("Don't close this terminal window as long as you continue to play.")
console.log(pickedrom)

fs.watchFile(`./roms/${pickedrom.romname}.sav`, (curr, prev) => { //check if local save file has changed
    console.log(`New save detected for ${pickedrom.romname}, uploading to Dropbox!`);
    fs.copyFile(`./roms/${pickedrom.romname}.sav`, `./roms/saveforupload`, (err) => {
        if (err) 
            throw err;   
    });
    dropbox({
        resource: 'files/upload',
        parameters: {
            path: `/Delta Emulator/GameSave-${pickedrom.deeplink}-gameSave`,
            mode: 'overwrite'
            },
        readStream: fs.createReadStream(`./roms/saveforupload`)
    }, (err, result, response) => {
        //
    });
});
