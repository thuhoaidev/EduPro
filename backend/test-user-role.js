const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./src/models/User');

// Thay thế bằng token thực tế từ localStorage
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NzFhYzFhYzFhYzFhYzFhYzFhYzFhYyIsImlhdCI6MTcwMjE5MjAwMCwiZXhwIjoxNzAyMjc4NDAwfQ.example';

mongoose.connect('mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Decoded token:', decoded);
      
      // Find user
      const user = await User.findById(decoded.id).populate('role_id');
      console.log('User found:', {
        id: user._id,
        email: user.email,
        role_id: user.role_id,
        isInstructor: user.isInstructor,
        roles: user.roles
      });
      
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    process.exit(0);
  })
  .catch(console.error); 