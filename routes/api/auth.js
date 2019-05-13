const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

const auth = require('../../middleware/auth');

const User = require('../../models/User');

// @route GET api/auth
// @desc test route
// @access public
router.get('/', auth, async (req, res) => {
  // get user and omit password
  const user = await User.findById(req.user.id)
    .select('-password')
    .catch(err => {
      console.error(err.message);
      res.status(500).send('Server error');
    });

  res.json(user);
});

// @route POST api/auth/login
// @desc login user
// @access public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // check for user existence
    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      // return jwt
      const payload = {
        user: {
          id: user.id
        }
      };

      // TODO: change expiration before production
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 360000
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
