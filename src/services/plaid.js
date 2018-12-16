const plaid = require('plaid');
const keys = require('../config');

exports.client = new plaid.Client(
  keys.plaidClientId,
  keys.plaidSecret,
  keys.plaidPublicKey,
  plaid.environments.development
);
