const Transaction = require('../models/Transaction');
const User = require('../models/User');
const SetDate = require('../models/Date');
const keys = require('../config');
const util = require('../services/utilities');
const plaid = require('../services/plaid');
const authService = require('../services/auth');

// link bank account ////////////////////////////
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

// Set budget ///////////////////////////////////
exports.setBudget = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    let foundUser = await User.findById(user.user._id);
    foundUser.weeklyBudget = req.body.budget;
    await foundUser.save();
    res.status(200).json({ status: 'success' });
  }

  catch(e) {
    console.log(e);
    res.status(500).json(e);
  }
};

// Update and get transactions //////////////////
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
    console.log(existingTransactionIds);

    const myTransactions = await plaid.client.getTransactions(foundUser.access_token, startDate, currentDate);

    await myTransactions.transactions.forEach(async t => {
      console.log(t.name, t.amount, t.pending);
      if(t.pending && existingTransactionIds.indexOf(t.transaction_id) === -1) {
        console.log(t.name);
        const newTransaction = new Transaction({
          user: user.user._id,
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

    setTimeout(async () => {
      const updatedTransactions = await Transaction.find({ user: foundUser._id })
        .where('date').gte(preStartDate.date)
        .exec();

      let total = 0;

      updatedTransactions.forEach(t => {
        total += t.amount;
      });

      const toReturn = {
        budget: foundUser.weeklyBudget,
        spent: total,
        remaining: foundUser.weeklyBudget - total,
      };

      res.status(200).json(toReturn);
    }, 600);
  }

  catch(e) {
    console.log(e);
    res.status(500).json(e);
  }
};
