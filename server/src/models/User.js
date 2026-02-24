const { DataTypes } = require('sequelize');
const db = require('../config/db');

const User = db.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'Receptionist', 
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Active',
    },
    // --- NEW: Custom Permissions Column ---
    permissions: {
        type: DataTypes.JSON, // Stores { bookings: true, rooms: false ... }
        allowNull: true       // If null, we fall back to Role defaults
    },
    hotelId: {
        type: DataTypes.UUID,
        allowNull: true
    }
});

module.exports = User;