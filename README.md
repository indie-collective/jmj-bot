# JMJ bot!

JMJ is a bot for the Indie Collective Discord server.

Responds to the following commands:

 - ping
 - button [sound name]
 - marco
 - photo

Sounds are from the Buttons project by @feoche (http://github.com/feoche/buttons)

## Twitch authorization

IC needs to authorize an app to work. To do so open this URL on your browser and click on the authorize button:

```
https://id.twitch.tv/oauth2/authorize?
  response_type=code
  &client_id=<CLIENT_ID>
  &redirect_uri=http://localhost
  &scope=channel:read:redemptions
```
