const { SlashCommandBuilder, blockQuote } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord-api-types/v9');
const { OAuth2 } = require('fetch-mw-oauth2');

global.fetch = require('node-fetch');
global.Request = require('node-fetch').Request;

const oauth2 = new OAuth2({
  grantType: 'client_credentials',
  clientId: process.env.HELLOASSO_CLIENT_ID,
  clientSecret: process.env.HELLOASSO_CLIENT_SECRET,
  tokenEndpoint: 'https://api.helloasso.com/oauth2/token',
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adherents')
    .setDescription('Donne la liste des adhésions en cours.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const lastYearDate = new Date(new Date() - 1000 * 60 * 60 * 24 * 365);
    const response = await oauth2.fetch(
      `https://api.helloasso.com/v5/organizations/indie-collective/forms/Membership/adhesion-indie-collective/items?from=${lastYearDate.toJSON()}&tierTypes=Membership&itemStates=Processed&itemStates=Registered&withDetails=true&retrieveAll=true&sortOrder=Asc`
    );

    const users = (await response.json()).data.map((item) => {
      let discord;

      if (item.customFields) {
        const discordField = item.customFields.find((f) =>
          f.name.includes('Discord')
        );

        if (discordField?.answer) {
          discord = discordField.answer.replace(/ /g, '').trim();
        }
      }

      return {
        registered: new Date(item.order.date),
        name: `${item.user.firstName} ${item.user.lastName.toUpperCase()}`,
        email: item.payer.email,
        discord,
      };
    });

    return await interaction.reply({
      content: `Voici la liste de mes fans (${users.length}) : [Voir la liste complète](https://admin.helloasso.com/indie-collective/statistiques)`,
      embeds: [
        {
          description: users
            .slice(-30)
            .map(
              ({ registered, name, email, discord }) =>
                `- ${registered.toLocaleDateString('fr-FR', {
                  year: '2-digit',
                  month: 'numeric',
                  day: 'numeric',
                })} ${name} <${email}>${discord ? ' @' + discord : ''}`
            )
            .join('\n'),
        },
      ],
      ephemeral: true,
    });
  },
};
