const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function testGoogleAvatar() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Tìm user có avatar từ Google
    const users = await User.find({
      avatar: { $regex: /googleusercontent\.com/ }
    }).limit(5);

    console.log(`Found ${users.length} users with Google avatars:`);

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User: ${user.fullname}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Avatar: ${user.avatar}`);
      console.log(`   Avatar length: ${user.avatar?.length}`);
      console.log(`   Is valid URL: ${user.avatar?.startsWith('http')}`);
    });

    // Tìm user không có avatar
    const usersWithoutAvatar = await User.find({
      $or: [
        { avatar: { $exists: false } },
        { avatar: null },
        { avatar: '' },
        { avatar: 'default-avatar.jpg' }
      ]
    }).limit(5);

    console.log(`\nFound ${usersWithoutAvatar.length} users without avatars:`);

    usersWithoutAvatar.forEach((user, index) => {
      console.log(`\n${index + 1}. User: ${user.fullname}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Avatar: ${user.avatar || 'null'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testGoogleAvatar(); 