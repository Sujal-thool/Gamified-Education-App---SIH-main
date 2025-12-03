const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const localURI = 'mongodb://127.0.0.1:27017/nexora';
console.log('Attempting to connect to Local MongoDB...');
console.log('URI:', localURI);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(localURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        process.exit(0);
    } catch (error) {
        console.error('Database connection error details:');
        console.error(error);
        process.exit(1);
    }
};

connectDB();
