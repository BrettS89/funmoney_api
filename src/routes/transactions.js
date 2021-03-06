const express = require('express');
const router = express.Router();
const transactions = require('../controllers/transactions');

router.post('/createitem', transactions.createItem);

router.post('/setbudget', transactions.setBudget);

router.get('/gettransactions', transactions.getTransactions);

module.exports = router;
