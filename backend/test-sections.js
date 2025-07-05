const mongoose = require('mongoose');
const Section = require('./src/models/Section');

mongoose.connect('mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const sections = await Section.find().limit(10);
    console.log('Sections in DB:', sections.map(s => ({
      id: s._id.toString(),
      title: s.title,
      course_id: s.course_id ? s.course_id.toString() : 'null'
    })));
    
    if (sections.length === 0) {
      console.log('No sections found in database');
    }
    
    process.exit(0);
  })
  .catch(console.error); 