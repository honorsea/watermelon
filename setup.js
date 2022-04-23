const fs =require("fs");
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var obj = {
    accesstoken: "",
    roms: []
};

rl.question("Enter a short name for your rom: ", nickname=> {
    rl.question("Paste the Dropbox developer app access token from App Console: ",  token=> {
        obj.accesstoken = token;
        rl.question("Paste rom name: ",  romfilename=> {
            rl.question("Paste rom deep link: ",  deeplink=> {
                obj.roms.push({nickname: nickname, romname: romfilename, deeplink:deeplink});
                fs.writeFileSync('configtest.json', JSON.stringify(obj));
                rl.close();
            });
        });
    });
});