const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  calendar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'calendars',
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: String,

  url: String,

  allDay: Boolean,
  
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },

  location: String,

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  
  participants: [{
    emailParticipant: { 
      type: String,
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      default: null
    }
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

// eventSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

const Event = mongoose.model('events', eventSchema);

module.exports = Event;