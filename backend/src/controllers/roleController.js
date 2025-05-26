const Role = require('../models/Role');
const User = require('../models/User');

// Lấy danh sách vai trò
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().select('-__v');
    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách vai trò:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách vai trò',
    });
  }
};

// Tạo vai trò mới
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Kiểm tra vai trò đã tồn tại chưa
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò này đã tồn tại',
      });
    }

    const role = await Role.create({
      name,
      description,
      permissions,
    });

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error('Lỗi tạo vai trò:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo vai trò',
    });
  }
};

// Cập nhật vai trò
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Kiểm tra vai trò có tồn tại không
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò',
      });
    }

    // Nếu đổi tên, kiểm tra tên mới có bị trùng không
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Tên vai trò này đã tồn tại',
        });
      }
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { name, description, permissions },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      data: updatedRole,
    });
  } catch (error) {
    console.error('Lỗi cập nhật vai trò:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật vai trò',
    });
  }
};

// Xóa vai trò
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra vai trò có tồn tại không
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò',
      });
    }

    // Kiểm tra xem có user nào đang sử dụng vai trò này không
    const usersWithRole = await User.findOne({ role_id: id });
    if (usersWithRole) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa vai trò này vì đang có người dùng sử dụng',
      });
    }

    await Role.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa vai trò thành công',
    });
  } catch (error) {
    console.error('Lỗi xóa vai trò:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa vai trò',
    });
  }
};

// Gán vai trò cho người dùng
exports.assignUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    // Kiểm tra user có tồn tại không
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Kiểm tra vai trò có tồn tại không
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò',
      });
    }

    // Cập nhật vai trò cho user
    user.role_id = roleId;
    // Nếu là giảng viên thì cần xét duyệt lại
    if (role.name === 'instructor') {
      user.approval_status = 'pending';
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật vai trò thành công',
      data: user,
    });
  } catch (error) {
    console.error('Lỗi gán vai trò:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi gán vai trò',
    });
  }
}; 