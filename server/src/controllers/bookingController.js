// server/src/controllers/bookingController.js
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { Op } = require('sequelize');

// 1. Create a New Booking
exports.createBooking = async (req, res) => {
    try {
        // 1. Get new fields from request body
        const { guestName, guestPhone, guestEmail, guestCount, roomId, checkInDate, checkOutDate } = req.body;
        const hotelId = req.user.hotelId;

        // Check if Room Exists
        const room = await Room.findOne({ where: { id: roomId, hotelId } });
        if (!room) return res.status(404).json({ message: 'Room not found' });

        // Calculate Total Price (Days * Price)
        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const totalAmount = diffDays * room.price;

        // Save Booking
        const newBooking = await Booking.create({
            guestName,
            guestPhone,
            checkInDate,
            checkOutDate,
            totalAmount,
            roomId,
            hotelId,
            guestEmail, // <--- Add this
            guestCount // <--- Add this
        });

        // Update Room Status to OCCUPIED (Optional, usually we depend on dates)
        await room.update({ status: 'OCCUPIED' });

        res.json(newBooking);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. Get All Bookings
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({ 
            where: { hotelId: req.user.hotelId },
            include: [{ model: Room, attributes: ['roomNumber'] }] // Join with Room table
        });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// 3. NEW: Update Booking Status (Check-in / Check-out)
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g., 'CHECKED_IN' or 'CHECKED_OUT'

        const booking = await Booking.findOne({ 
            where: { id, hotelId: req.user.hotelId } 
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await booking.update({ status });
        
        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};