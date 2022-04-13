const express = require('express');

const wss = require('../ws');
const helloasso = require('../helloasso');

const router = express.Router();

router.post('/helloasso', (req, res) => {
  const { data, eventType } = req.body;

  if (eventType === 'Payment') {
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
          donation: donation?.total,
        },
      });
    } else if (donation) {
      helloasso.emit('donation', data);

      wss.sendMessage({
        type: 'helloasso',
        data: {
          type: 'donation',
          name: payer.firstName,
          donation: donation.total,
        },
      });
    }
  }

  res.sendStatus(204);
});

module.exports = router;
