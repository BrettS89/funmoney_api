const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transaction_id: { type: String, required: true },
  account_id: { type: String, required: true },
  name: { type: String },
  amount: { type: Number },
  date: { type: Number },
  pending: { type: Boolean },
});

module.exports = mongoose.model('Transaction', transactionSchema);
