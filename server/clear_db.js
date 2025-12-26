const mongoose = require('mongoose');
require('dotenv').config();
const Session = require('./models/Session');
const Reservation = require('./models/Reservation');

async function clearDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        await Session.deleteMany({});
        console.log('Sessions cleared');

        await Reservation.deleteMany({});
        console.log('Reservations cleared');

        // Users kalsın, admin hesabına ihtiyacımız var.
        console.log('Database cleaned for new schema.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

clearDB();
