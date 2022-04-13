const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rs')
    .setDescription("Les réseaux sociaux d'Indie Collective !"),
  async execute(interaction) {
    return interaction.reply(`Hésitez pas à suivre notre merveilleuse association sur tous les réseaux sociaux :
➡️  <https://linktr.ee/indiecollective>

Mais surtout, suivez-moi sur Twitter : <https://twitter.com/jeanmichel_jam> !`);
  },
};
