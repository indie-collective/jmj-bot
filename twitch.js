const TES = require('tesjs');

const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_WEBHOOK_SECRET } =
  process.env;

const callbackBaseURL = 'https://jmj.indieco.xyz';

function createTwitchESClient(eventsToSubscribeTo, app) {
  const tes = new TES({
    identity: {
      id: TWITCH_CLIENT_ID,
      secret: TWITCH_CLIENT_SECRET,
    },
    listener: {
      type: 'webhook',
      baseURL: callbackBaseURL,
      secret: TWITCH_WEBHOOK_SECRET,
      server: app,
    },
    // options: {
    //   debug: true,
    // },
  });

  // checking subscriptions already exists
  tes.getSubscriptions().then(({ data }) => {
    // unsubscribing all failed subs
    data.forEach(async (sub) => {
      if (sub.status !== 'enabled') {
        await tes.unsubscribe(sub.id);
      }
    });

    // ignoring existing subs or resubscribing
    eventsToSubscribeTo.forEach(async (event) => {
      const existingSub = data.find(
        (sub) =>
          sub.type === event.type &&
          sub.status === 'enabled' &&
          sub.condition.broadcaster_user_id ===
            event.condition.broadcaster_user_id
      );

      // already existing and good
      if (
        existingSub &&
        existingSub.transport.callback.includes(callbackBaseURL)
      ) {
        console.log(
          `Active subscription ${existingSub.type} with condition:`,
          existingSub.condition
        );

        return;
      }

      try {
        // already existing and callback changed
        if (
          existingSub &&
          !existingSub.transport.callback.includes(callbackBaseURL)
        ) {
          await tes.unsubscribe(existingSub.id);

          console.log('Unsubscribed an old sub.');
        }

        // resub
        console.log(`Resubscribing to ${event.type}`);

        await tes.subscribe(event.type, event.condition, event.version);

        console.log(
          `Subscription successful to ${event.type} with condition:`,
          event.condition
        );
      } catch (err) {
        console.log(event.type, err);
      }
    });
  });

  return tes;
}

module.exports = { createTwitchESClient };
