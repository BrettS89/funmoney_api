const User = require('../models/User');
const Datee = require('../models/Date');
const Transaction = require('../models/Transaction');
const util = require('./utilities');
const plaid = require('./plaid');
const keys = require('../config');

exports.updateTransactions = async () => {
  try {
    const users = await User.find();
    const preStartDate = await Datee.findById(keys.date);
    console.log(preStartDate);

    users.forEach(async user => {
      const foundUser = await User.findById(user._id);
      const currentDate = util.stringifyISODate(util.currentISODate());
      const startDate = util.stringifyISODate(preStartDate.date);
      const savedTransactions = await Transaction.find({ user: foundUser._id })
        .where('date').gte(preStartDate.date)
        .exec();

      const existingTransactionIds = savedTransactions.map(t => {
        return t.transaction_id;
      });

      const myTransactions = await plaid.client.getTransactions(foundUser.access_token, startDate, currentDate);

      await myTransactions.transactions.forEach(async t => {
        if(t.pending && existingTransactionIds.indexOf(t.transaction_id) === -1) {
          const newTransaction = new Transaction({
            user: user._id,
            transaction_id: t.transaction_id,
            account_id: t.account_id,
            name: t.name,
            category: t.category ? t.category[1] ? t.category[1] : t.category[0] : 'Unspecified',
            amount: t.amount,
            date: util.currentISODate(),
            pending: t.pending,
          });
          await newTransaction.save();
        }
      });
    });
    console.log('executed');
  }

  catch(e) {
    console.log(e);
  }
};
