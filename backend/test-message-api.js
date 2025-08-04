const axios = require('axios');

// Test script để kiểm tra Message API
const API_BASE = 'http://localhost:5000';

async function testMessageAPI() {
    console.log('=== TESTING MESSAGE API ===');
    
    try {
        // Test 1: Gửi tin nhắn không có token
        console.log('\n1. Testing send message without token...');
        try {
            await axios.post(`${API_BASE}/api/messages`, {
                receiverId: '507f1f77bcf86cd799439011',
                content: 'Test message'
            });
        } catch (err) {
            console.log('✅ Expected error:', err.response?.status, err.response?.data?.message);
        }
        
        // Test 2: Gửi tin nhắn với token không hợp lệ
        console.log('\n2. Testing send message with invalid token...');
        try {
            await axios.post(`${API_BASE}/api/messages`, {
                receiverId: '507f1f77bcf86cd799439011',
                content: 'Test message'
            }, {
                headers: {
                    'Authorization': 'Bearer invalid-token'
                }
            });
        } catch (err) {
            console.log('✅ Expected error:', err.response?.status, err.response?.data?.message);
        }
        
        // Test 3: Gửi tin nhắn thiếu receiverId
        console.log('\n3. Testing send message without receiverId...');
        try {
            await axios.post(`${API_BASE}/api/messages`, {
                content: 'Test message'
            }, {
                headers: {
                    'Authorization': 'Bearer valid-token-here'
                }
            });
        } catch (err) {
            console.log('✅ Expected error:', err.response?.status, err.response?.data?.message);
        }
        
        // Test 4: Gửi tin nhắn thiếu content
        console.log('\n4. Testing send message without content...');
        try {
            await axios.post(`${API_BASE}/api/messages`, {
                receiverId: '507f1f77bcf86cd799439011'
            }, {
                headers: {
                    'Authorization': 'Bearer valid-token-here'
                }
            });
        } catch (err) {
            console.log('✅ Expected error:', err.response?.status, err.response?.data?.message);
        }
        
        console.log('\n=== TEST COMPLETED ===');
        console.log('Để test với token thật, bạn cần:');
        console.log('1. Đăng nhập vào ứng dụng');
        console.log('2. Lấy token từ localStorage');
        console.log('3. Thay thế "valid-token-here" bằng token thật');
        
    } catch (error) {
        console.error('Test error:', error.message);
    }
}

// Chạy test
testMessageAPI();
