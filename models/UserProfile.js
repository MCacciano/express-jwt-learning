const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  title: {
    type: String,
    required: true
  },
  location: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  bio: String,
  discordUsername: String,
  phoneNumber: String,
  skills: {
    type: [String],
    required: true
  },
  social: {
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    }
  }
});

module.exports = UserProfile = mongoose.model(
  'user_profile',
  UserProfileSchema
);
