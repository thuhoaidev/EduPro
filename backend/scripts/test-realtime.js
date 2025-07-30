const io = require('socket.io-client');

// Kết nối đến server
const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling']
});

console.log('🔌 Đang kết nối đến server...');

socket.on('connect', () => {
  console.log('✅ Đã kết nối thành công!');
  console.log('Socket ID:', socket.id);
  
  // Test emit email verification event
  console.log('\n📧 Testing email verification event...');
  socket.emit('email-verification-completed', {
    token: 'test-token-123',
    isInstructor: true,
    userEmail: 'test@example.com'
  });
  
  // Test emit instructor approval event
  setTimeout(() => {
    console.log('\n👨‍🏫 Testing instructor approval event...');
    socket.emit('instructor-approved', {
      userId: 'test-user-id',
      email: 'instructor@example.com',
      fullname: 'Test Instructor',
      status: 'approved',
      approvedBy: 'admin-id',
      timestamp: new Date()
    });
  }, 2000);
  
  // Test emit instructor rejection event
  setTimeout(() => {
    console.log('\n❌ Testing instructor rejection event...');
    socket.emit('instructor-approved', {
      userId: 'test-user-id-2',
      email: 'instructor2@example.com',
      fullname: 'Test Instructor 2',
      status: 'rejected',
      rejection_reason: 'Thiếu thông tin chuyên môn',
      approvedBy: 'admin-id',
      timestamp: new Date()
    });
  }, 4000);
});

socket.on('email-verified', (data) => {
  console.log('📧 Received email-verified event:', data);
});

socket.on('instructor-approved', (data) => {
  console.log('👨‍🏫 Received instructor-approved event:', data);
});

socket.on('new-notification', (data) => {
  console.log('🔔 Received new-notification event:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Đã ngắt kết nối');
});

socket.on('connect_error', (error) => {
  console.error('❌ Lỗi kết nối:', error.message);
});

// Cleanup sau 10 giây
setTimeout(() => {
  console.log('\n🔄 Disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 10000);