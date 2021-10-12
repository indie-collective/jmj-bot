const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Répond Pong!'),
  async execute(interaction) {
    return interaction.reply('Pong!');
  },
};
