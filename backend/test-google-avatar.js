const mongoose = require('mongoose');
const User = require('./src/models/User');

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testGoogleAvatar() {
  try {
    console.log('🔍 Testing Google avatar functionality...');
    
    // Tìm tất cả user
    const allUsers = await User.find({}).select('email fullname avatar createdAt nickname status');
    console.log(`📊 Total users: ${allUsers.length}`);
    
    console.log('\n👥 All users:');
    allUsers.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Fullname: ${user.fullname}`);
      console.log(`   Nickname: ${user.nickname}`);
      console.log(`   Avatar: ${user.avatar}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Created: ${user.createdAt}`);
      
      // Kiểm tra xem có phải Google user không
      if (user.avatar && user.avatar.includes('googleusercontent.com')) {
        console.log(`   ✅ This is a Google user!`);
      } else if (user.avatar === 'default-avatar.jpg' || user.avatar === '') {
        console.log(`   ⚠️  Using default avatar`);
      } else {
        console.log(`   📸 Custom avatar: ${user.avatar}`);
      }
      
      // Kiểm tra email Gmail
      if (user.email && user.email.includes('@gmail.com')) {
        console.log(`   📧 Gmail user detected!`);
      }
    });
    
    // Tìm user có avatar từ Google
    const usersWithGoogleAvatar = await User.find({
      avatar: { $regex: /googleusercontent\.com/i }
    });
    
    console.log(`\n📊 Found ${usersWithGoogleAvatar.length} users with Google avatar`);
    
    // Tìm user có avatar mặc định
    const usersWithDefaultAvatar = await User.find({
      avatar: { $in: ['default-avatar.jpg', ''] }
    });
    
    console.log(`📊 Found ${usersWithDefaultAvatar.length} users with default avatar`);
    
    // Tìm user có custom avatar
    const usersWithCustomAvatar = await User.find({
      avatar: { 
        $ne: 'default-avatar.jpg',
        $ne: '',
        $not: /googleusercontent\.com/i
      }
    });
    
    console.log(`📊 Found ${usersWithCustomAvatar.length} users with custom avatar`);
    
    // Tìm user có email Gmail
    const gmailUsers = await User.find({
      email: { $regex: /@gmail\.com$/i }
    });
    
    console.log(`📊 Found ${gmailUsers.length} users with Gmail addresses`);
    
    if (gmailUsers.length > 0) {
      console.log('\n📧 Gmail users:');
      gmailUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - ${user.fullname} - Avatar: ${user.avatar}`);
      });
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Google avatar:', error);
  } finally {
    mongoose.connection.close();
  }
}

testGoogleAvatar(); 