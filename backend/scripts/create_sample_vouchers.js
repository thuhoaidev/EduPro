const mongoose = require('mongoose');
const Voucher = require('../src/models/Voucher');
require('dotenv').config();

const sampleVouchers = [
  {
    code: 'WELCOME50',
    title: 'Giảm 50% cho người mới',
    description: 'Áp dụng cho tất cả khóa học, tối đa 500K',
    discountType: 'percentage',
    discountValue: 50,
    maxDiscount: 500000,
    minOrderValue: 100000,
    usageLimit: 1000,
    usedCount: 234,
    categories: ['all'],
    tags: ['new-user'],
    isNew: true,
    isHot: true,
    isVipOnly: false,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31')
  },
  {
    code: 'FLASH200K',
    title: 'Giảm 200K cho khóa học IT',
    description: 'Áp dụng cho khóa học Công nghệ thông tin',
    discountType: 'fixed',
    discountValue: 200000,
    maxDiscount: 200000,
    minOrderValue: 500000,
    usageLimit: 500,
    usedCount: 156,
    categories: ['it-courses'],
    tags: ['flash-sale'],
    isNew: false,
    isHot: true,
    isVipOnly: false,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30')
  },
  {
    code: 'SUMMER30',
    title: 'Giảm 30% mùa hè',
    description: 'Áp dụng cho tất cả khóa học',
    discountType: 'percentage',
    discountValue: 30,
    maxDiscount: 300000,
    minOrderValue: 200000,
    usageLimit: 2000,
    usedCount: 892,
    categories: ['all'],
    tags: ['seasonal'],
    isNew: false,
    isHot: false,
    isVipOnly: false,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31')
  },
  {
    code: 'VIP100K',
    title: 'Giảm 100K cho VIP',
    description: 'Chỉ dành cho thành viên VIP',
    discountType: 'fixed',
    discountValue: 100000,
    maxDiscount: 100000,
    minOrderValue: 300000,
    usageLimit: 100,
    usedCount: 45,
    categories: ['all'],
    tags: ['vip'],
    isNew: false,
    isHot: false,
    isVipOnly: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31')
  },
  {
    code: 'EXPIRED50',
    title: 'Voucher đã hết hạn',
    description: 'Voucher này đã hết hạn để test',
    discountType: 'percentage',
    discountValue: 50,
    maxDiscount: 500000,
    minOrderValue: 100000,
    usageLimit: 100,
    usedCount: 0,
    categories: ['all'],
    tags: ['expired'],
    isNew: false,
    isHot: false,
    isVipOnly: false,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31') // Đã hết hạn
  },
  {
    code: 'FULLUSED',
    title: 'Voucher đã hết lượt',
    description: 'Voucher này đã hết lượt sử dụng',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 200000,
    minOrderValue: 100000,
    usageLimit: 10,
    usedCount: 10, // Đã hết lượt
    categories: ['all'],
    tags: ['full-used'],
    isNew: false,
    isHot: false,
    isVipOnly: false,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31')
  }
];

async function createSampleVouchers() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối với MongoDB');

    // Xóa voucher cũ nếu có
    await Voucher.deleteMany({ code: { $in: sampleVouchers.map(v => v.code) } });
    console.log('✅ Đã xóa voucher cũ');

    // Tạo voucher mới
    const createdVouchers = await Voucher.insertMany(sampleVouchers);
    console.log(`✅ Đã tạo ${createdVouchers.length} voucher mẫu`);

    // Hiển thị danh sách voucher đã tạo
    console.log('\n📋 Danh sách voucher đã tạo:');
    createdVouchers.forEach(voucher => {
      console.log(`- ${voucher.code}: ${voucher.title} (${voucher.discountValue}${voucher.discountType === 'percentage' ? '%' : 'đ'})`);
    });

    console.log('\n🎉 Hoàn thành tạo voucher mẫu!');
    console.log('Bạn có thể test các API sau:');
    console.log('- GET /api/vouchers (admin)');
    console.log('- GET /api/vouchers/available (client)');
    console.log('- POST /api/vouchers/validate (cần auth)');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy script
createSampleVouchers(); 