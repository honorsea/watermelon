const fs =require("fs");
const { Buffer } = require('buffer');
const rcn = require("./config.json");
const dropboxV2Api = require('dropbox-v2-api');
const dropbox = dropboxV2Api.authenticate({
    token: rcn.accesstoken
});

const rom1savefilepath = `./roms/${rcn.roms["prosecutors path"].filename}.sav`;

fs.watchFile(rom1savefilepath, (curr, prev) => { //check if local save file has changed
    console.log(`${rcn.roms["prosecutors path"].filename} file Changed, uploading now!`);
    fs.copyFile(`${rom1savefilepath}`, `./roms/saveforupload`, (err) => {
        if (err) 
            throw err;   
    });
    dropbox({
        resource: 'files/upload',
        parameters: {
            path: `/Delta Emulator/GameSave-${rcn.roms["prosecutors path"].deeplink}-gameSave`,
            mode: 'overwrite'
            },
        readStream: fs.createReadStream(`./roms/saveforupload`)
    }, (err, result, response) => {
        console.log(err)
    });
});