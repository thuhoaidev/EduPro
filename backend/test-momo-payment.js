const axios = require('axios');

// Test thanh toán Momo
async function testMomoPayment() {
  try {
    console.log('🧪 Testing Momo payment...');
    
    // Test tạo payment Momo
    const paymentResponse = await axios.post('http://localhost:5000/payment-momo/create_momo_payment', {
      amount: 100000,
      name: 'Test User',
      email: 'test@example.com',
      orderData: {
        items: [
          {
            courseId: '507f1f77bcf86cd799439011', // Test course ID
            quantity: 1
          }
        ],
        voucherCode: null,
        paymentMethod: 'momo',
        shippingInfo: {
          fullName: 'Test User',
          phone: '0123456789',
          email: 'test@example.com'
        },
        notes: 'Test order'
      }
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE',
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Payment created:', paymentResponse.data);
    
    // Test callback Momo
    const callbackResponse = await axios.post('http://localhost:5000/api/orders/momo-callback', {
      resultCode: '0',
      message: 'Success',
      orderId: paymentResponse.data.orderId,
      amount: 100000,
      transId: 'TEST_TRANS_ID_' + Date.now()
    });

    console.log('✅ Callback processed:', callbackResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test nạp tiền Momo
async function testMomoDeposit() {
  try {
    console.log('🧪 Testing Momo deposit...');
    
    // Test tạo deposit Momo
    const depositResponse = await axios.post('http://localhost:5000/api/wallet/deposit', {
      amount: 50000,
      method: 'momo',
      callbackUrl: 'http://localhost:5173/wallet/payment-result'
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE',
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Deposit created:', depositResponse.data);
    
    // Test callback Momo cho deposit
    const callbackResponse = await axios.post('http://localhost:5000/api/wallet/momo-callback', {
      resultCode: '0',
      message: 'Success',
      orderId: 'DEPOSIT_' + Date.now(),
      amount: 50000,
      transId: 'TEST_DEPOSIT_TRANS_ID_' + Date.now()
    });

    console.log('✅ Deposit callback processed:', callbackResponse.data);
    
  } catch (error) {
    console.error('❌ Deposit test failed:', error.response?.data || error.message);
  }
}

// Chạy tests
async function runTests() {
  console.log('🚀 Starting Momo payment tests...\n');
  
  await testMomoDeposit();
  console.log('\n' + '='.repeat(50) + '\n');
  await testMomoPayment();
  
  console.log('\n✅ All tests completed!');
}

runTests(); 