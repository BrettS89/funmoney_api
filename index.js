const express = require('express');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const keys = require('./src/config');
const app = express();
const appRoutes = require('./src/routes/app');
const authRoutes = require('./src/routes/auth');
const transactionRoutes = require('./src/routes/transactions');
const util = require('./src/services/utilities');
const Dayte = require('./src/models/Date');
const update = require('./src/services/updateTransactions');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useNewUrlParser: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const rule = new schedule.RecurrenceRule();
rule.minute = 44;

let timer = schedule.scheduleJob({hour: 0, minute: 1, dayOfWeek: 1}, async () => {
  try {
    let date = await Dayte.findById(keys.dateId)
    date.date = util.currentISODate();
    await date.save();
  } catch(e) {
    console.log(e);
  }
});

// Timer to update
setInterval(async () => {
  await update.updateTransactions();
}, 600000);

app.use('/transactions', transactionRoutes);
app.use('/auth', authRoutes);
app.use('/', appRoutes);

app.listen(4000, () => {
  console.log('server started on port 4000');
});
