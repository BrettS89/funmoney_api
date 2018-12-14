const jwt = require('jsonwebtoken');
const keys = require('../config');

exports.verifyToken = (req) => {
  const receivedToken = req.header('authorization');
  if(!receivedToken) {
    throw { error: 'Unauthorized1', status: 401 }; 
  }
  const decodedUser = jwt.decode(receivedToken);
  if(decodedUser === null) {
    throw { error: 'Unauthorized3', status: 401 };
  }
  const token = jwt.sign({ user: decodedUser.user }, keys.secret);
  return { user: decodedUser.user, token };
};
