const express = require('express');
const router = express.Router();
const transactions = require('../controllers/transactions');

router.post('/createitem', transactions.createItem);

router.get('/gettransactions', transactions.getTransactions);

module.exports = router;