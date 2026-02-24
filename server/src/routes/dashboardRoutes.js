// server/src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/authMiddleware');

router.get('/stats', auth, dashboardController.getStats);

module.exports = router;