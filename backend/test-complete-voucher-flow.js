const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = '';

async function testCompleteVoucherFlow() {
  console.log('🚀 Bắt đầu test luồng voucher và order hoàn chỉnh...\n');

  try {
    // 1. Test đăng nhập
    console.log('1️⃣ Test đăng nhập...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, testUser);
      authToken = loginResponse.data.data.token;
      console.log('✅ Đăng nhập thành công');
      console.log('User ID:', loginResponse.data.data.user.id);
    } catch (loginError) {
      console.log('⚠️ Không thể đăng nhập, tạo user mới...');
      try {
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
          ...testUser,
          fullName: 'Test User',
          phone: '0123456789'
        });
        console.log('✅ Tạo user mới thành công');
        
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, testUser);
        authToken = loginResponse.data.data.token;
        console.log('✅ Đăng nhập thành công');
      } catch (registerError) {
        console.log('❌ Không thể tạo user:', registerError.response?.data?.message || registerError.message);
        return;
      }
    }
    console.log('');

    // 2. Test lấy danh sách voucher khả dụng
    console.log('2️⃣ Test lấy danh sách voucher khả dụng...');
    try {
      const availableResponse = await axios.get(`${API_BASE}/vouchers/available`);
      console.log('✅ Lấy danh sách voucher khả dụng thành công');
      console.log('Số lượng voucher khả dụng:', availableResponse.data.data.length);
      
      if (availableResponse.data.data.length === 0) {
        console.log('⚠️ Không có voucher khả dụng, tạo voucher mẫu...');
        // Tạo voucher mẫu
        const createVoucherResponse = await axios.post(`${API_BASE}/vouchers`, {
          code: 'TEST50',
          title: 'Test Voucher 50%',
          description: 'Voucher test giảm 50%',
          discountType: 'percentage',
          discountValue: 50,
          maxDiscount: 500000,
          minOrderValue: 100000,
          usageLimit: 100,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Tạo voucher mẫu thành công');
      }
    } catch (error) {
      console.log('❌ Lỗi khi lấy voucher khả dụng:', error.message);
    }
    console.log('');

    // 3. Test validate voucher
    console.log('3️⃣ Test validate voucher...');
    try {
      const validateResponse = await axios.post(`${API_BASE}/vouchers/validate`, {
        code: 'TEST50',
        orderAmount: 200000
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Validate voucher thành công');
      console.log('Discount amount:', validateResponse.data.data.discountAmount);
      console.log('Final amount:', validateResponse.data.data.finalAmount);
    } catch (error) {
      console.log('❌ Lỗi khi validate voucher:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 4. Test tạo order với voucher
    console.log('4️⃣ Test tạo order với voucher...');
    try {
      const orderData = {
        items: [
          {
            courseId: '507f1f77bcf86cd799439011', // ID khóa học mẫu
            quantity: 1
          }
        ],
        voucherCode: 'TEST50',
        paymentMethod: 'cod',
        shippingAddress: {
          fullName: 'Test User',
          phone: '0123456789',
          address: '123 Test Street',
          city: 'hcm',
          district: 'district1',
          ward: 'ward1'
        },
        notes: 'Order test với voucher'
      };

      const orderResponse = await axios.post(`${API_BASE}/orders`, orderData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Tạo order thành công');
      console.log('Order ID:', orderResponse.data.data.order.id);
      console.log('Total amount:', orderResponse.data.data.order.totalAmount);
      console.log('Discount amount:', orderResponse.data.data.order.discountAmount);
      console.log('Final amount:', orderResponse.data.data.order.finalAmount);
    } catch (error) {
      console.log('❌ Lỗi khi tạo order:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 5. Test lấy danh sách orders
    console.log('5️⃣ Test lấy danh sách orders...');
    try {
      const ordersResponse = await axios.get(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Lấy danh sách orders thành công');
      console.log('Số lượng orders:', ordersResponse.data.data.orders.length);
      
      if (ordersResponse.data.data.orders.length > 0) {
        const order = ordersResponse.data.data.orders[0];
        console.log('Order đầu tiên:', {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          discountAmount: order.discountAmount,
          finalAmount: order.finalAmount
        });
      }
    } catch (error) {
      console.log('❌ Lỗi khi lấy orders:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 6. Test lấy chi tiết order
    console.log('6️⃣ Test lấy chi tiết order...');
    try {
      const ordersResponse = await axios.get(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (ordersResponse.data.data.orders.length > 0) {
        const orderId = ordersResponse.data.data.orders[0].id;
        const orderDetailResponse = await axios.get(`${API_BASE}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Lấy chi tiết order thành công');
        console.log('Order detail:', {
          id: orderDetailResponse.data.data.order.id,
          status: orderDetailResponse.data.data.order.status,
          items: orderDetailResponse.data.data.order.items.length
        });
      } else {
        console.log('⚠️ Không có order để test');
      }
    } catch (error) {
      console.log('❌ Lỗi khi lấy chi tiết order:', error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 Test luồng voucher và order hoàn thành!');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️ Không thể kết nối đến server. Hãy đảm bảo server đang chạy với "node server.js"');
    }
  }
}

// Chạy test
testCompleteVoucherFlow(); 