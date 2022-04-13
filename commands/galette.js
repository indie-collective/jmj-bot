const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('galette')
    .setDescription("Gloire à la Sainte Galette-Saucisse !"),
  async execute(interaction) {
    return interaction.reply('<:galette:914291029883101195>'.repeat(27));
  },
};
