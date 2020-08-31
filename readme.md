## Initial Setup Instructions

1. Create an application at https://dev.twitch.tv/console if you don't need to set a Redirect URI just set it to "http://localhost" then take note of your Client ID, and Client Secret

2. Open the windows start menu and type "path" and select the "Edit the system environment variables" option

3. Click the "Environment Variables..." button in the bottom right of the window

4. Create a new User Variable, name it "Twitch_Client_ID" and set it to the Client ID from step 1

5. Create another new User Variable, name it "Twitch_Secret" and set it to the Client Secret from step 1

6. Enter https://id.twitch.tv/oauth2/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&response_type=code&scope=chat:read+chat:edit+channel:read:redemptions into your web browser replacing CLIENT_ID with the Client ID from step 1/4, and replacing REDIRECT_URI with the Redirect URI you set in step 1

7. After being taken to a url similar to https://localhost/?code=CODE_YOU_NEED&scope=chat%3Aread+chat%3Aedit+channel%3Aread%3Aredemptions copy the CODE_YOU_NEED

8. Run the voicemeeter integration app with the parameters "--setup --redirect YOUR_REDIRECT_URI --code CODE_YOU_NEED"

## Setting up Config.json

The first step to setting up the config.json file is to replace my settings with an empty template like so 
```json
{
    "streamerName": "YOUR_CHANNEL_NAME",
    "channelRewards": {
    }
}
```
After you've done this you can fill in the streamerName field with the name of your twitch channel in all lowercase letters


## Creating Channel Point Rewards/Integrations

To create channel point reward integration the first step is to fill in the channelRewards section of the config file which will look something like
```json
"CHANNEL REWARD NAME": {
    paramaters
},
"NEXT REWARD":{
    parameters
}
```
filling in the "CHANNEL REWARD NAME" and "NEXT REWARD" and so on with the name of the reward on your twitch channel

The parameters will be a duration for the effect and a list of modifications to perform which will look like 
```json
"duration": 30000,
"modifications": [
    {
        "bus": false,
        "index": 1,
        "property": "Gain",
        "value": 12
    }
]
```
The duration is measured in milliseconds and represents how long you want these effects to last before being reverted to previous settings. The modifications are a list of objects that all contain the properties `bus`, `index`, `property`, and `value` enclosed in curly braces {} and followed by a comma if it's not the last one for example `{mod1}, {mod2}`

Under the next heading you will find a description of what each property does and it's possible values

### Modification Properties

* #### `bus`
This is just used to describe which side of the voicemeeter application the effects apply to. Setting this to false means that you will be modifying the Hardware Inputs settings and is what will be assumed in the description of the rest of the properties.

* #### `index`
This describes the Hardware input you want to modify starting from 0, so for example 0 is "Hardware Input 1" and 2 is "Hardware Input 3"

* #### `value`
This is used to modify the selected property by the given amount and it's possible values will be outlined next to the description of each property

* #### `property`
This is what you'd like to modify on the selected input and will be described below
* `"Mute"` - This determines whether or not the given input should be muted and can have the possible values `0` for unmuted or `1` for muted

* `"Pan_x"` - This corresponds to the x-axis of the "Position" intellipan pannel and can range from `-0.5` all the way left and `0.5` all the way right

* `"Pan_y"` - This corresponds to the y-axis of the "Position" intellipan pannel and can range from `0` all the way down and `1` all the way up

* `"Color_x"` - This corresponds to the x-axis of the "Voice" intellipan pannel and can range from `-0.5` all the way left and `0.5` all the way right

* `"Color_y"` - This corresponds to the y-axis of the "Voice" intellipan pannel and can range from `0` all the way down and `1` all the way up

* `"fx_x"` - This corresponds to the x-axis of the "Modulation" intellipan pannel and can range from `-0.5` all the way left and `0.5` all the way right

* `"fx_y"` - This corresponds to the y-axis of the "Modulation" intellipan pannel and can range from `0` all the way down and `1` all the way up

* `"Gain"` - This is the gain for the selected input and can range from `-60` to `12`



## Considering future features

Considering the limitation of Voicemeeter to create interesting and unique voice effects I may decide to add voicemod support as well as voicemeeter to broaden the range of possible effects