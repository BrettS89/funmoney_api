const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('You hit the fun money api');
});

module.exports = router;
