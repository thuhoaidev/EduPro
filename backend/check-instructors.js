const mongoose = require('mongoose');
require('dotenv').config();

async function checkInstructors() {
  try {
    console.log('🔍 Checking instructors in database...\n');
    
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    require('./src/models/Role'); // Import Role model first
    const User = require('./src/models/User');
    
    // Tìm tất cả instructors
    const instructors = await User.find({ 
      $or: [
        { isInstructor: true },
        { 'role_id.name': 'instructor' },
        { roles: { $in: ['instructor'] } }
      ]
    }).populate('role_id').select('email fullname isInstructor roles role_id');
    
    console.log(`📊 Found ${instructors.length} instructors:`);
    
    instructors.forEach((instructor, index) => {
      console.log(`\n${index + 1}. ${instructor.fullname}`);
      console.log(`   Email: ${instructor.email}`);
      console.log(`   isInstructor: ${instructor.isInstructor}`);
      console.log(`   roles: ${JSON.stringify(instructor.roles)}`);
      console.log(`   role_id: ${instructor.role_id ? instructor.role_id.name : 'null'}`);
    });
    
    if (instructors.length === 0) {
      console.log('\n❌ No instructors found!');
      console.log('You may need to create an instructor account first.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkInstructors(); 