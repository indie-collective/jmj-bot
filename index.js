const { resolve } = require('path');
const Discord = require('discord.js');
const { filter } = require('fuzzaldrin');

const buttons = require('./buttons/json/data.json');

const { DISCORD_TOKEN } = process.env;
const PREFIX = '!';

const client = new Discord.Client({ intents: new Discord.Intents(Discord.Intents.ALL) });

client.once('ready', async () => {
  console.log('Ready!');

  client.user.setActivity('de la propagande soviétique', { type: 'LISTENING' });

  if (client.application) {
    console.log('Registering slash commands');

    const commands = [
      {
        name: 'ping',
        description: 'Répond Pong.',
      },
      {
        name: 'marco',
        description: 'Répond POLO!',
      },
      {
        name: 'photo',
        description: 'Reçois une belle photo de JMJ!',
      },
      {
        name: 'button',
        description: 'Joue un son sur le channel voix.',
        options: [
          {
            name: 'nom',
            type: 'STRING',
            description: 'Le nom du fichier qui sera joué',
            required: true,
          },
        ],
      },
    ];

    await client.application.commands.set(commands);

    // set guild commands
    // const registeredCommands = await client.guilds.cache
    //   .get('84687138729259008') // IC's discord ID
    //   .commands.set([commands[3]]);
  }

  client.on('interaction', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ping') await interaction.reply('Pong.');
    else if (interaction.commandName === 'marco')
      await interaction.reply('POLO !');
    else if (interaction.commandName === 'photo') {
      const embed = new Discord.MessageEmbed().attachFiles(['jmj.png']);

      await interaction.reply(embed);
    } else if (interaction.commandName === 'button') {
      if (!interaction.guild) {
        interaction.reply(
          'Déso, pas déso, mais ça fonctionne que dans un serveur !',
          { ephemeral: true }
        );
        return;
      }

      if (interaction.member.voice.channel) {
        const results = filter(buttons, interaction.options.first().value, {
          key: 'title',
          maxResults: 5,
        });

        if (results.length === 0) {
          return;
        }

        const connection = await interaction.member.voice.channel.join();
        const dispatcher = connection.play(
          resolve('./buttons/sounds/', results[0].fileName + '.mp3')
        );

        dispatcher.on('start', () => {
          console.log(`Playing sound ${results[0].fileName}`);
          interaction.reply(`${interaction.options.first().value} -> ${results[0].title} (${results[0].fileName})`);
        });

        dispatcher.on('finish', () => {
          connection.disconnect();
        });

        dispatcher.on('error', (err) => {
          interaction.reply('Erreur de lecture :(', { ephemeral: true });
          console.error(err);
          connection.disconnect();
        });
      } else {
        interaction.reply(
          "Si tu veux faire du bruit, rejoins d'abord un channel voix !",
          { ephemeral: true }
        );
      }
    }
  });

  client.on('guildCreate', async (guild) => {
    try {
      const emoji = await guild.emojis.create('./emojimj.png', 'jmj');

      console.log(`Emoji set the guild ${guild.name}!`);
    }
    catch (err) {
      console.error(`Failed to set the emoji for guild ${guild.name}.`);
    }
  });

  client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.find(
      (ch) => ch.id === '581081596107685898' // welcome channel for IC Discord
    );
    if (!channel) return;

    channel.send(
      `Bienvenue à toi ${member} ! Ici Jean-Michel Jam pour te servir (tu peux m'appeler JMJ en privé), je sais pas encore faire grand chose mais je peux au moins te conseiller d'aller faire un tour sur notre site https://indieco.xyz et d'adhérer à l'asso si tu veux nous soutenir !`
    );
  });

  client.on('message', async (message) => {
    const taggedUser = message.mentions.users.first();

    const args = message.content.slice(PREFIX.length).split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
      message.channel.send('Pong.');
    }

    if (command === 'marco') {
      message.channel.send('POLO !');
    }

    if (command === 'photo') {
      message.channel.send('Tu veux ma photo ?', { files: ['./jmj.png'] });
    }

    if (command === 'button') {
      if (!message.guild) {
        message.channel.send(
          'Déso, pas déso, mais ça fonctionne que dans un serveur !'
        );
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
        const dispatcher = connection.play(
          resolve('./buttons/sounds/', results[0].fileName + '.mp3')
        );

        dispatcher.on('start', () =>
          console.log(`Playing sound ${results[0].fileName}`)
        );

        dispatcher.on('finish', () => {
          connection.disconnect();
        });
      } else {
        message.reply(
          "Si tu veux faire du bruit, rejoins d'abord un channel voix !"
        );
      }
    }
  });
});

client.login(DISCORD_TOKEN);
