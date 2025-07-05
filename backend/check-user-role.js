const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

mongoose.connect('mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Tìm tất cả users với role info
      const users = await User.find().populate('role_id');
      console.log('All users:');
      users.forEach(user => {
        console.log({
          id: user._id,
          email: user.email,
          role_id: user.role_id,
          role_name: user.role_id?.name,
          isInstructor: user.isInstructor,
          status: user.status,
          approval_status: user.approval_status
        });
      });
      
      // Tìm tất cả roles
      const roles = await Role.find();
      console.log('\nAll roles:', roles.map(r => ({ id: r._id, name: r.name })));
      
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    process.exit(0);
  })
  .catch(console.error); 