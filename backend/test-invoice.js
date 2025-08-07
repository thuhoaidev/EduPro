const mongoose = require('mongoose');
const Invoice = require('./src/models/Invoice');
const WithdrawRequest = require('./src/models/WithdrawRequest');
const User = require('./src/models/User');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000
})
.then(() => console.log('Đã kết nối với MongoDB'))
.catch((err) => {
  console.error('Lỗi kết nối MongoDB:', err);
  process.exit(1);
});

async function testInvoiceSystem() {
  try {
    console.log('=== TEST HỆ THỐNG HÓA ĐƠN ===\n');

    // 1. Kiểm tra collection Invoice
    console.log('1. Kiểm tra collection Invoice...');
    const invoiceCount = await Invoice.countDocuments();
    console.log(`   - Số lượng hóa đơn hiện có: ${invoiceCount}`);

    // 2. Lấy danh sách hóa đơn gần đây
    console.log('\n2. Danh sách hóa đơn gần đây:');
    const recentInvoices = await Invoice.find()
      .populate('teacherId', 'fullname email')
      .populate('withdrawRequestId')
      .sort({ issuedAt: -1 })
      .limit(5);

    if (recentInvoices.length === 0) {
      console.log('   - Chưa có hóa đơn nào');
    } else {
      recentInvoices.forEach((invoice, index) => {
        console.log(`   ${index + 1}. ${invoice.invoiceNumber} - ${invoice.teacherId?.fullname} - ${invoice.amount?.toLocaleString('vi-VN')} VNĐ`);
      });
    }

    // 3. Kiểm tra yêu cầu rút tiền đã duyệt
    console.log('\n3. Kiểm tra yêu cầu rút tiền đã duyệt:');
    const approvedRequests = await WithdrawRequest.find({ status: 'approved' })
      .populate('teacherId', 'fullname email')
      .sort({ approvedAt: -1 })
      .limit(5);

    if (approvedRequests.length === 0) {
      console.log('   - Chưa có yêu cầu rút tiền nào được duyệt');
    } else {
      approvedRequests.forEach((request, index) => {
        console.log(`   ${index + 1}. ${request.teacherId?.fullname} - ${request.amount?.toLocaleString('vi-VN')} VNĐ - ${request.approvedAt?.toLocaleDateString('vi-VN')}`);
      });
    }

    // 4. Thống kê tổng quan
    console.log('\n4. Thống kê tổng quan:');
    
    // Tổng hóa đơn
    const totalInvoices = await Invoice.countDocuments();
    console.log(`   - Tổng số hóa đơn: ${totalInvoices}`);

    // Tổng tiền
    const totalAmount = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    console.log(`   - Tổng tiền rút: ${(totalAmount[0]?.total || 0).toLocaleString('vi-VN')} VNĐ`);

    // Hóa đơn tháng này
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthInvoices = await Invoice.countDocuments({
      issuedAt: { $gte: thisMonth }
    });
    console.log(`   - Hóa đơn tháng này: ${thisMonthInvoices}`);

    // Số giảng viên có hóa đơn
    const uniqueTeachers = await Invoice.distinct('teacherId');
    console.log(`   - Số giảng viên có hóa đơn: ${uniqueTeachers.length}`);

    // 5. Kiểm tra file PDF
    console.log('\n5. Kiểm tra file PDF:');
    const invoicesWithFiles = await Invoice.find({ file: { $exists: true, $ne: null } });
    console.log(`   - Hóa đơn có file PDF: ${invoicesWithFiles.length}/${totalInvoices}`);

    if (invoicesWithFiles.length > 0) {
      console.log('   - Danh sách file PDF:');
      invoicesWithFiles.slice(0, 3).forEach((invoice, index) => {
        console.log(`     ${index + 1}. ${invoice.file}`);
      });
    }

    // 6. Kiểm tra tính nhất quán dữ liệu
    console.log('\n6. Kiểm tra tính nhất quán dữ liệu:');
    
    // Kiểm tra hóa đơn không có withdrawRequestId
    const invoicesWithoutRequest = await Invoice.find({ withdrawRequestId: { $exists: false } });
    console.log(`   - Hóa đơn không có withdrawRequestId: ${invoicesWithoutRequest.length}`);

    // Kiểm tra withdrawRequest đã duyệt nhưng không có hóa đơn
    const approvedWithoutInvoice = await WithdrawRequest.find({ 
      status: 'approved',
      approvedAt: { $exists: true, $ne: null }
    });
    
    const requestsWithInvoices = await Invoice.distinct('withdrawRequestId');
    const approvedRequestIds = approvedWithoutInvoice.map(r => r._id.toString());
    const missingInvoices = approvedRequestIds.filter(id => !requestsWithInvoices.includes(id));
    
    console.log(`   - Yêu cầu đã duyệt nhưng chưa có hóa đơn: ${missingInvoices.length}`);

    if (missingInvoices.length > 0) {
      console.log('   - Danh sách ID yêu cầu thiếu hóa đơn:');
      missingInvoices.slice(0, 5).forEach((id, index) => {
        console.log(`     ${index + 1}. ${id}`);
      });
    }

    console.log('\n=== KẾT THÚC TEST ===');

  } catch (error) {
    console.error('Lỗi trong quá trình test:', error);
  } finally {
    mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB');
  }
}

// Chạy test
testInvoiceSystem(); 