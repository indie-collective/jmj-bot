const express = require('express');

const wss = require('../ws');
const helloasso = require('../helloasso');

const router = express.Router();

router.post('/helloasso', (req, res) => {
  const { data, eventType } = req.body;

  if (eventType === 'Order') {
    const { payer, items } = data;

    const membership = items.find((item) => item.type === 'Membership');
    const donation = items.find((item) => item.type === 'Donation');

    if (membership) {
      // membership + maybe donation
      // push data to discord
      helloasso.emit('membership', data);

      // push data to OBS alerts
      wss.sendMessage({
        type: 'helloasso',
        data: {
          type: 'membership',
          name: payer.firstName,
          donation: donation ? donation.amount / 100 : undefined,
          comment: membership.customFields.find((f) =>
            f.name.includes('Remarques')
          )?.answer,
        },
      });
    } else if (donation) {
      // only donation
      // push data to discord
      helloasso.emit('donation', data);

      // push data to OBS alerts
      wss.sendMessage({
        type: 'helloasso',
        data: {
          type: 'donation',
          name: payer.firstName,
          donation: donation.amount / 100,
        },
      });
    }
  } else if (eventType === 'Payment') {
    const { payer, items } = data;

    const membership = items.find((item) => item.type === 'Membership');
    const donation = items.find((item) => item.type === 'Donation');

    // emit event for discord & co and push data to frontend via websocket
    if (membership) {
      helloasso.emit('membership', data);

      wss.sendMessage({
        type: 'helloasso',
        data: {
          type: 'membership',
          name: payer.firstName,
          donation: donation ? donation.amount / 100 : undefined,
        },
      });
    } else if (donation) {
      helloasso.emit('donation', data);

      wss.sendMessage({
        type: 'helloasso',
        data: {
          type: 'donation',
          name: payer.firstName,
          donation: donation.amount / 100,
        },
      });
    }
  } else if (eventType === 'MembershipExpired') {
    helloasso.emit('membership.expired', data);
  }

  res.sendStatus(204);
});

module.exports = router;
