// server/src/models/Room.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Room = db.define('Room', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    roomNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING, // e.g., "Single", "Double", "Suite"
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'),
        defaultValue: 'AVAILABLE'
    },
    hotelId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

module.exports = Room;