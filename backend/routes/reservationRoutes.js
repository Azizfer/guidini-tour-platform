const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Routes for guide reservations
router.get('/guides/:guideId/reservations', reservationController.getGuideReservations);
router.post('/guides/:guideId/reservations', reservationController.createReservation);

// Routes for tourist reservations
router.get('/tourist/reservations', reservationController.getTouristReservations);

// Participation check must be before :reservationId route to avoid CastError
router.get('/reservations/check-participation', reservationController.checkParticipation);

// Routes for specific reservations
router.get('/reservations/:reservationId', reservationController.getReservationById);
router.patch('/reservations/:reservationId/status', reservationController.updateReservationStatus);

module.exports = router;
