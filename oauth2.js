// Do not forget to specify 'http://localhost:4000/oauth' in 'Redirect URIs'
// section of your dropbox app settings.

const dropboxV2Api = require('dropbox-v2-api');
const Hapi = require('hapi');
const fs = require('fs');
const Opn = require('opn');
const authconfig = require(process.cwd()+'./AUTHCONFIG.json');

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
