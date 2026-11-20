// Routes for destinations
const express = require('express');
const router = express.Router();
const controller = require('../controllers/destinationController');

router.get('/', controller.getAllDestinations);
router.get('/:id', controller.getDestinationById);

module.exports = router;
