const mongoose = require('mongoose');

/**
 * Destination Schema
 * Represents tourist destinations that tours can reference.
 * We seed an initial set of default destinations via a script (to be added separately).
 */
const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    longDescription: {
      type: String,
    },
    location: {
      type: String, // e.g. governorate or city region
      required: true,
    },
    bestTime: {
      type: String, // e.g. "Mars à Juin, Septembre à Novembre"
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model('Destination', destinationSchema);
