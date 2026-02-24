const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get token from header
    const token = req.header('x-auth-token');

    // 2. Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // 3. Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        
        // Explicitly attach properties to req.user
        req.user = {
            id: decoded.id,
            role: decoded.role,
            hotelId: decoded.hotelId // This is the critical ID required for saving rooms
        };
        
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};