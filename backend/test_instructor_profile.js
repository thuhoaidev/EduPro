const axios = require('axios');

async function testInstructorProfileAPI() {
  try {
    // Test login để lấy token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'student@example.com',
      password: 'password123'
    });
    
    console.log('Login response:', loginResponse.data);
    
    if (loginResponse.data.success && loginResponse.data.token) {
      const token = loginResponse.data.token;
      const headers = { Authorization: `Bearer ${token}` };
      
      // Test lấy thông tin instructor profile của user hiện tại
      const profileResponse = await axios.get('http://localhost:5000/api/users/instructor-profile/my', { headers });
      console.log('My instructor profile:', profileResponse.data);
      
      // Test submit instructor profile
      const submitData = {
        fullName: 'Nguyễn Văn A',
        phone: '0123456789',
        dateOfBirth: '1990-01-01',
        address: 'Hà Nội, Việt Nam',
        bio: 'Tôi là một giảng viên có kinh nghiệm trong lĩnh vực công nghệ thông tin',
        expertise: ['JavaScript', 'React', 'Node.js'],
        experience: '5 năm kinh nghiệm giảng dạy',
        education: 'Cử nhân Công nghệ thông tin - Đại học Bách Khoa Hà Nội',
        certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
        portfolio: 'https://github.com/example',
        linkedin: 'https://linkedin.com/in/example',
        website: 'https://example.com'
      };
      
      const submitResponse = await axios.post('http://localhost:5000/api/users/instructor-profile/submit', submitData, { headers });
      console.log('Submit instructor profile:', submitResponse.data);
      
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testInstructorProfileAPI(); 