const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Debugging check to verify controller loaded correctly
if (!authController || !authController.register || !authController.login) {
    console.error("❌ ERROR: Auth Controller not loaded correctly. Check 'server/src/controllers/authController.js' exports.");
    console.log("Loaded Controller:", authController); // Will help debug what is actually loaded
}

// 1. Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);


const auth = require('../middlewares/authMiddleware');
// ...
router.post('/create-staff', auth, authController.createStaff); // 'auth' must be here!
router.get('/staff', auth, authController.getAllStaff);

// 2. Protected Staff Routes

router.put('/staff/:id', authController.updateStaff);
router.delete('/staff/:id', authController.deleteStaff);

module.exports = router;