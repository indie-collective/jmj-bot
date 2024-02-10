const {
  SlashCommandBuilder,
  hideLinkEmbed,
  hyperlink,
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guides')
    .setDescription("Tu as besoin d'un guide suprême pour t'aider ?"),
  async execute(interaction) {
    return interaction.reply({
      content: `Voilà les guides que j'ai à ma disposition :
➡️ ${hyperlink(
        'Guide de survie du Jammer',
        hideLinkEmbed(
          'https://docs.google.com/document/d/16qKkw3lNPnx7FlVRvOLUzJwy-ayaCZC4gSOS2PUk6fk'
        )
      )}
➡️ ${hyperlink(
        "Guide de survie de l'indé au Stunfest",
        hideLinkEmbed(
          'https://docs.google.com/document/d/15qN79Ns9Oa0KycDchI9Zv1NzyN5Ih62q11dULBSl1OU'
        )
      )}
Tu as une idée à rajouter, à modifier, un nouveau guide ? Hésite pas à prévenir le Staff !
      `,
    });
  },
};
