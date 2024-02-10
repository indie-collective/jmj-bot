const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');
const { default: fetch } = require('node-fetch');
const express = require('express');
const http = require('http');
const { Readable } = require('stream');
const ffmpeg = require('fluent-ffmpeg');

const { createTwitchESClient } = require('./twitch');
const twitterClient = require('./twitter');
const helloasso = require('./helloasso');
const wss = require('./ws');

// launch the server
const app = express();

const { DISCORD_TOKEN } = process.env;
const PREFIX = '!';

const defaultActivity = {
  text: 'de la propagande soviétique',
  options: { type: 'LISTENING' },
};

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

// Storing commands on the client
client.commands = new Collection();
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Executing commands on the client
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() && !interaction.isAutocomplete()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  if (interaction.isAutocomplete()) {
    return command.showAutocomplete(interaction);
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    return interaction.reply({
      content: 'Oups, il y a eu un problème avec la commande !',
      ephemeral: true,
    });
  }
});

client.once('ready', async () => {
  console.log('Ready!');

  client.user.setActivity(defaultActivity.text, defaultActivity.options);

  client.on('guildCreate', async (guild) => {
    try {
      const emoji = await guild.emojis.create('./emojimj.png', 'jmj');

      console.log(`Emoji set the guild ${guild.name}!`);
    } catch (err) {
      console.error(`Failed to set the emoji for guild ${guild.name}.`);
    }
  });

  client.on('messageCreate', async (message) => {
    const taggedUser = message.mentions.users.first();

    // welcome message from JMJ
    if (message.system && message.type === 'GUILD_MEMBER_JOIN') {
      return message.reply({
        content: `Salut ${message.author} ! Ici Jean-Michel Jam pour te servir (tu peux m'appeler JMJ en privé). N'hésite pas à te présenter, aller faire un tour sur notre site <https://indieco.xyz> pour découvrir notre asso et adhérer si tu veux nous soutenir !`,
        embeds: [],
      });
    }

    const args = message.content.slice(PREFIX.length).split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'marco') {
      message.channel.send('POLO !');
    }
  });

  const jmjId = '699423675';
  const icId = '91203175';

  const twitchES = createTwitchESClient(
    [
      { type: 'channel.follow', condition: { broadcaster_user_id: jmjId } },
      { type: 'channel.follow', condition: { broadcaster_user_id: icId } },
      { type: 'stream.online', condition: { broadcaster_user_id: icId } },
      { type: 'stream.offline', condition: { broadcaster_user_id: icId } },
      {
        type: 'channel.channel_points_custom_reward_redemption.add',
        condition: { broadcaster_user_id: icId },
      },
    ],
    app
  );

  twitchES.on('channel.follow', async (event) => {
    console.log(`${event.user_name} followed ${event.broadcaster_user_name}.`);

    const staffChannel = await client.channels.cache.find(
      (channel) => (channel.id = '84687138729259008') // #staff on IC
    );

    if (event.broadcaster_user_login === 'jeanmicheljam') {
      staffChannel.send(
        `Oh putain, y a ${event.user_name} qui m'a follow sur Twitch.`
      );
    } else if (event.broadcaster_user_login === 'indiecollective') {
      staffChannel.send(
        `On remercie ${event.user_name} pour son follow Twitch.`
      );
    }
  });

  twitchES.on('stream.online', async (event) => {
    if (event.type !== 'live') return;

    console.log(`${event.broadcaster_user_name} is live!`);

    const generalChannel = await client.channels.cache.find(
      (channel) => channel.id === '448938598545227807' // #general on IC
    );

    if (event.broadcaster_user_login === 'indiecollective') {
      generalChannel.send(
        `Les gens, Indie Collective est en live sur Twitch !

➡️ <https://twitch.tv/indiecollective>`
      );

      client.user.setActivity('avec ses potes sur Twitch', {
        url: 'https://twitch.tv/indiecollective',
        type: 'STREAMING',
      });

      // POST to twitter
      twitterClient.v2.post('tweets', {
        text: `Les gens, @IndieColle est en live sur Twitch !

⬇️⬇️⬇️ https://twitch.tv/indiecollective`,
      });
    }
  });

  twitchES.on('stream.offline', async (event) => {
    client.user.setActivity(defaultActivity.text, defaultActivity.options);
  });

  // receive channel points redemption and send to alerts page
  twitchES.on(
    'channel.channel_points_custom_reward_redemption.add',
    async (event) => {
      wss.sendMessage({
        type: 'twitch',
        data: event,
      });
    }
  );

  // receive helloasso alert and send to discord
  helloasso.on('membership', async (event) => {
    console.log(
      `${event.payer.firstName} ${event.payer.lastName} joined the org.`
    );

    const staffChannel = await client.channels.cache.find(
      (channel) => (channel.id = '84687138729259008') // #staff on IC
    );

    const donation = event.items.find((item) => item.type === 'Donation');

    if (donation) {
      staffChannel.send(
        `${event.payer.firstName} ${event.payer.lastName} vient d'adhérer et de donner ${donation.amount} !`
      );
    } else {
      staffChannel.send(
        `${event.payer.firstName} ${event.payer.lastName} vient d'adhérer !`
      );
    }
  });

  helloasso.on('donation', async (event) => {
    console.log(`${event.payer.firstName} ${event.payer.lastName} donated.`);

    const staffChannel = await client.channels.cache.find(
      (channel) => (channel.id = '84687138729259008') // #staff on IC
    );

    staffChannel.send(
      `${payer.firstName} ${payer.lastName} vient de faire un don de ${data.donation}€ !`
    );
  });
});

client.login(DISCORD_TOKEN);

app.use(express.json());
app.use('/webhooks', require('./webhooks/helloasso'));

// serve static files
app.use(express.static('website'));

// proxy call to google translate api
app.get('/tts', async (req, res) => {
  const { text = '' } = req.query;

  // it seems there is an error 400 when length > 200
  const response = await fetch(
    `https://translate.google.com/translate_tts?client=tw-ob&q=${text}&tl=fr`
  );

  const buffer = await response.buffer();

  // send blob response
  res.set('Content-Type', 'audio/ogg');

  ffmpeg(Readable.from(buffer))
    .format('ogg')
    // setup event handlers
    .on('end', function () {
      console.log('file has been converted succesfully');
    })
    .on('error', function (err) {
      console.log('an error happened: ' + err.message);
    })
    .pipe(res, { end: true });
});

const server = http.createServer(app);

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (websocket) => {
    wss.emit('connection', websocket, request);
  });
});

server.listen(8080, () => console.log(`Started web server on port 8080.`));
