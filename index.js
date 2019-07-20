const { resolve } = require('path');
const Discord = require('discord.js');
const { filter } = require('fuzzaldrin');

const { prefix, token } = require('./config.json');
const buttons = require('./buttons/json/data.json');

const client = new Discord.Client();

client.once('ready', () => {
  console.log('Ready!');

  client.on('message', async message => {
    const taggedUser = message.mentions.users.first();
    
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
    
    console.log([message.author.username, message.content].join(': '));

    if (command === 'ping') {
      message.channel.send('Pong.');
    }

    if (command === 'button') {
      if (!message.guild) {
        message.channel.send('Only works in guilds!');
        return;
      }

      if (message.member.voiceChannel) {
        const results = filter(buttons, args[0], {
          key: 'title',
          maxResults: 5,
        });

        if (results.length === 0) {
          return;
        }
  
        const connection = await message.member.voiceChannel.join();        
        const dispatcher = connection.playStream(resolve('./buttons/sounds/', results[0].fileName + '.mp3'))

        dispatcher.on('end', () => {
          dispatcher.destroy();
          message.member.voiceChannel.leave();
        });
        
      } else {
        message.reply('You need to join a voice channel first!');
      }
    }
  });
});

client.login(token);
