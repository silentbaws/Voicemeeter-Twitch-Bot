const request = require('request');
const fs = require('fs');

async function RunSetup(redirectURI, code, clientID, clientSecret){
    console.log ("Running setup");
    request.post(`https://id.twitch.tv/oauth2/token?client_id=${clientID}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectURI}`, {}, (error, res, body) => {
        if (error) {
            console.log("Error running the setup");
            console.error(error);
            return;
        }

        if (res.statusCode == 400){
            console.log("Error running setup");
            console.log(body.message);
        } else {
            var responseBody = JSON.parse(body);
            var tokenFileBody = {accessToken: responseBody.access_token, refreshToken: responseBody.refresh_token, expiryTimestamp: 0};
    
            fs.writeFile('./tokens.json', JSON.stringify(tokenFileBody, null, 4), 'utf-8', err => {
                if (err != null) {
                    console.log("Error writing to file");
                    console.error(err);
                }
            });
        }
    });
}

exports.RunSetup = RunSetup;