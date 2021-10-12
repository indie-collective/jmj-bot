const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('marco')
    .setDescription('Répond POLO !'),
  async execute(interaction) {
    return interaction.reply('POLO !');
  },
};
