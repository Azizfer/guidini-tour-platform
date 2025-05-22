const mongoose = require('mongoose');
const BaseUser = require('./BaseUser');

// Guide-specific schema
const guideSchema = new mongoose.Schema({
  // Documents d'identification et certification
  idCard: String,
  certificate: String,
  documents: [String],
  
  // Informations professionnelles
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  // Gouvernorats couverts par le guide
  coveredGovernorates: {
    type: [String],
    default: []
  },
  // Domaines d'expertise du guide
  expertise: {
    type: [String],
    default: []
  },
  // Site web ou profil professionnel
  website: {
    type: String,
    default: ''
  },
  // Localisation principale du guide
  location: {
    type: String,
    default: ''
  },
  // Tarifs du guide
  rates: {
    hourly: {
      type: Number,
      default: 0
    },
    daily: {
      type: Number,
      default: 0
    }
  },
  // Disponibilité du guide
  availability: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  // Tours proposés par le guide
  tours: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour'
  }],
  // Avis reçus par le guide
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  // Statistiques du guide
  stats: {
    totalBookings: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    completedTours: {
      type: Number,
      default: 0
    }
  },
  // Statut de vérification du guide
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
});

// Create the Guide model as a discriminator of BaseUser
const Guide = BaseUser.discriminator('guide', guideSchema);

module.exports = Guide;
