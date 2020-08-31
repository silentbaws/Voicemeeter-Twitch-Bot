const ApiClient = require('twitch');
const RefreshableAuthProvider = require('twitch-auth').RefreshableAuthProvider;
const StaticAuthProvider = require('twitch').StaticAuthProvider;
const ChatClient = require('twitch-chat-client').ChatClient;
const PubSubClient = require('twitch-pubsub-client').PubSubClient;
const VoiceMeeterEvent = require('./VoiceMeeterEvent').VoiceMeeterEvent;
const VoiceMeeterModification = require('./VoiceMeeterEvent').VoiceMeeterModification;
const fs = require('fs').promises;
const VoiceMeeter = require('voicemeeter-connector');
const { RunSetup } = require('./setup');

var vm = null
var voiceMeeterEventList = []

const LoudBoiFilter = [new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.Gain, 12)]
const AlienFilter = [new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.fx_x, 1000), new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.fx_y, 1000)]
const MrRobotoFilter = [new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.fx_y, 1000)]
const RollerCoasterFilter = [new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.fx_y, 1000), new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.fx_x, -1000)]
const PleaseShutUp = [new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.Mute, 1)]

//fx_x/Color_x/Pan_x -0.5 - 0.5, default: 0
//fx_y/Color_y/Pan_y 0 - 1, default: 0
//Mute 0/1, default: 0
//Gain -60 - 12, default: 0

const voicemeeterEventListener = function() {
    if (voiceMeeterEventList.length > 0){
        voiceMeeterEventList[0].activateModification(vm);
        if (voiceMeeterEventList[0].shouldRemoveModification()){
            voiceMeeterEventList[0].removeModification(vm);
            voiceMeeterEventList.shift();
        }
    }
}

const clientId = process.env.Twitch_Client_ID;
const clientSecret = process.env.Twitch_Secret;

async function main() {
    const loadedConfig = JSON.parse(await fs.readFile('./config.json', 'utf-8'));

    VoiceMeeter.default.init().then(voiceM => {
        // Connect to your Voicemeeter client
        voiceM.connect();
        
        vm = voiceM
    });
    
    if (process.platform === "win32") {
        var rl = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout
        });
    
        rl.on("SIGINT", function () {
            process.emit("SIGINT");
        });
    }
      
    process.on("SIGINT", function () {
        vm.disconnect();    
    });

    const tokenData = JSON.parse(await fs.readFile('./tokens.json', 'utf-8'));

    const auth = new RefreshableAuthProvider(
        new StaticAuthProvider(clientId, tokenData.accessToken),
        {
            clientSecret,
            refreshToken: tokenData.refreshToken,
            expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
            onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
                const newTokenData = {
                    accessToken,
                    refreshToken,
                    expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
                };
                await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf-8')
            }
        }
    );
    const apiClient = new ApiClient({ authProvider: auth });
    
    const pubSubClient = new PubSubClient();
    userId = await pubSubClient.registerUserListener(apiClient);

    pubSubClient.onRedemption(userId, (message) => {
        let rewardData = message._data.data.redemption.reward;

        let redeemedReward = loadedConfig.channelRewards[rewardData.title]

        if (redeemedReward != undefined) {
            console.log(`${message._data.data.redemption.user.display_name} redeemed the voice modification reward ${rewardData.title}`);
            voiceMeeterEventList.push(new VoiceMeeterEvent(redeemedReward.modifications, redeemedReward.duration));
        }
    });

    const chatClient = new ChatClient(auth, { channels: [loadedConfig.streamerName] });
    await chatClient.connect();

    chatClient.onMessage((channel, user, message) => {
        if (user === loadedConfig.streamerName && message === '!quit'){
            vm.disconnect();
            process.exit();
        }
    });

    setInterval(voicemeeterEventListener, 1000);
}

let runSetup = false;
let unknownCommand = false;
let redirectURI = "";
let sendCode = "";
for (var i = 2; i < process.argv.length; i ++) {
    if (process.argv[i] === '--setup'){
        runSetup = true;
    } else if (process.argv[i] === '--redirect') {
        redirectURI = process.argv[i + 1];
        i ++;
    } else if (process.argv[i] === '--code') {
        sendCode = process.argv[i + 1];
        i ++;
    } else {
        unknownCommand = true;
        console.log(`Unknown command ${process.argv[i]}, cancelling program execution`);
    }
}

if (!runSetup && !unknownCommand){
    main();
} else if (runSetup && redirectURI != "" && sendCode != ""){
    RunSetup(redirectURI, sendCode, clientId, clientSecret);
}