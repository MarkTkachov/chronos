const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  type: {
    type: String,
    required: true,
    enum: ['imported', 'local'],
    default: 'local'
  },

  isDefault: {
    type: Boolean,
    default: false
  },

  url: {
    type: String,
    default: ''
  },

  color: String,

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },

  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'events',
    default: null
  }],
  
  participants: [{
    emailParticipant: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      default: null
    },
    accepted: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer'
    }
  }]

  // createdAt: {
  //   type: Date,
  //   default: Date.now
  // },
  
  // updatedAt: {
  //   type: Date,
  //   default: Date.now
  // },

  // lastEditedBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'users'
  // }
});

// calendarSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

const Calendar = mongoose.model('calendars', calendarSchema);

module.exports = Calendar;