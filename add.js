const fs =require("fs");
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

fs.readFile('./config/ROMCONFIG.json', function (err, data) {
    rl.question("Enter a short name (ex: pokemondp) for your rom: ", nickname=> {
        rl.question("Paste the exact filename of your rom(located in ./roms folder) without the extension: ",  romfilename=> {
            rl.question("Paste rom deep link without delta://game/ (Open Delta App>Hold on your rom>Share>Copy Deep Link)",  deeplink=> {
                var json = JSON.parse(data)
                json.roms.push({nickname: nickname, romname: romfilename, deeplink:deeplink})
                fs.writeFileSync('./config/ROMCONFIG.json', JSON.stringify(json));
                rl.close();
            });
        });
    });
})