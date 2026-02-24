// server/src/controllers/dashboardController.js
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
    try {
        const hotelId = req.user.hotelId;
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        // 1. Get Today's Check-ins
        const checkIns = await Booking.count({
            where: { 
                hotelId,
                checkInDate: today 
            }
        });

        // 2. Calculate Total Revenue (Sum of all bookings)
        const revenueData = await Booking.sum('totalAmount', {
            where: { hotelId }
        });

        // 3. Calculate Occupancy Rate
        const totalRooms = await Room.count({ where: { hotelId } });
        const occupiedRooms = await Booking.count({
            where: {
                hotelId,
                // Check if today is between check-in and check-out
                checkInDate: { [Op.lte]: today }, 
                checkOutDate: { [Op.gt]: today }
            }
        });

        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        res.json({
            checkIns,
            revenue: revenueData || 0,
            occupancyRate
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};