const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Thay thế bằng token thực tế
const TOKEN = 'your-token-here';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testCartAPI() {
  try {
    console.log('=== Testing Cart API ===');
    
    // 1. Lấy giỏ hàng
    console.log('\n1. Getting cart...');
    const cartResponse = await api.get('/carts');
    console.log('Cart response:', cartResponse.data);
    
    if (cartResponse.data.items && cartResponse.data.items.length > 0) {
      const firstItem = cartResponse.data.items[0];
      console.log('First item ID:', firstItem._id);
      
      // 2. Xóa item đầu tiên
      console.log('\n2. Deleting first item...');
      const deleteResponse = await api.delete(`/carts/${firstItem._id}`);
      console.log('Delete response:', deleteResponse.data);
      
      // 3. Lấy giỏ hàng lại
      console.log('\n3. Getting cart again...');
      const cartResponse2 = await api.get('/carts');
      console.log('Cart response after deletion:', cartResponse2.data);
    } else {
      console.log('Cart is empty, adding a test item...');
      
      // Thêm item test
      const addResponse = await api.post('/carts', {
        courseId: 'test-course-id'
      });
      console.log('Add response:', addResponse.data);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Chạy test
testCartAPI(); 