const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { Role } = require('./src/models/Role');

async function checkRole() {
  try {
    const roleId = '68515bd8e39706d32b125f89';
    
    console.log('🔍 Kiểm tra role với ID:', roleId);
    
    const role = await Role.findById(roleId);
    
    if (role) {
      console.log('✅ Role tìm thấy:');
      console.log('   - ID:', role._id);
      console.log('   - Tên:', role.name);
      console.log('   - Mô tả:', role.description);
      console.log('   - Permissions:', role.permissions);
      console.log('   - Active:', role.isActive);
    } else {
      console.log('❌ Role không tìm thấy với ID:', roleId);
      
      // Liệt kê tất cả roles có sẵn
      console.log('\n📋 Danh sách tất cả roles:');
      const allRoles = await Role.find();
      allRoles.forEach((r, index) => {
        console.log(`   ${index + 1}. ID: ${r._id}, Tên: ${r.name}`);
      });
    }
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkRole(); 