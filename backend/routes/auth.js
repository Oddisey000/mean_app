const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Auth = require('../models/auth');

const router = express.Router();

router.post('/signup', (req, res, next) => {
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
          error: error
        });
      });
    }
  );
});

router.post('/login', (req, res, next) => {
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
      'secretPrivateKey',
      { expiresIn: '1h'}
    );
    
    res.status(200).json({
      token: token,
      expiresIn: 3600
    });

  }).catch(error => {
    return res.status(401).json({
      message: 'Authentication failed'
    });
  });
});

module.exports = router;