const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Auth = require('../models/auth');

exports.createUser = (req, res, next) => {
  // Encrypt user's password
  bcrypt.hash(req.body.password, 10).then(hash => {
      const auth = new Auth({
        email: req.body.email,
        password: hash
      });
      auth.save().then(result => {
        res.status(201).json({
          message: 'User created succesfully',
          result: result
        });
      }).catch(error => {
        res.status(500).json({
          message: 'Invalid authentication credentials!'
        });
      });
    }
  );
}

exports.userLogin = (req, res, next) => {
  let fetchUser;

  Auth.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      return res.status(401).json({
        message: 'Authentication failed'
      });
    }

    fetchUser = user;
    return bcrypt.compare(req.body.password, user.password);

  }).then(result => {
    if (!result) {
      return res.status(401).json({
        message: 'Authentication failed'
      });
    }

    const token = jwt.sign(
      { email: fetchUser.email, userId: fetchUser._id},
      process.env.JWT_KEY,
      { expiresIn: '1h'}
    );
    
    res.status(200).json({
      token: token,
      expiresIn: 3600,
      userID: fetchUser._id
    });

  }).catch(error => {
    return res.status(401).json({
      message: 'Invalid authentication credentials!'
    });
  });
}