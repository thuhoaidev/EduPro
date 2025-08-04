const mongoose = require('mongoose');
const User = require('./src/models/User');
const { Role } = require('./src/models/Role');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const InstructorProfile = require('../src/models/InstructorProfile');

const USER_ID = '68748e9e84ca7c05256dcc5d'; // Thay bằng id user thực tế

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro', {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function createAdminUser() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro');
        console.log('Connected to MongoDB');

        // Tìm role admin
        const adminRole = await Role.findOne({ name: 'admin' });

        if (!adminRole) {
            console.error('Không tìm thấy role admin');
            return;
        }

        // Kiểm tra xem user đã tồn tại chưa
        const existingUser = await User.findOne({ email: 'admin@example.com' });
        if (existingUser) {
            console.log('Admin user đã tồn tại:', existingUser.email);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 12);

        // Tạo admin user mới
        const newAdmin = new User({
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Admin Test',
            nickname: 'admin_test',
            slug: 'admin-test',
            role_id: adminRole._id,
            status: 'active',
            approval_status: 'approved',
            phone: '0123456789',
            address: 'Hà Nội, Việt Nam',
            gender: 'Nam',
            avatar: null,
            social_links: {
                facebook: null,
                twitter: null,
                linkedin: null,
                github: null
            }
        });

        await newAdmin.save();
        console.log('Đã tạo admin user thành công:', newAdmin.email);

    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        await mongoose.disconnect();
    }
}

const createInstructorProfile = async () => {
  try {
    const existing = await InstructorProfile.findOne({ user: USER_ID });
    if (existing) {
      console.log('InstructorProfile đã tồn tại:', existing._id);
      process.exit(0);
    }
    const profile = new InstructorProfile({
      user: USER_ID,
      status: 'approved',
      is_approved: true,
      bio: '',
      expertise: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await profile.save();
    console.log('Đã tạo InstructorProfile:', profile._id);
  } catch (err) {
    console.error('Lỗi khi tạo InstructorProfile:', err);
  } finally {
    mongoose.disconnect();
  }
};

createAdminUser();
createInstructorProfile(); 