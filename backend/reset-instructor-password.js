const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetInstructorPassword() {
  try {
    console.log('🔧 Resetting instructor password...\n');
    
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    require('./src/models/Role');
    const User = require('./src/models/User');
    
    // Tìm instructor
    const instructor = await User.findOne({ 
      email: 'instructor@certificate.com'
    });
    
    if (!instructor) {
      console.log('❌ Instructor not found!');
      return;
    }
    
    console.log('Found instructor:', instructor.fullname);
    console.log('Current email:', instructor.email);
    
    // Reset password thành '123456'
    const hashedPassword = await bcrypt.hash('123456', 10);
    instructor.password = hashedPassword;
    await instructor.save();
    
    console.log('✅ Password reset successfully!');
    console.log('New password: 123456');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

resetInstructorPassword(); 