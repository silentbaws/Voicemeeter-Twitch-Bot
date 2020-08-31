const ApiClient = require('twitch');
const RefreshableAuthProvider = require('twitch-auth').RefreshableAuthProvider;
const StaticAuthProvider = require('twitch').StaticAuthProvider;
const ChatClient = require('twitch-chat-client').ChatClient;
const PubSubClient = require('twitch-pubsub-client').PubSubClient;
const fs = require('fs').promises;
const VoiceMeeter = require('voicemeeter-connector');
const VoiceMeeterEvent = require('./VoiceMeeterEvent').VoiceMeeterEvent;
const VoiceMeeterModification = require('./VoiceMeeterEvent').VoiceMeeterModification;

vm = null
voiceMeeterEventList = []

const LoudBoiFilter = [new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.Gain, 12)]
const AlienFilter = [new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.fx_x, 1000), new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.fx_y, 1000)]
const MrRobotoFilter = [new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.fx_y, 1000)]
const RollerCoasterFilter = [new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.fx_y, 1000), new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.fx_x, -1000)]
const PleaseShutUp = [new VoiceMeeterModification(false, 1, VoiceMeeter.StripProperties.Mute, 1)]

const voicemeeterEventListener = function() {
    if (voiceMeeterEventList.length > 0){
        voiceMeeterEventList[0].activateModification(vm);
        if (voiceMeeterEventList[0].shouldRemoveModification()){
            voiceMeeterEventList[0].removeModification(vm);
            voiceMeeterEventList.shift();
        }
    }
}

async function main() {
    const clientId = process.env.Twitch_Client_ID;
    const clientSecret = process.env.Twitch_Secret;
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
        rewardData = message._data.data.redemption.reward;

        if (rewardData.title === 'Loud Boi') {
            voiceMeeterEventList.push(new VoiceMeeterEvent(LoudBoiFilter, 30000))
        } else if (rewardData.title === 'Mr Roboto Voice'){
            voiceMeeterEventList.push(new VoiceMeeterEvent(MrRobotoFilter, 30000))
        } else if (rewardData.title === 'Speak Lizardman Language'){
            voiceMeeterEventList.push(new VoiceMeeterEvent(AlienFilter, 30000))
        } else if (rewardData.title === 'Rollercoaster fx'){
            voiceMeeterEventList.push(new VoiceMeeterEvent(RollerCoasterFilter, 30000))
        } else if (rewardData.title === 'Silent do be annoying'){
            voiceMeeterEventList.push(new VoiceMeeterEvent(PleaseShutUp, 30000))
        }
    });

    const chatClient = new ChatClient(auth, { channels: ['silentbaws'] });
    await chatClient.connect();

    chatClient.onMessage((channel, user, message) => {
        if (user === 'silentbaws' && message === '!quit'){
            vm.disconnect();
        }
    });

    setInterval(voicemeeterEventListener, 1000);
}

VoiceMeeter.default.init().then(voiceM => {
    // Connect to your Voicemeeter client
    voiceM.connect();
    
    vm = voiceM
});

main();