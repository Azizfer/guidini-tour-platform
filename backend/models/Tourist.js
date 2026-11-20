const mongoose = require('mongoose');
const BaseUser = require('./BaseUser');

// Tourist-specific schema
const touristSchema = new mongoose.Schema({
  // Champs spécifiques aux touristes
  travelPurpose: {
    type: [String],
    default: []
  },
  travelCompanions: {
    type: [String],
    default: []
  },
  budget: {
    type: [String],
    default: []
  },
  // Préférences de voyage
  preferences: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Preference'
  },
  // Historique des réservations
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  // Avis laissés par le touriste
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
});

// Retrieve existing discriminator if already compiled to avoid overwrite errors
let Tourist;
if (BaseUser.discriminators && BaseUser.discriminators.tourist) {
  Tourist = BaseUser.discriminators.tourist;
} else {
  Tourist = BaseUser.discriminator('tourist', touristSchema);
}

module.exports = Tourist;
