const User = require('../../models/User');
const mongoose = require('mongoose');

async function getOrganizerEmailById(creatorId) {
  try {
    const creatorObjectId = new mongoose.Types.ObjectId(creatorId);
    const user = await User.findById(creatorObjectId).exec();
    if (!user) console.error('Organizer not found');
    return user.email;
  } catch (error) {
    console.error('Error getting organizer email:', error);
  }
}

module.exports = getOrganizerEmailById;
