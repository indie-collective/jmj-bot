const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const { DISCORD_TOKEN, DISCORD_APP_ID } = process.env;

const commands = [];
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

rest
  // IC's discord ID
  // .put(Routes.applicationGuildCommands(DISCORD_APP_ID, '84687138729259008'), {
  //   body: commands,
  // })
  .put(Routes.applicationCommands(DISCORD_APP_ID), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
