import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/UMURAVA_DB';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('❌ Please set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in .env');
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('✅ Admin already exists');
    } else {
      const admin = await User.create({
        email: adminEmail,
        password: adminPassword,
        firstName: 'System',
        lastName: 'Admin',
        role: 'admin'
      });
      console.log(`✅ Admin created: ${admin.email}`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();