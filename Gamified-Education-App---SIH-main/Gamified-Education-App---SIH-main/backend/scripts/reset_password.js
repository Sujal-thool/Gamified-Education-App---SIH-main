const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

const resetPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DB');

        const emailsToReset = ['sumit1@gmail.com', 'admin@nexora.com'];
        const newPassword = 'password123';

        for (const email of emailsToReset) {
            const user = await User.findOne({ email });
            if (user) {
                user.password = newPassword;
                await user.save();
                console.log(`Password for ${email} reset to: ${newPassword}`);
            } else {
                console.log(`User ${email} not found`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetPasswords();
