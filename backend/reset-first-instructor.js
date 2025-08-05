const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetFirstInstructor() {
  try {
    console.log('🔧 Resetting first instructor password...\n');
    
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const User = require('./src/models/User');
    
    // Tìm instructor đầu tiên
    const instructor = await User.findOne({ 
      isInstructor: true 
    }).populate('role_id');
    
    if (!instructor) {
      console.log('❌ No instructor found!');
      return;
    }
    
    console.log('Found instructor:', instructor.fullname);
    console.log('Email:', instructor.email);
    console.log('Role:', instructor.role_id ? instructor.role_id.name : 'null');
    
    // Reset password thành '123456'
    const hashedPassword = await bcrypt.hash('123456', 10);
    instructor.password = hashedPassword;
    await instructor.save();
    
    console.log('✅ Password reset successfully!');
    console.log('New password: 123456');
    console.log('Login credentials:');
    console.log('Email:', instructor.email);
    console.log('Password: 123456');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

resetFirstInstructor(); 