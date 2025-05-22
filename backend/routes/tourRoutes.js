//Router les requêtes HTTP vers les bonnes fonctions du contrôleur

const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const auth = require('../middleware/auth'); // Middleware d'authentification pour proteger certaines routes qui necessitent une connexion

// Routes publiques
router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTourById);

// Routes protégées (nécessitant une authentification)
router.get('/guide/:guideId', auth, tourController.getToursByGuide);
router.post('/', auth, tourController.createTour);
router.put('/:id', auth, tourController.updateTour);
router.delete('/:id', auth, tourController.deleteTour);
router.patch('/:id/toggle-visibility', auth, tourController.toggleTourVisibility);

module.exports = router;