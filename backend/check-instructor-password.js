const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkInstructorPassword() {
  try {
    console.log('🔍 Checking instructor password...\n');
    
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    require('./src/models/Role');
    const User = require('./src/models/User');
    
    // Tìm instructor
    const instructor = await User.findOne({ 
      email: 'instructor@certificate.com'
    }).select('email password');
    
    if (!instructor) {
      console.log('❌ Instructor not found!');
      return;
    }
    
    console.log('Found instructor:', instructor.email);
    console.log('Password hash:', instructor.password);
    
    // Test password '123456'
    const isValid = await bcrypt.compare('123456', instructor.password);
    console.log('Password "123456" is valid:', isValid);
    
    // Test password 'password'
    const isValid2 = await bcrypt.compare('password', instructor.password);
    console.log('Password "password" is valid:', isValid2);
    
    // Test password '123456789'
    const isValid3 = await bcrypt.compare('123456789', instructor.password);
    console.log('Password "123456789" is valid:', isValid3);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkInstructorPassword(); 