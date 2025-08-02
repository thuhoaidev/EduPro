const mongoose = require('mongoose');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const Certificate = require('../src/models/Certificate');
const { Role, ROLES } = require('../src/models/Role');
require('dotenv').config();

async function createTestCertificateData() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Tạo roles nếu chưa có
    let studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      console.log('Tạo student role...');
      studentRole = await Role.create({
        name: 'student',
        description: 'Học viên',
        permissions: ['view_courses', 'enroll_courses', 'view_certificates']
      });
      console.log('Student role đã được tạo');
    } else {
      console.log('Student role đã tồn tại');
    }

    let instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      console.log('Tạo instructor role...');
      instructorRole = await Role.create({
        name: 'instructor',
        description: 'Giảng viên',
        permissions: ['create_courses', 'edit_courses', 'view_students', 'view_certificates']
      });
      console.log('Instructor role đã được tạo');
    } else {
      console.log('Instructor role đã tồn tại');
    }

    // Tạo user test nếu chưa có
    let testUser = await User.findOne({ email: 'test@certificate.com' });
    if (!testUser) {
      console.log('Tạo user test...');
      testUser = await User.create({
        email: 'test@certificate.com',
        password: 'password123',
        fullname: 'Nguyễn Văn Test',
        nickname: 'testuser',
        role_id: studentRole._id,
        gender: 'Nam',
        status: 'active',
        email_verified: true
      });
      console.log('User test đã được tạo:', testUser.fullname);
    } else {
      console.log('User test đã tồn tại:', testUser.fullname);
    }

    // Tạo instructor test nếu chưa có
    let testInstructor = await User.findOne({ email: 'instructor@certificate.com' });
    if (!testInstructor) {
      console.log('Tạo instructor test...');
      testInstructor = await User.create({
        email: 'instructor@certificate.com',
        password: 'password123',
        fullname: 'Trần Văn Giảng Viên',
        nickname: 'testinstructor',
        role_id: instructorRole._id,
        gender: 'Nam',
        status: 'active',
        email_verified: true,
        isInstructor: true
      });
      console.log('Instructor test đã được tạo:', testInstructor.fullname);
    } else {
      console.log('Instructor test đã tồn tại:', testInstructor.fullname);
    }

    // Tạo category test nếu chưa có
    const Category = require('../src/models/Category');
    let testCategory = await Category.findOne({ name: 'Test Category' });
    if (!testCategory) {
      console.log('Tạo category test...');
      testCategory = await Category.create({
        name: 'Test Category',
        description: 'Category for testing certificates',
        slug: 'test-category'
      });
      console.log('Category test đã được tạo:', testCategory.name);
    } else {
      console.log('Category test đã tồn tại:', testCategory.name);
    }

    // Tạo instructor profile nếu chưa có
    const InstructorProfile = require('../src/models/InstructorProfile');
    let instructorProfile = await InstructorProfile.findOne({ user: testInstructor._id });
    if (!instructorProfile) {
      console.log('Tạo instructor profile...');
      instructorProfile = await InstructorProfile.create({
        user: testInstructor._id,
        bio: 'Test instructor bio',
        expertise: ['Test specialization'],
        education: [{
          degree: 'Bachelor',
          institution: 'Test University',
          year: 2020
        }],
        experience: [{
          position: 'Software Engineer',
          company: 'Test Company',
          startYear: 2020,
          endYear: 2023
        }],
        status: 'approved',
        is_approved: true
      });
      console.log('Instructor profile đã được tạo');
    } else {
      console.log('Instructor profile đã tồn tại');
    }

    // Tạo course test nếu chưa có
    let testCourse = await Course.findOne({ title: 'Khóa Học Test Chứng Chỉ' });
    if (!testCourse) {
      console.log('Tạo course test...');
      testCourse = await Course.create({
        instructor: instructorProfile._id,
        category: testCategory._id,
        title: 'Khóa Học Test Chứng Chỉ',
        slug: 'khoa-hoc-test-chung-chi',
        description: 'Khóa học để test chức năng chứng chỉ',
        thumbnail: 'https://example.com/thumbnail.jpg',
        level: 'beginner',
        language: 'vi',
        price: 100000,
        status: 'approved',
        displayStatus: 'published',
        requirements: ['Kiến thức cơ bản'],
        outcomes: ['Hoàn thành khóa học'],
        sections: []
      });
      console.log('Course test đã được tạo:', testCourse.title);
    } else {
      console.log('Course test đã tồn tại:', testCourse.title);
    }

    // Tạo enrollment test nếu chưa có
    let testEnrollment = await Enrollment.findOne({ 
      student: testUser._id, 
      course: testCourse._id 
    });
    if (!testEnrollment) {
      console.log('Tạo enrollment test...');
      testEnrollment = await Enrollment.create({
        student: testUser._id,
        course: testCourse._id,
        completed: true,
        progress: {},
        enrolledAt: new Date()
      });
      console.log('Enrollment test đã được tạo');
    } else {
      console.log('Enrollment test đã tồn tại');
      // Cập nhật thành completed
      testEnrollment.completed = true;
      await testEnrollment.save();
      console.log('Enrollment đã được cập nhật thành completed');
    }

    // Xóa chứng chỉ cũ nếu có
    await Certificate.deleteMany({ user: testUser._id, course: testCourse._id });
    console.log('Đã xóa chứng chỉ cũ');

    console.log('\n=== DỮ LIỆU TEST ĐÃ SẴN SÀNG ===');
    console.log('User test:', testUser.fullname, `(${testUser.email})`);
    console.log('Instructor test:', testInstructor.fullname, `(${testInstructor.email})`);
    console.log('Course test:', testCourse.title);
    console.log('Enrollment:', testEnrollment.completed ? 'Completed' : 'Not completed');

    console.log('\nBây giờ bạn có thể chạy:');
    console.log('node test-certificate-new.js');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestCertificateData(); 