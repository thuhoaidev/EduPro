const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestInstructor() {
  try {
    console.log('👤 Creating test instructor...\n');
    
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const Role = require('./src/models/Role');
    const User = require('./src/models/User');
    
    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      console.log('❌ Instructor role not found!');
      return;
    }
    
    // Kiểm tra xem instructor đã tồn tại chưa
    const existingInstructor = await User.findOne({ 
      email: 'test.instructor@example.com'
    });
    
    if (existingInstructor) {
      console.log('✅ Test instructor already exists!');
      console.log('Email: test.instructor@example.com');
      console.log('Password: 123456');
      return;
    }
    
    // Tạo password hash
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Tạo instructor mới
    const newInstructor = new User({
      email: 'test.instructor@example.com',
      password: hashedPassword,
      fullname: 'Test Instructor',
      nickname: 'testinstructor',
      isInstructor: true,
      role_id: instructorRole._id,
      roles: ['instructor']
    });
    
    await newInstructor.save();
    
    console.log('✅ Test instructor created successfully!');
    console.log('Email: test.instructor@example.com');
    console.log('Password: 123456');
    console.log('Fullname:', newInstructor.fullname);
    console.log('Role:', instructorRole.name);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

createTestInstructor(); 