import React, { useState, useEffect } from 'react';
import { Card, Button, Space, message, Checkbox, Form, Input, Select } from 'antd';
import { useAuth } from '../../../contexts/AuthContext';
import { getRoles, updateRole } from '../../../services/roleService';
import type { Role } from '../../../services/roleService';

const { TextArea } = Input;
const { Option } = Select;

const TestRoleUpdate: React.FC = () => {
  const { forceReloadUser } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Danh sách permissions có sẵn
  const allPermissions = [
    'quản lý người dùng',
    'phân quyền người dùng',
    'khóa mở người dùng',
    'duyệt giảng viên',
    'quản lý khóa học',
    'quản lý bài viết',
    'quản lý bình luận',
    'quản lý danh mục',
    'quản lý vai trò',
    'quản lý voucher',
    'quản lý thanh toán',
    'quản lý báo cáo',
    'xem thống kê tổng quan',
    'xem thống kê doanh thu',
    'xem thống kê người dùng',
    'xem thống kê khóa học',
    'tạo khóa học',
    'chỉnh sửa khóa học',
    'xóa khóa học',
    'xuất bản khóa học',
    'tạo bài học',
    'chỉnh sửa bài học',
    'xóa bài học',
    'upload video',
    'tạo quiz',
    'chỉnh sửa quiz',
    'xem danh sách học viên',
    'xem tiến độ học viên',
    'gửi thông báo',
    'xem thống kê thu nhập',
    'rút tiền',
    'xem lịch sử giao dịch',
    'duyệt blog',
    'từ chối blog',
    'duyệt bình luận',
    'xóa bình luận',
    'xem báo cáo',
    'xử lý báo cáo',
    'cảnh báo người dùng'
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
      message.error('Không thể tải danh sách roles');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    setSelectedRole(role || null);
    if (role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        permissions: role.permissions
      });
    }
  };

  const handleUpdateRole = async (values: any) => {
    if (!selectedRole) return;

    try {
      setLoading(true);
      console.log('Updating role with data:', values);
      
      const response = await updateRole(selectedRole._id, {
        name: values.name,
        description: values.description,
        permissions: values.permissions
      });

      console.log('Role updated successfully:', response);
      message.success('Cập nhật role thành công!');

      // Force reload user data để cập nhật sidebar
      console.log('Force reloading user data...');
      await forceReloadUser();
      console.log('Force reload completed');
      message.info('Đã reload user data. Hãy kiểm tra sidebar!');

      // Reload roles list
      await loadRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      message.error('Không thể cập nhật role');
    } finally {
      setLoading(false);
    }
  };

  const handleForceReload = async () => {
    try {
      await forceReloadUser();
      message.success('Đã force reload user data!');
    } catch (error) {
      console.error('Error force reloading:', error);
      message.error('Không thể reload user data');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Test Role Update" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={handleForceReload} type="primary">
            Force Reload User Data
          </Button>
          <Button onClick={loadRoles} loading={loading}>
            Reload Roles
          </Button>
        </Space>
      </Card>

      <Card title="Select Role to Update">
        <Select
          style={{ width: '100%', marginBottom: '16px' }}
          placeholder="Chọn role để chỉnh sửa"
          onChange={handleRoleSelect}
          loading={loading}
        >
          {roles.map(role => (
            <Option key={role._id} value={role._id}>
              {role.name} - {role.permissions.length} permissions
            </Option>
          ))}
        </Select>

        {selectedRole && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateRole}
          >
            <Form.Item
              name="name"
              label="Tên role"
              rules={[{ required: true, message: 'Vui lòng nhập tên role' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item
              name="permissions"
              label="Quyền hạn"
            >
              <Checkbox.Group style={{ width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {allPermissions.map(permission => (
                    <Checkbox key={permission} value={permission}>
                      {permission}
                    </Checkbox>
                  ))}
                </div>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật Role
                </Button>
                <Button onClick={() => setSelectedRole(null)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default TestRoleUpdate; 