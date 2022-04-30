const fs = require("fs");
const process = require('process');
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var obj = {"roms":[]};

rl.question("Enter a short name (ex: pokemondp) for your rom: ", nickname=> {
    rl.question("Paste the exact filename of your rom(located in ./roms folder) without the extension: ",  romfilename=> {
        rl.question("Paste rom deep link without delta://game/ (Open Delta App>Hold on your rom>Share>Copy Deep Link)",  deeplink=> {
            try {
                if (fs.existsSync(process.cwd()+'/ROMCONFIG.json')) {
                    fs.readFile(process.cwd()+'/ROMCONFIG.json', function (err, data) {
                        var json = JSON.parse(data)
                        json.roms.push({nickname: nickname, romname: romfilename, deeplink:deeplink})
                        fs.writeFileSync(process.cwd()+'/ROMCONFIG.json', JSON.stringify(json));
                        rl.close();
                    })
                } else {
                    obj.roms.push({nickname: nickname, romname: romfilename, deeplink:deeplink})
                    fs.writeFileSync(process.cwd()+'/ROMCONFIG.json', JSON.stringify(obj));
                    rl.close();
                }
            } catch(err) { console.log(err); }
        });
    });
});
