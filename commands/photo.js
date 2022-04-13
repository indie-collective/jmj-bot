const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('photo')
    .setDescription('Reçois une belle photo de JMJ !'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [
        {
          title: 'Jean-Michel Jam',
          description:
            "Le meilleur de tous les jammers. Plus d'infos : <https://jmj.indieco.xyz>",
          image: {
            url: 'https://raw.githubusercontent.com/indie-collective/website/master/img/jmj.png',
          },
          footer: {
            text: "L'abus de JMJ est dangereux pour la santé, à consommer avec modération.",
          },
          fields: [
            { name: 'Statut', value: "Mascotte d'Indie Collective." },
            { name: 'Orientation', value: 'À gauche', inline: true },
            { name: 'Sexe', value: 'Oui', inline: true },
            { name: 'Bras', value: '1/2', inline: true },
          ],
        },
      ],
      content: 'Tu veux ma photo ?',
    });
  },
};
