// This file is now a compatibility layer for existing code
// It re-exports the BaseUser model which has the discriminator pattern

// Import the models
const BaseUser = require('./BaseUser');
const Tourist = require('./Tourist');
const Guide = require('./Guide');

// For backward compatibility, export the base model
module.exports = BaseUser;

// Also export the specialized models as properties
module.exports.Tourist = Tourist;
module.exports.Guide = Guide;
