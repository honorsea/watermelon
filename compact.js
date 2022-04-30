const fs = require('fs');
const process = require('process');
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const request = require('request');
const authconfig = require(process.cwd()+'/AUTHCONFIG.json');
const dropboxV2Api = require('dropbox-v2-api');
const Hapi = require('hapi');
const Opn = require('opn');

var args = process.argv.slice(2);

if (!authconfig.refreshToken) {

const dropbox = dropboxV2Api.authenticate({
	client_id: authconfig.appKey,
	client_secret: 	authconfig.appSecret,
	token_access_type: 'offline',
	redirect_uri: 'http://localhost:4000/oauth'
});

var obj = {
    "appKey":authconfig.appKey,
    "appSecret":authconfig.appSecret,
    "refreshToken":""
};

(async () => {
	const server = Hapi.server({
		port: 4000,
		host: 'localhost'
	});

	server.route({
		method: 'GET',
		path: '/oauth',
		handler: function (request, h) {
			var params = request.query;

			return new Promise((resolve) => {
                resolve('You can close this browser window now and return to terminal.')
				dropbox.getToken(params.code, function (err, response) {
					console.log('Authentication complete. ');
					obj.refreshToken = response.refresh_token
					fs.writeFileSync(process.cwd()+"/AUTHCONFIG.json", JSON.stringify(obj));
                    process.exit();
				});
			})
		}
	});

	await server.start();
	Opn(dropbox.generateAuthUrl());
	console.log('Refresh token not found. Please authorise with your Dropbox account:');
})()

};

switch(args[0]) {
    case 'sync':
        var pickedrom;
        try {
            var romconfig = require(process.cwd()+'/ROMCONFIG.json');
            var pickednickname = args[1];
            pickedrom = romconfig.roms.find(o => o.nickname === pickednickname);
          } catch (err){
             console.log("Cannot find ROMCONFIG.json file. // Cannot find the rom you're looking for.");
             process.exit();
          }
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
                if (!args[2] && datedelta.getTime()>mtime.getTime()) {
                    console.log(`Your save file is not up to date. Downloading from Dropbox...`);
                    download(dropbox)
                  } else if (!args[2] && datedelta.getTime()<=mtime.getTime()) {
                    console.log(`Your save file is up to date! Watching the save file for selected rom.`);
                    fs.watchFile(`./roms/${pickedrom.romname}.sav`, (curr, prev) => { 
                    console.log(`New save detected for ${pickedrom.romname}, uploading to Dropbox...`);
                    upload(dropbox)  });
                    } else {
                        switch (args[2]) {
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
        break;
    case 'add':
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
        break;
    default:
    if (authconfig.refreshToken) {
        console.log(`Usage: watermelon [function] (rom nickname) [args]\n
        Functions:\nadd  : Setup your first rom or add more roms for sync.\nsync : Start syncing your save file between melonDS and Dropbox.\n
        Args:\n-fu : Force upload your savefile to Dropbox.\n-fd : Force download the save file from Dropbox.\n
        Examples:\nwatermelon sync pokemondp\nwatermelon add\nwatermelon sync pokemondp -fd`);
        process.exit();
    }
}

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