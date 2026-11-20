const express = require('express');
const router = express.Router();
const memoryController = require('../controllers/memoryController');
const authMiddleware = require('../middleware/auth');

// POST /api/memories
router.post('/', authMiddleware, memoryController.createMemory);

// GET /api/memories/guide/:guideId
router.get('/guide/:guideId', memoryController.getMemoriesByGuide);

module.exports = router;
