const fs =require("fs");
const rcn = require("./config.json");
const dropboxV2Api = require('dropbox-v2-api');
const dropbox = dropboxV2Api.authenticate({
    token: rcn.accesstoken
});

//const rom1savefilepath = `./roms/${rcn.roms["prosecutors path"].filename}.sav`;
let pickednickname = process.argv.splice(2).toString();
let pickedrom = rcn.roms.find(o => o.nickname === pickednickname);
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