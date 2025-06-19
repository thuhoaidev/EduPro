const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCreateUser() {
  try {
    // 1. Login admin
    console.log('🔐 Đang đăng nhập admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'quantrivien@gmail.com',
      password: '123456'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Đăng nhập thành công!');
    console.log('Token:', token.substring(0, 50) + '...');

    // 2. Tạo user mới (không có avatar)
    console.log('\n👤 Đang tạo user mới (không có avatar)...');
    const createUserResponse = await axios.post(`${BASE_URL}/users`, {
      email: 'testuser1@example.com',
      password: '123456',
      fullname: 'Nguyễn Văn Test',
      nickname: 'nguyenvtest',
      phone: '0123456789',
      dob: '1990-01-01',
      address: 'Hà Nội, Việt Nam',
      gender: 'male',
      role_id: '68510d89f2ab81d9256b4d5e', // STUDENT
      status: 'active',
      approval_status: 'approved',
      bio: 'Đây là user test được tạo bởi script.',
      social_links: {
        facebook: 'https://facebook.com/nguyenvtest',
        twitter: null,
        linkedin: 'https://linkedin.com/in/nguyenvtest',
        youtube: null,
        github: 'https://github.com/nguyenvtest',
        website: null
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Tạo user thành công!');
    console.log('User ID:', createUserResponse.data.data._id);
    console.log('Email:', createUserResponse.data.data.email);
    console.log('Fullname:', createUserResponse.data.data.fullname);

    // 3. Lấy danh sách users để kiểm tra
    console.log('\n📋 Đang lấy danh sách users...');
    const getUsersResponse = await axios.get(`${BASE_URL}/users?page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Lấy danh sách users thành công!');
    console.log('Tổng số users:', getUsersResponse.data.data.pagination.total);
    console.log('Users:', getUsersResponse.data.data.users.map(user => ({
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      role: user.role_id?.name
    })));

  } catch (error) {
    console.error('❌ Lỗi:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Chạy test
testCreateUser(); 