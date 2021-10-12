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
          description: 'Le meilleur de tous les jammers.',
          image: {
            url: 'https://raw.githubusercontent.com/indie-collective/website/master/img/jmj.png',
          },
          footer: {
            text: "L'abus de JMJ est dangereux pour la santé, à consommer avec modération.",
          },
        },
      ],
      content: 'Tu veux ma photo ?',
    });
  },
};
