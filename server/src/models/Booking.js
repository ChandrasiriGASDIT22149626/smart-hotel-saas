// server/src/models/Booking.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Booking = db.define('Booking', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    guestName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    guestPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    guestEmail: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    guestCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    checkInDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    checkOutDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'CONFIRMED' 
    },
    // ✅ ADD THIS FIELD
    hotelId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    // ✅ ADD THIS FIELD (Foreign Key for Room)
    roomId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

module.exports = Booking;