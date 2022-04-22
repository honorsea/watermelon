const fs =require("fs");
const { Buffer } = require('buffer');
const rcn = require("./config.json");
const dropboxV2Api = require('dropbox-v2-api');
const dropbox = dropboxV2Api.authenticate({
    token: rcn.accesstoken
});

const rom1savefile = `./roms/${rcn.roms["prosecutors path"].filename}.sav`;

dropbox({
    resource: 'files/download',
    parameters: {
        path: `/testforwatermelon/savemeta`  // ${rcn.roms["prosecutors path"].deeplink}
    }
}, (err, result, response) => {
    console.log('download is complete darling')
})
.pipe(fs.createWriteStream('./roms/savemeta'));

/*dropbox({
    resource: 'files/upload',
    parameters: {
        path: '/testforwatermelon/texttext.txt',
        mode: 'overwrite'
        },
    readStream: fs.createReadStream('./roms/testtext.txt')
}, (err, result, response) => {
    console.log("upload is complete darling")
});*/

fs.watchFile(rom1savefile, (curr, prev) => { //check if local save file has changed
    console.log(`${rcn.roms["prosecutors path"].filename} file Changed`);
  });


  