const mongoose = require('mongoose');
const Certificate = require('./src/models/Certificate');
const fs = require('fs');
const path = require('path');

async function checkCertificates() {
  try {
    await mongoose.connect('mongodb://localhost:27017/edupor');
    console.log('Connected to MongoDB');
    
    // Lấy tất cả certificates
    const certificates = await Certificate.find({}).populate('course user');
    console.log('\n=== CERTIFICATES IN DATABASE ===');
    
    certificates.forEach((cert, index) => {
      console.log(`\n${index + 1}. Certificate ID: ${cert._id}`);
      console.log(`   User: ${cert.user?.fullname || cert.user?._id}`);
      console.log(`   Course: ${cert.course?.title || cert.course?._id}`);
      console.log(`   File: ${cert.file}`);
      console.log(`   Code: ${cert.code}`);
      console.log(`   Issued: ${cert.issuedAt}`);
      
      // Kiểm tra file có tồn tại không
      const filePath = path.join(__dirname, 'certificates', cert.file);
      const fileExists = fs.existsSync(filePath);
      console.log(`   File exists: ${fileExists ? '✅ YES' : '❌ NO'}`);
      
      if (fileExists) {
        const stats = fs.statSync(filePath);
        console.log(`   File size: ${stats.size} bytes`);
      }
    });
    
    // Kiểm tra files trong thư mục
    console.log('\n=== FILES IN CERTIFICATES DIRECTORY ===');
    const certDir = path.join(__dirname, 'certificates');
    if (fs.existsSync(certDir)) {
      const files = fs.readdirSync(certDir);
      files.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
        const filePath = path.join(certDir, file);
        const stats = fs.statSync(filePath);
        console.log(`   Size: ${stats.size} bytes`);
      });
    } else {
      console.log('❌ Certificates directory does not exist!');
    }
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCertificates(); 