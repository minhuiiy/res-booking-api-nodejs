const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        const adminExists = await User.findOne({ email: 'admin@gmail.com' });
        if (adminExists) {
            console.log('Admin user already exists. Updating password to "123"...');
            adminExists.password = '123';
            await adminExists.save();
        } else {
            await User.create({
                name: 'Admin User',
                email: 'admin@gmail.com',
                password: '123',
                role: 'admin'
            });
            console.log('Admin user created successfully!');
        }

        mongoose.connection.close();
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
