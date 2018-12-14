const mongoose = require('mongoose');

const dateSchema = new mongoose.Schema({
  date: { type: Number },
});

module.exports = mongoose.model('Date', dateSchema);
