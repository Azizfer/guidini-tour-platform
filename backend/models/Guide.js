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
  // Domaines d'expertise du guide (en français: histoire, culture, gastronomie, etc.)
  expertise: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        // Vérifier que les valeurs sont en français
        const validExpertises = ['histoire', 'culture', 'gastronomie', 'nature', 'aventure', 'art', 'architecture', 'religion', 'plage', 'montagne', 'désert', 'sport', 'shopping', 'photographie', 'artisanat'];
        return v.every(item => validExpertises.includes(item.toLowerCase()));
      },
      message: props => `${props.value} n'est pas une expertise valide en français. Utilisez des termes comme: histoire, culture, gastronomie, etc.`
    }
  },
  // Localisation principale du guide
  location: {
    type: String,
    default: ''
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

  // Statut de vérification du guide
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'verified'
  }
});

// Create the Guide model as a discriminator of BaseUser
// Note: 'guide' must match the 'userType' enum value in BaseUser schema
const Guide = BaseUser.discriminator('guide', guideSchema);

// Add any Guide-specific methods here if needed

module.exports = Guide;
