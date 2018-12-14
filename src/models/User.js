const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  access_token: { type: String },
  item_id: { type: String },
  weeklyBudget: { type: Number },
});

module.exports = mongoose.model('User', userSchema);
