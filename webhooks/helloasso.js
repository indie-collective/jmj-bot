const wss = require('../ws');
const express = require('express');
const router = express.Router();

router.post('/helloasso', (req, res) => {
  console.log('got notification', req.body.data);

  const { data, orderType } = req.body;

  if (orderType === 'Payment') {
    const { payer, items } = data;

    const membership = items.find((item) => item.type === 'Membership');
    const donation = items.find((item) => item.type === 'Donation');

    // push data to frontend via websocket
    if (membership) {
      wss.sendMessage({
        type: 'helloasso',
        data: {
          type: 'membership',
          name: payer.firstName,
          donation: donation.total,
        },
      });
    } else if (donation) {
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
