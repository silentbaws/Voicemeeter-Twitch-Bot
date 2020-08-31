## Initial Setup Instructions

1. Create an application at https://dev.twitch.tv/console if you don't need to set a Redirect URI just set it to "http://localhost" then take note of your Client ID, and Client Secret

2. Open the windows start menu and type "path" and select the "Edit the system environment variables" option

3. Click the "Environment Variables..." button in the bottom right of the window

4. Create a new User Variable, name it "Twitch_Client_ID" and set it to the Client ID from step 1

5. Create another new User Variable, name it "Twitch_Secret" and set it to the Client Secret from step 1

6. Enter https://id.twitch.tv/oauth2/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&response_type=code&scope=chat:read+chat:edit+channel:read:redemptions into your web browser replacing CLIENT_ID with the Client ID from step 1/4, and replacing REDIRECT_URI with the Redirect URI you set

7. After being taken to a url similar to https://localhost/?code=CODE_YOU_NEED&scope=chat%3Aread+chat%3Aedit+channel%3Aread%3Aredemptions copy the CODE_YOU_NEED

8. Run the voicemeeter integration app with the parameters "--setup --redirect YOUR_REDIRECT_URI --code CODE_YOU_NEED"


## Creating channel points integration

