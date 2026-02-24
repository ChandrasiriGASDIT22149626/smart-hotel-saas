const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const { Op } = require('sequelize');

// 1. REGISTER: Creates Hotel and Links Owner
exports.register = async (req, res) => {
    try {
        const { ownerName, email, phone, password, hotelName } = req.body;
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const newHotel = await Hotel.create({
            name: hotelName || `${ownerName}'s Hotel`,
            ownerPhone: phone
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name: ownerName,
            email,
            password: hashedPassword,
            role: 'OWNER',
            phone,
            status: 'Active',
            hotelId: newHotel.id 
        });

        res.status(201).json({ message: 'Registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 2. LOGIN: Injects hotelId into the token
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || user.status !== 'Active') {
            return res.status(403).json({ message: 'Login failed or Account Inactive.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const token = jwt.sign(
            { id: user.id, role: user.role, hotelId: user.hotelId }, 
            process.env.JWT_SECRET || 'secret123', 
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. CREATE STAFF
exports.createStaff = async (req, res) => {
    try {
        const { name, email, password, role, phone, status } = req.body;
        const hotelId = req.user.hotelId; 

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, email, password: hashedPassword,
            role: role || 'RECEPTIONIST',
            phone: phone || '',
            status: status || 'Active', 
            hotelId 
        });

        res.json({ message: 'Staff created', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 4. GET ALL STAFF
exports.getAllStaff = async (req, res) => {
    try {
        const staffMembers = await User.findAll({ 
            where: { hotelId: req.user.hotelId, role: { [Op.ne]: 'OWNER' } },
            attributes: { exclude: ['password'] } 
        });
        res.json(staffMembers);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// 5. UPDATE STAFF
exports.updateStaff = async (req, res) => {
    try {
        const { name, email, role, phone, status } = req.body;
        let user = await User.findOne({ where: { id: req.params.id, hotelId: req.user.hotelId } });
        
        if (!user) return res.status(404).json({ msg: 'Staff not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (phone) user.phone = phone;
        if (status) user.status = status;

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// 6. DELETE STAFF
exports.deleteStaff = async (req, res) => {
    try {
        const result = await User.destroy({ where: { id: req.params.id, hotelId: req.user.hotelId } });
        if (!result) return res.status(404).json({ msg: 'Staff not found' });
        res.json({ msg: 'Staff member removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
exports.createStaff = async (req, res) => {
    try {
        const { name, email, password, phone, role, status } = req.body;
        const hotelId = req.user.hotelId; // Ensure your auth middleware is working

        // Default permissions matching your Team.jsx configuration
        const rolePermissions = {
            'Manager': { bookings: true, rooms: true, billing: true, delete: true, guests: true },
            'Receptionist': { bookings: true, rooms: true, billing: false, delete: false, guests: true },
            'Housekeeping': { bookings: false, rooms: true, billing: false, delete: false, guests: false },
            'Security': { bookings: false, rooms: false, billing: false, delete: false, guests: true }
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            status: status || 'Active',
            hotelId,
            permissions: rolePermissions[role] || {} // Initialize the JSON column
        });

        res.status(201).json({ message: '✅ Staff Account Created!' });
    } catch (error) {
        console.error("Staff Creation Error:", error);
        res.status(500).json({ message: 'Server Error: Check if "permissions" column exists in DB.' });
    }
};