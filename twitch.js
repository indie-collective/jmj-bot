const TES = require('tesjs');

const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_WEBHOOK_SECRET } =
  process.env;

const callbackBaseURL = 'https://jmj.indieco.xyz';

function createTwitchESClient(eventsToSubscribeTo) {
  const tes = new TES({
    identity: {
      id: TWITCH_CLIENT_ID,
      secret: TWITCH_CLIENT_SECRET,
    },
    listener: {
      baseURL: callbackBaseURL,
      secret: TWITCH_WEBHOOK_SECRET,
    },
  });

  // checking subscriptions already exists
  tes.getSubscriptions().then((data) => {
    eventsToSubscribeTo.forEach(async (event) => {
      const existingSub = data.data.find(
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

        await tes.subscribe(event.type, event.condition);

        console.log(
          `Subscription successful to ${event.type} with condition:`,
          event.condition
        );
      } catch (err) {
        console.log(err);
      }
    });
  });

  return tes;
}

module.exports = { createTwitchESClient };
