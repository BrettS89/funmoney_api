const User = require('../models/User');
const jwt = require('jsonwebtoken');
const keys = require('../config');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  try {
    const user = new User ({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      fullName: `${req.body.firstName} ${req.body.lastName}`,
    });

    const savedUser = await user.save();

    const toSend = {
      _id: savedUser._id,
    };

    const token = jwt.sign({ user: toSend }, keys.secret);

    res.status(200).json({ token });

  } catch(e) {
    console.log(e);
    res.status(500).json({ error: 'An error occured' });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

		if(!user){
			return res.status(401).json({ 
        message: 'Invalid login credentials' 
      });
    }

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(401).json({ error: 'Invalid login credentials' })
    }

    const toSend = {
      _id: user._id,
    };

    const token = jwt.sign({ user: toSend }, keys.secret);

    res.status(200).json({ token });
  }
  catch(e) {
    console.log(e);
    res.status(500).json({ error: 'An error occured' });
  }
};
