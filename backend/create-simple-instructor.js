const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createSimpleInstructor() {
  try {
    console.log('👤 Creating simple instructor...\n');
    
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const User = require('./src/models/User');
    const Role = require('./src/models/Role');
    
    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      console.log('❌ Instructor role not found!');
      return;
    }
    
    console.log('Found instructor role:', instructorRole.name, instructorRole._id);
    
    // Kiểm tra xem instructor đã tồn tại chưa
    const existingInstructor = await User.findOne({ 
      email: 'simple.instructor@test.com'
    });
    
    if (existingInstructor) {
      console.log('✅ Simple instructor already exists!');
      console.log('Email: simple.instructor@test.com');
      console.log('Password: 123456');
      return;
    }
    
    // Tạo password hash
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Tạo instructor mới với role_id
    const newInstructor = new User({
      email: 'simple.instructor@test.com',
      password: hashedPassword,
      fullname: 'Simple Test Instructor',
      nickname: 'simpleinstructor',
      isInstructor: true,
      role_id: instructorRole._id,
      roles: ['instructor']
    });
    
    await newInstructor.save();
    
    console.log('✅ Simple instructor created successfully!');
    console.log('Email: simple.instructor@test.com');
    console.log('Password: 123456');
    console.log('Fullname:', newInstructor.fullname);
    console.log('isInstructor:', newInstructor.isInstructor);
    console.log('role_id:', newInstructor.role_id);
    console.log('roles:', newInstructor.roles);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

createSimpleInstructor(); 