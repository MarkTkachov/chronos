const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  profilePicture: {
    type: String,
    default: ''
  },

  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,

  refreshTokens: [{
    token: String,
    expiresAt: Date // 1 month
  }],

  hiddenCalendars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'calendars'
  }],

  // createdAt: {
  //   type: Date,
  //   default: Date.now
  // },

  // updatedAt: {
  //   type: Date,
  //   default: Date.now
  // }
});

// userSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

const User = mongoose.model('users', userSchema);

module.exports = User;