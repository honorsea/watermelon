<img src="https://user-images.githubusercontent.com/36116897/164985371-96bdb93e-4405-440f-ad03-62c9e0f0151a.png" width="900" height="180">
Sync system for Nintendo DS save files between melonDS and Delta.

## Setting up credentials & modules
Create a Scoped App with Full Dropbox access from Dropbox App Console.
<br />Go to permissions and enable:
<b>files.metadata.write
files.content.write
files.content.read</b>
<br/>Go to settings and copy <b>App key</b> & <b>App Secret</b> then insert them to the AUTHCONFIG.json file located in the config folder.

Open a terminal window located at source and type <b>npm install</b> (You must have Node.js installed, if you don't install it first.)
<br/>Now everything is ready to go.

## Quick start
Open a terminal window and type <b>node oauth2</b>. This will redirect you to Dropbox. Authorize the app then return to the terminal window.
<br/>Close the terminal window(or CTRL+C) and type <b>node authtoken</b>. Authentication is complete! Use <b>node add</b> to add roms to ROMCONFIG.json file. (<b>NOTE:</b> The roms that you use with melonDS must be located in ./roms folder.)

## Functions
node upload: Upload local melonDS save file to Delta Dropbox Folder.<br/>
node download: Download Delta save from Dropbox and replace it with local melonDS save.<br/>
node add: Add roms to ROMCONFIG.json
