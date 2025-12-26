const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        const email = 'admin@test.com';
        const password = 'password123';

        // Check if exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists. Updating role to admin...');
            user.role = 'admin';
            user.password = await bcrypt.hash(password, 10); // Reset password to be sure
            await user.save();
            console.log('User updated.');
        } else {
            user = new User({
                name: 'Admin User',
                email,
                password: await bcrypt.hash(password, 10),
                role: 'admin',
                gender: 'male'
            });
            await user.save();
            console.log('Admin user created.');
        }

        console.log(`\nEmail: ${email}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createAdmin();
