// For verifying webhooks
const { verifyPaddleWebhook } = require('verify-paddle-webhook');
// Require configuration
const config = require('../config/config');
// We will update users through the users service
const usersService = require('../services/usersService');

module.exports = {
  post: async (req, res) => {
    try {
      if (verifyPaddleWebhook(config.paddle.publicKey, req.body)) {
        if (req.body.alert_name === 'subscription_created') {
          await usersService.updateAppMetaData(
            req.body.passthrough,
            'subscription_id',
            req.body.subscription_id,
            req.managementToken,
          );
          await usersService.updateAppMetaData(
            req.body.passthrough,
            'cancellation_date',
            '9999-12-31 00:00:00',
            req.managementToken,
          );
        }
        if (req.body.alert_name === 'subscription_cancelled') {
          await usersService.updateAppMetaData(
            req.body.passthrough,
            'cancellation_date',
            req.body.cancellation_effective_date,
            req.managementToken,
          );
        }
        res.status(200);
        return res.send();
      }
    } catch (error) {
      res.status(400);
      return res.send();
    }
    res.status(400);
    return res.send();
  },
};
