const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('frank')
    .setDescription('Reçois une belle photo de Frank !'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [
        {
          title: 'Frank',
          description: "L'organisateur du projet européen InJam.",
          image: {
            url: 'https://raw.githubusercontent.com/indie-collective/website/master/img/frank.png',
          },
          footer: {
            text: 'Met Frank dans ton jeu, il sera très content !',
          },
          fields: [
            { name: 'Statut', value: 'Le boss du projet.' },
            { name: 'Cheveux', value: 'Beaucoup', inline: true },
            { name: 'Âge', value: 'Vieux', inline: true },
            { name: 'Grand', value: 'Oui', inline: true },
          ],
        },
      ],
      content:
        "Lui, c'est Frank, il organise des game jam comme nous, tu le connais ? (en SVG ici : <https://indieco.xyz/img/frank.svg>)",
    });
  },
};
