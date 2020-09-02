const { resolve } = require('path');
const Discord = require('discord.js');
const { filter } = require('fuzzaldrin');

const { prefix, token } = require('./config.json');
const buttons = require('./buttons/json/data.json');

const client = new Discord.Client();

client.once('ready', () => {
  console.log('Ready!');

  client.user.setActivity('de la propagande soviétique', { type: 'LISTENING' });

  client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
    if (!channel) return;

    channel.send(`Bienvenue à toi ${member} ! Ici Jean-Michel Jam pour te servir (tu peux m'appeler JMJ en privé), je sais pas encore faire grand chose mais je peux au moins te conseiller d'aller faire un tour sur notre site https://indieco.xyz et d'adhérer à l'asso si tu veux nous soutenir !`);
  });

  client.on('message', async message => {
    const taggedUser = message.mentions.users.first();

    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
      message.channel.send('Pong.');
    }

    if (command === 'button') {
      if (!message.guild) {
        message.channel.send('Déso, pas déso, mais ça fonctionne que dans un serveur !');
        return;
      }

      if (message.member.voice.channel) {
        const results = filter(buttons, args[0], {
          key: 'title',
          maxResults: 5,
        });

        if (results.length === 0) {
          return;
        }

        const connection = await message.member.voice.channel.join();
        const dispatcher = connection.play(resolve('./buttons/sounds/', results[0].fileName + '.mp3'));

        dispatcher.on('start', () => console.log(`Playing sound ${results[0].fileName}`));

        dispatcher.on('finish', () => {
          connection.disconnect();
        });
      } else {
        message.reply("Si tu veux faire du bruit, rejoins d'abord un channel voix !");
      }
    }
  });
});

client.login(token);
