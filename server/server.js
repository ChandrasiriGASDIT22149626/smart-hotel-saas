require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');

// Import Models
const Hotel = require('./src/models/Hotel');
const User = require('./src/models/User');
const Room = require('./src/models/Room');     
const Booking = require('./src/models/Booking'); 

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // 1. Define Relationships (Crucial for SaaS isolation)
        Hotel.hasMany(User, { foreignKey: 'hotelId' });
        User.belongsTo(Hotel, { foreignKey: 'hotelId' });

        Hotel.hasMany(Room, { foreignKey: 'hotelId' });
        Room.belongsTo(Hotel, { foreignKey: 'hotelId' });

        Hotel.hasMany(Booking, { foreignKey: 'hotelId' });
        Booking.belongsTo(Hotel, { foreignKey: 'hotelId' });
        
        Room.hasMany(Booking, { foreignKey: 'roomId' });
        Booking.belongsTo(Room, { foreignKey: 'roomId' });

        // 2. Connect & Sync
        await db.authenticate();
        console.log('✅ Database connected successfully.');

        // 💡 CHANGE TO { force: true } ONE TIME IF YOU STILL SEE COLUMN ERRORS
        await db.sync({ alter: true }); 
        console.log('✅ Database Synced and Ready!');

        // 3. Start Server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error('❌ Server Startup Error:', err);
    }
};

startServer();