const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

const listUsers = async () => {
    try {
        console.log('Connecting to DB:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) [Role: ${u.role}]`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listUsers();
