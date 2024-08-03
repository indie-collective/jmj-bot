/**
 * This script should be set to run every day.
 * It compares yesterday's members list with today's.
 *
 * You can add this line in the crontab:
 * 0 7 * * * node /path/to/jmj-bot/notifyExpiredMemberships.js 2>&1 | systemd-cat -t expiredmembers -p info
 */
require('dotenv').config();
const { OAuth2 } = require('fetch-mw-oauth2');

global.fetch = require('node-fetch');
global.Request = require('node-fetch').Request;

const helloasso = require('./helloasso');

const oauth2 = new OAuth2({
  grantType: 'client_credentials',
  clientId: process.env.HELLOASSO_CLIENT_ID,
  clientSecret: process.env.HELLOASSO_CLIENT_SECRET,
  tokenEndpoint: 'https://api.helloasso.com/oauth2/token',
});

const getExpiredMembers = async () => {
  const lastYearDateYesterday = new Date(
    new Date() - 1000 * 60 * 60 * 24 * (365 + 1)
  );

  const response = await oauth2.fetch(
    `https://api.helloasso.com/v5/organizations/indie-collective/forms/Membership/adhesion-indie-collective/items?from=${lastYearDateYesterday.toJSON()}&tierTypes=Membership&itemStates=Processed&itemStates=Registered&withDetails=true&retrieveAll=true`
  );

  const lastYearDate = new Date(new Date() - 1000 * 60 * 60 * 24 * 365);

  const response2 = await oauth2.fetch(
    `https://api.helloasso.com/v5/organizations/indie-collective/forms/Membership/adhesion-indie-collective/items?from=${lastYearDate.toJSON()}&tierTypes=Membership&itemStates=Processed&itemStates=Registered&withDetails=true&retrieveAll=true`
  );

  const yesterdayItems = (await response.json()).data;
  const todayItems = (await response2.json()).data;

  const justExpiredItems = yesterdayItems.filter(
    (item) => !todayItems.find((m) => m.id === item.id)
  );

  return justExpiredItems.map((item) => {
    let discord = [];

    if (item.customFields) {
      const discordField = item.customFields.find((f) =>
        f.name.includes('Discord')
      );

      if (discordField?.answer) {
        discord = discordField.answer.replace(/ /g, '');
      }
    }

    return {
      payer: item.payer,
      user: item.user,
      discord,
    };
  });
};

console.log("Vérifions si des membres n'ont plus d'adhésions.");

getExpiredMembers()
  .then((expired) => {
    console.log('expired memberships', expired);
    expired.map((item) =>
      fetch('https://jmj.indieco.xyz/webhooks/helloasso', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'MembershipExpired',
          data: item,
        }),
      })
    );

    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
