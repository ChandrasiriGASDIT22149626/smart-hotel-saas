// server/src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middlewares/authMiddleware');

// All routes are protected
router.post('/', auth, bookingController.createBooking);
router.get('/', auth, bookingController.getBookings);
router.put('/:id', auth, bookingController.updateStatus);

module.exports = router;