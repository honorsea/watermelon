// Do not forget to specify 'http://localhost:4000/oauth' in 'Redirect URIs'
// section of your dropbox app settings.

const dropboxV2Api = require('dropbox-v2-api');
const Hapi = require('hapi');
const fs = require('fs');
const Opn = require('opn');
const authconfig = require('./config/AUTHCONFIG.json');

//set auth credentials
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

//prepare server & oauth2 response callback
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
				dropbox.getToken(params.code, function (err, response) {
					console.log(err);
					console.log('user\'s refresh_token: ', response.refresh_token);
					obj.refreshToken = response.refresh_token
					fs.writeFileSync("./config/AUTHCONFIG.json", JSON.stringify(obj));

				});
			})
		}
	});

	await server.start();
	Opn(dropbox.generateAuthUrl());
	console.log('Server running on %s', server.info.uri);
})()