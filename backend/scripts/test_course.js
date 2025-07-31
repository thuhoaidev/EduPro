const mongoose = require('mongoose');
const Course = require('../src/models/Course');

mongoose.connect('mongodb://localhost:27017/edupor')
  .then(async () => {
    try {
      const course = await Course.findById('6879caf1856109989beda9af');
      console.log('Course:', course ? {
        id: course._id,
        title: course.title,
        status: course.status,
        displayStatus: course.displayStatus,
        price: course.price
      } : 'Not found');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      mongoose.connection.close();
    }
  }); 