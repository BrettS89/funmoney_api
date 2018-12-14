const jwt = require('jsonwebtoken');
const keys = require('../config');

exports.verifyToken = (req) => {
  const receivedToken = req.header('authorization');
  console.log('token', receivedToken);
  if(!receivedToken) {
    throw { error: 'Unauthorized1', status: 401 }; 
  }
  const decodedUser = jwt.decode(receivedToken);
  console.log('decoded', decodedUser);
  if(decodedUser === null) {
    throw { error: 'Unauthorized3', status: 401 };
  }
  const token = jwt.sign({ user: decodedUser.user }, keys.secret);
  console.log('before');
  return { user: decodedUser.user, token };
};
