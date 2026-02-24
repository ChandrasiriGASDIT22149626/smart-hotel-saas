// server/src/routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middlewares/authMiddleware'); // Import the Guard

// Protect these routes with 'auth'
router.post('/', auth, roomController.addRoom);   // Add Room
router.get('/', auth, roomController.getRooms);   // Get List
router.put('/:id', auth, roomController.updateRoom);
router.delete('/:id', auth, roomController.deleteRoom); // Delete

module.exports = router;