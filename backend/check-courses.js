const mongoose = require('mongoose');
const Course = require('./src/models/Course');

mongoose.connect('mongodb://localhost:27017/edupromain')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const courses = await Course.find().limit(5);
    console.log('Courses found:', courses.length);
    
    courses.forEach(course => {
      console.log('ID:', course._id);
      console.log('Title:', course.title);
      console.log('Instructor:', course.instructor);
      console.log('---');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  }); 