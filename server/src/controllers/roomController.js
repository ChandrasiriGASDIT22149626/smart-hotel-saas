const Room = require('../models/Room');

// 1. ADD ROOM (Securely links room to hotel via token)
exports.addRoom = async (req, res) => {
    try {
        const { roomNumber, type, price, amenities, status, floor } = req.body;
        
        // hotelId is extracted from the JWT token via authMiddleware
        const hotelId = req.user.hotelId; 

        if (!hotelId) {
            return res.status(400).json({ message: "Hotel ID not found. Please re-login." });
        }

        // Prevents duplicate room numbers within the same hotel
        const existingRoom = await Room.findOne({ where: { roomNumber, hotelId } });
        if (existingRoom) {
            return res.status(400).json({ message: "Room number already exists" });
        }

        const newRoom = await Room.create({
            roomNumber,
            type,
            price,
            amenities, // Sequelize handles this as a JSON object if defined in the model
            status: status || 'AVAILABLE',
            floor: floor || '1st Floor',
            hotelId 
        });

        res.json(newRoom);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. GET ALL ROOMS (Multi-tenant filtering)
exports.getRooms = async (req, res) => {
    try {
        const hotelId = req.user.hotelId;
        const rooms = await Room.findAll({ where: { hotelId } });
        res.json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. UPDATE ROOM (Restricted to user's hotel)
exports.updateRoom = async (req, res) => {
    try {
        const { roomNumber, type, price, status, amenities, floor } = req.body;
        const room = await Room.findOne({ where: { id: req.params.id, hotelId: req.user.hotelId } });

        if (!room) return res.status(404).json({ message: "Room not found" });

        room.roomNumber = roomNumber || room.roomNumber;
        room.type = type || room.type;
        room.price = price || room.price;
        room.status = status || room.status;
        room.amenities = amenities || room.amenities;
        room.floor = floor || room.floor;

        await room.save();
        res.json(room);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 4. DELETE ROOM (Restricted to user's hotel)
exports.deleteRoom = async (req, res) => {
    try {
        const result = await Room.destroy({ where: { id: req.params.id, hotelId: req.user.hotelId } });
        if (!result) return res.status(404).json({ message: "Room not found" });
        res.json({ message: "Room deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};