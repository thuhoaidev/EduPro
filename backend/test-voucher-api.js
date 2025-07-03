const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testVoucher = {
  code: 'TEST50',
  title: 'Test Voucher 50%',
  description: 'Voucher test giảm 50%',
  discountType: 'percentage',
  discountValue: 50,
  maxDiscount: 500000,
  minOrderValue: 100000,
  usageLimit: 10,
  usedCount: 0,
  categories: ['all'],
  tags: ['test'],
  isNew: true,
  isHot: false,
  isVipOnly: false,
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 ngày
};

const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = '';
let voucherId = '';

async function testVoucherAPIs() {
  console.log('🧪 Bắt đầu test Voucher APIs...\n');

  try {
    // 1. Test lấy danh sách voucher (admin)
    console.log('1️⃣ Test lấy danh sách voucher (admin)...');
    try {
      const listResponse = await axios.get(`${API_BASE}/vouchers`);
      console.log('✅ Lấy danh sách voucher thành công');
      console.log('Số lượng voucher:', listResponse.data.data.length);
    } catch (error) {
      console.log('❌ Lỗi khi lấy danh sách voucher:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('⚠️ Server chưa chạy. Hãy chạy "npm start" trước');
        return;
      }
    }
    console.log('');

    // 2. Test lấy danh sách voucher khả dụng (client)
    console.log('2️⃣ Test lấy danh sách voucher khả dụng (client)...');
    try {
      const availableResponse = await axios.get(`${API_BASE}/vouchers/available`);
      console.log('✅ Lấy danh sách voucher khả dụng thành công');
      console.log('Số lượng voucher khả dụng:', availableResponse.data.data.length);
      
      if (availableResponse.data.data.length > 0) {
        const voucher = availableResponse.data.data[0];
        console.log('Voucher đầu tiên:', {
          code: voucher.code,
          title: voucher.title,
          status: voucher.status,
          statusMessage: voucher.statusMessage
        });
      }
    } catch (error) {
      console.log('❌ Lỗi khi lấy voucher khả dụng:', error.message);
    }
    console.log('');

    // 3. Test đăng nhập để lấy token
    console.log('3️⃣ Test đăng nhập...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, testUser);
      authToken = loginResponse.data.data.token;
      console.log('✅ Đăng nhập thành công');
    } catch (loginError) {
      console.log('⚠️ Không thể đăng nhập, sẽ test validate voucher mà không có auth');
      console.log('Lỗi:', loginError.response?.data?.message || loginError.message);
    }
    console.log('');

    // 4. Test validate voucher
    console.log('4️⃣ Test validate voucher...');
    const validateData = {
      code: 'WELCOME50', // Sử dụng voucher có sẵn
      orderAmount: 200000
    };

    if (authToken) {
      // Test với auth
      try {
        const validateResponse = await axios.post(`${API_BASE}/vouchers/validate`, validateData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Validate voucher thành công (có auth)');
        console.log('Discount amount:', validateResponse.data.data.discountAmount);
        console.log('Final amount:', validateResponse.data.data.finalAmount);
      } catch (validateError) {
        console.log('⚠️ Validate voucher thất bại:', validateError.response?.data?.message || validateError.message);
      }
    } else {
      // Test không có auth (sẽ báo lỗi)
      try {
        await axios.post(`${API_BASE}/vouchers/validate`, validateData);
      } catch (validateError) {
        console.log('✅ Validate voucher trả về lỗi auth như mong đợi');
        console.log('Lỗi:', validateError.response?.data?.message || validateError.message);
      }
    }
    console.log('');

    // 5. Test validate voucher với order amount thấp
    console.log('5️⃣ Test validate voucher với order amount thấp...');
    if (authToken) {
      const validateLowAmountData = {
        code: 'WELCOME50',
        orderAmount: 50000 // Thấp hơn minOrderValue (100000)
      };

      try {
        await axios.post(`${API_BASE}/vouchers/validate`, validateLowAmountData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      } catch (validateError) {
        console.log('✅ Validate voucher trả về lỗi order amount thấp như mong đợi');
        console.log('Lỗi:', validateError.response?.data?.message || validateError.message);
      }
    }
    console.log('');

    // 6. Test validate voucher không tồn tại
    console.log('6️⃣ Test validate voucher không tồn tại...');
    if (authToken) {
      const validateInvalidData = {
        code: 'INVALID123',
        orderAmount: 200000
      };

      try {
        await axios.post(`${API_BASE}/vouchers/validate`, validateInvalidData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      } catch (validateError) {
        console.log('✅ Validate voucher trả về lỗi không tồn tại như mong đợi');
        console.log('Lỗi:', validateError.response?.data?.message || validateError.message);
      }
    }
    console.log('');

    console.log('🎉 Tất cả test hoàn thành!');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️ Không thể kết nối đến server. Hãy đảm bảo server đang chạy với "npm start"');
    }
  }
}

// Chạy test
testVoucherAPIs(); 