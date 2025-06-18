const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User');
const { Role } = require('../src/models/Role');

// Kết nối database
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://edupro:edupro123@cluster0.qjwuxzj.mongodb.net/edupro')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createPendingInstructors = async () => {
  try {
    console.log('Bắt đầu tạo dữ liệu mẫu cho hồ sơ giảng viên chờ duyệt...');

    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      console.error('Không tìm thấy role instructor');
      return;
    }

    // Dữ liệu mẫu cho hồ sơ giảng viên chờ duyệt
    const pendingInstructors = [
      {
        email: 'giangvien1@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 123456
        fullname: 'Nguyễn Văn Giảng Viên 1',
        nickname: 'nguyengiangvien1',
        phone: '0123456781',
        dob: new Date('1990-01-15'),
        address: 'Hà Nội, Việt Nam',
        gender: 'male',
        role_id: instructorRole._id,
        status: 'active',
        email_verified: true,
        bio: 'Tôi là một giảng viên có kinh nghiệm 5 năm trong lĩnh vực công nghệ thông tin. Chuyên về lập trình web và mobile.',
        social_links: {
          facebook: 'https://facebook.com/nguyengiangvien1',
          twitter: null,
          linkedin: 'https://linkedin.com/in/nguyengiangvien1',
          youtube: null,
          github: 'https://github.com/nguyengiangvien1',
          website: 'https://nguyengiangvien1.com',
        },
        instructorInfo: {
          is_approved: false,
          experience_years: 5,
          specializations: ['Web Development', 'Mobile Development'],
        },
      },
      {
        email: 'giangvien2@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 123456
        fullname: 'Trần Thị Giảng Viên 2',
        nickname: 'trangiangvien2',
        phone: '0123456782',
        dob: new Date('1988-03-20'),
        address: 'TP.HCM, Việt Nam',
        gender: 'female',
        role_id: instructorRole._id,
        status: 'active',
        email_verified: true,
        bio: 'Giảng viên có chuyên môn về Data Science và Machine Learning. Từng làm việc tại các công ty công nghệ lớn.',
        social_links: {
          facebook: null,
          twitter: 'https://twitter.com/trangiangvien2',
          linkedin: 'https://linkedin.com/in/trangiangvien2',
          youtube: 'https://youtube.com/@trangiangvien2',
          github: 'https://github.com/trangiangvien2',
          website: null,
        },
        instructorInfo: {
          is_approved: false,
          experience_years: 7,
          specializations: ['Data Science', 'Machine Learning', 'Python'],
        },
      },
      {
        email: 'giangvien3@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 123456
        fullname: 'Lê Văn Giảng Viên 3',
        nickname: 'legiangvien3',
        phone: '0123456783',
        dob: new Date('1992-07-10'),
        address: 'Đà Nẵng, Việt Nam',
        gender: 'male',
        role_id: instructorRole._id,
        status: 'active',
        email_verified: true,
        bio: 'Chuyên gia về UI/UX Design và Frontend Development. Có kinh nghiệm làm việc với React, Vue.js và các framework hiện đại.',
        social_links: {
          facebook: 'https://facebook.com/legiangvien3',
          twitter: null,
          linkedin: 'https://linkedin.com/in/legiangvien3',
          youtube: null,
          github: 'https://github.com/legiangvien3',
          website: 'https://legiangvien3.design',
        },
        instructorInfo: {
          is_approved: false,
          experience_years: 4,
          specializations: ['UI/UX Design', 'Frontend Development', 'React'],
        },
      },
      {
        email: 'giangvien4@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 123456
        fullname: 'Phạm Thị Giảng Viên 4',
        nickname: 'phamgiangvien4',
        phone: '0123456784',
        dob: new Date('1985-11-25'),
        address: 'Cần Thơ, Việt Nam',
        gender: 'female',
        role_id: instructorRole._id,
        status: 'active',
        email_verified: true,
        bio: 'Giảng viên chuyên về Backend Development và Database Management. Có kinh nghiệm với Node.js, Python, và các hệ thống phân tán.',
        social_links: {
          facebook: null,
          twitter: null,
          linkedin: 'https://linkedin.com/in/phamgiangvien4',
          youtube: null,
          github: 'https://github.com/phamgiangvien4',
          website: null,
        },
        instructorInfo: {
          is_approved: false,
          experience_years: 8,
          specializations: ['Backend Development', 'Database Management', 'Node.js'],
        },
      },
      {
        email: 'giangvien5@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 123456
        fullname: 'Hoàng Văn Giảng Viên 5',
        nickname: 'hoanggiangvien5',
        phone: '0123456785',
        dob: new Date('1995-05-08'),
        address: 'Hải Phòng, Việt Nam',
        gender: 'male',
        role_id: instructorRole._id,
        status: 'active',
        email_verified: true,
        bio: 'Chuyên gia về DevOps và Cloud Computing. Có kinh nghiệm với AWS, Docker, Kubernetes và CI/CD pipelines.',
        social_links: {
          facebook: 'https://facebook.com/hoanggiangvien5',
          twitter: 'https://twitter.com/hoanggiangvien5',
          linkedin: 'https://linkedin.com/in/hoanggiangvien5',
          youtube: 'https://youtube.com/@hoanggiangvien5',
          github: 'https://github.com/hoanggiangvien5',
          website: 'https://hoanggiangvien5.dev',
        },
        instructorInfo: {
          is_approved: false,
          experience_years: 6,
          specializations: ['DevOps', 'Cloud Computing', 'AWS', 'Docker'],
        },
      },
    ];

    // Kiểm tra và tạo từng hồ sơ
    for (const instructorData of pendingInstructors) {
      const existingUser = await User.findOne({ email: instructorData.email });
      
      if (existingUser) {
        console.log(`Hồ sơ với email ${instructorData.email} đã tồn tại, bỏ qua...`);
        continue;
      }

      const newInstructor = new User(instructorData);
      await newInstructor.save();
      console.log(`Đã tạo hồ sơ giảng viên: ${instructorData.fullname} (${instructorData.email})`);
    }

    // Đếm tổng số hồ sơ chờ duyệt
    const totalPending = await User.countDocuments({
      role_id: instructorRole._id,
      $or: [
        { approval_status: 'pending' },
        { approval_status: null },
      ],
    });

    console.log(`\n✅ Hoàn thành! Tổng số hồ sơ giảng viên chờ duyệt: ${totalPending}`);

    // Hiển thị danh sách hồ sơ vừa tạo
    const pendingInstructorsList = await User.find({
      role_id: instructorRole._id,
      $or: [
        { approval_status: 'pending' },
        { approval_status: null },
      ],
    }).select('fullname email phone created_at');

    console.log('\n📋 Danh sách hồ sơ giảng viên chờ duyệt:');
    pendingInstructorsList.forEach((instructor, index) => {
      console.log(`${index + 1}. ${instructor.fullname} - ${instructor.email} - ${instructor.phone}`);
    });

  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Đã đóng kết nối database');
  }
};

// Chạy script
createPendingInstructors(); 