const mongoose = require('mongoose');
const User = require('./backend/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', 'config.env') });

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const admin = await User.findOne({ email: 'admin@nexora.com' }).select('+password');
        if (!admin) {
            console.log('Admin user not found!');
        } else {
            console.log('Admin user found:');
            console.log('ID:', admin._id);
            console.log('Email:', admin.email);
            console.log('Role:', admin.role);
            console.log('isApproved:', admin.isApproved);
            console.log('isActive:', admin.isActive);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAdmin();
