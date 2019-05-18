const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');
const UserProfile = require('../../models/UserProfile');

// @route  POST api/profile
// @desc   create/update user profile
// @access private
router.post(
  '/',
  [
    auth,
    [
      check(
        'title',
        'A title such as Front End Developer or Student is required.'
      )
        .not()
        .isEmpty(),
      check(
        'skills',
        'At least one skill is required. Skills are comma separated values.'
      )
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // build the profile fields
    const profileFields = {};

    profileFields.user = req.user.id;

    profileFields.social = {};

    // build social object
    Object.keys(req.body).forEach(key => {
      if (req.body[key]) {
        switch (key) {
          case 'skills':
            profileFields[key] = req.body[key]
              .split(',')
              .map(skill => skill.trim());
            break;
          case 'youtube':
          case 'facebook':
          case 'twitter':
          case 'instagram':
          case 'linkedin':
            profileFields.social[key] = req.body[key];
            break;
          default:
            profileFields[key] = req.body[key];
        }
      }
    });

    try {
      let profile = await UserProfile.findOne({ user: req.user.id });

      // if user exists update profile
      if (profile) {
        profile = await UserProfile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      profile = new UserProfile(profileFields);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route  GET api/profile
// @desc   get all profiles
// @access public
router.get('/', async (req, res) => {
  try {
    const profiles = await UserProfile.find().populate('user', [
      'name',
      'avatar'
    ]);

    return res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route  GET api/profile/user/:userId
// @desc   get profile by userId
// @access public
router.get('/user/:userId', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({
      user: req.params.userId
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'Sorry no profile was found' });
    }

    res.json(profile);

    return res.json(profiles);
  } catch (err) {
    console.error(err.message);

    if ((err.kind = 'ObjectId')) {
      return res.status(400).json({ msg: 'Sorry no profile found' });
    }

    res.status(500).send('Server error');
  }
});

// @route  DELETE api/profile
// @desc   delete profile and user
// @access public
router.delete('/', auth, async (req, res) => {
  try {
    // delete profile
    await UserProfile.findOneAndRemove({ user: req.user.is });
    // delete user
    await User.findOneAndRemove({ _id: req.user.id });

    return res.json({ msg: 'User and Profile have been deleted' });
  } catch (err) {
    console.error(err.message);

    return res.status(500).send('server error');
  }
});

// @route  PUT api/profile/skills
// @desc   add or update user skills in profile
// @access private
router.put('/skills', async (req, res) => {
  try {
    // delete profile
    await UserProfile.findOneAndRemove({ user: req.user.is });
    // delete user
    await User.findOneAndRemove({ _id: req.user.id });

    return res.json({ msg: 'User and Profile have been deleted' });
  } catch (err) {
    console.error(err.message);

    return res.status(500).send('server error');
  }
});

module.exports = router;
