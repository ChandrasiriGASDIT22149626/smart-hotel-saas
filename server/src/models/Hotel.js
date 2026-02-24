// server/src/models/Hotel.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Hotel = db.define('Hotel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ownerPhone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    subscriptionPlan: {
        type: DataTypes.ENUM('FREE', 'BASIC', 'PREMIUM'),
        defaultValue: 'FREE'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = Hotel;