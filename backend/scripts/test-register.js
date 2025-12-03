const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

const testRegister = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');

        const testUser = {
            name: 'Test Register',
            email: 'test+user@example.com',
            password: 'password123',
            role: 'student'
        };

        console.log('Attempting to create user:', testUser);

        const user = await User.create(testUser);
        console.log('User created successfully:', user);

        // Verify password hashing
        console.log('Hashed password:', user.password);

        await mongoose.disconnect();
        console.log('Disconnected');
    } catch (error) {
        console.error('Registration Error:', error);
        process.exit(1);
    }
};

testRegister();
