const Transaction = require('../models/Transaction');
const User = require('../models/User');
const SetDate = require('../models/Date');
const keys = require('../config');
const util = require('../services/utilities');
const plaid = require('../services/plaid');
const authService = require('../services/auth');

exports.createItem = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const data = await plaid.client.exchangePublicToken(req.body.token);
    let foundUser = await User.findById(user.user._id);
    foundUser.access_token = data.access_token;
    foundUser.item_id = data.item_id;
    await foundUser.save();
    res.status(200).json({ status: 'success' });
  }

  catch(e) {
    console.log(e);
    res.status(500).json({ error: 'An error occured' });
  }
};

exports.updateExpenses = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const foundUser = await User.findById(user.user._id);
    const currentDate = util.stringifyISODate(util.currentISODate());
    const preStartDate = await SetDate.findById(keys.date);
    const startDate = util.stringifyISODate(preStartDate.date);
    //Get transactions between current date and Date from Plaid API
    const myTransactions = await plaid.client.getTransactions(foundUser.access_token, startDate, currentDate);
    console.log(myTransactions);
    const accountTransactions = [];
    
    const transactions = await Transaction.find({ date: { $gte: startDate.date } });
    const transaction_ids = transactions.map(transaction => {
      return transaction.transaction_id;
    });
    
    accountTransactions.forEach(async transaction => {
      if(transaction_ids.indexOf(transaction.transaction_id) === 1 && transaction.pending === true) {

        const newTransaction = new Transaction({
          transaction_id: transaction.transaction_id,
          account_id: transaction.account_id,
          name: transaction.name,
          //fix date to right number format
          date: transaction.date,
          amount: transaction.amount,
        });

        try {
          await newTransaction.save();
        } catch(e) {
          console.log('transaction updates error', e);
        }

      }
    });
  } catch(e) {
    console.log(e);
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const foundUser = await User.findById(user.user._id);
    const currentDate = util.stringifyISODate(util.currentISODate());
    const preStartDate = await SetDate.findById(keys.date);
    const startDate = util.stringifyISODate(preStartDate.date);
    const savedTransactions = await Transaction.find({ user: foundUser._id })
      .where('date').gte(preStartDate.date)
      .exec();

    const existingTransactionIds = savedTransactions.map(t => {
      return t.transaction_id;
    });

    const myTransactions = await plaid.client.getTransactions(foundUser.access_token, startDate, currentDate);
    
    await myTransactions.transactions.forEach(async t => {
      if(!t.pending && existingTransactionIds.indexOf(t.transaction_id) === -1) {
        const newTransaction = new Transaction({
          user: user.user._id,
          transaction_id: t.transaction_id,
          account_id: t.account_id,
          name: foundUser.fullName,
          amount: t.amount,
          date: util.currentISODate(),
          pending: t.pending,
        });
        await newTransaction.save();
      }
    });

    setTimeout(async () => {
      const updatedTransactions = await Transaction.find({ user: foundUser._id });
      console.log(updatedTransactions);
      res.status(200).json(updatedTransactions);
    }, 600);
    
  }
  catch(e) {
    console.log(e);
    res.status(500).json(e);
  }
    

};
