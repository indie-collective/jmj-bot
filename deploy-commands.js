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

// IC's discord ID
const guildId = '84687138729259008';

// remove guild commands
// rest
//   // IC's discord ID
//   .get(Routes.applicationGuildCommands(DISCORD_APP_ID, guildId))
//   .then((data) => {
//     const promises = [];
//     for (const command of data) {
//       const deleteUrl = `${Routes.applicationGuildCommands(
//         DISCORD_APP_ID,
//         guildId
//       )}/${command.id}`;
//       promises.push(rest.delete(deleteUrl));
//     }
//     return Promise.all(promises);
//   })
//   .then(() => console.log('Successfully removed guild commands.'))
//   .catch(console.error);

// guild commands
// rest
//   .put(Routes.applicationGuildCommands(DISCORD_APP_ID, guildId), {
//     body: commands,
//   })
//   .then(() => console.log('Successfully registered guild commands.'))
//   .catch(console.error);

// application commands
rest
  .put(Routes.applicationCommands(DISCORD_APP_ID), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
