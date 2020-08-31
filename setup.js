const request = require('request');

function RunSetup(redirectURI, code, clientID, clientSecret){
    console.log ("Running setup");
    request.post(`https://id.twitch.tv/oauth2/token?client_id=${clientID}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectURI}`, {}, (error, res, body) => {
        if (error) {
            console.error(error)
            return
        }
        console.log(`statusCode: ${res.statusCode}`);
        console.log(body);
    })
}

exports.RunSetup = RunSetup;