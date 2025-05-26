import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Space,
  Pagination,
  Select,
  Button,
  Popconfirm,
  message,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const { Option } = Select;

// Định nghĩa kiểu dữ liệu cho một quản trị viên
interface AdminUser {
  key: string;
  avatarUrl: string;
  name: string;
  email: string;
  phoneNumber: string;
  adminRole: 'admin' | 'quản trị viên'; // Chỉ cho phép 2 giá trị này
}

const AdminList: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [data, setData] = useState<AdminUser[]>([]);

  const navigate = useNavigate();

  // Dữ liệu quản trị viên mẫu
  useEffect(() => {
    setData([
      {
        key: 'admin1',
        avatarUrl: 'https://via.placeholder.com/40/ADD8E6/00008B?text=DP',
        name: 'Dương Đức Phương',
        email: 'admin@gmail.com',
        phoneNumber: '?????????',
        adminRole: 'admin', // Vai trò 'admin'
      },
      {
        key: 'admin2',
        avatarUrl: 'https://via.placeholder.com/40/FFD700/8B0000?text=NA',
        name: 'Nguyễn Anh',
        email: 'nguyenanh@example.com',
        phoneNumber: '0987654321',
        adminRole: 'quản trị viên', // Vai trò 'quản trị viên'
      },
      {
        key: 'admin3',
        avatarUrl: 'https://via.placeholder.com/40/C0C0C0/4B0082?text=TV',
        name: 'Trần Văn',
        email: 'tranvan@example.com',
        phoneNumber: '0123456789',
        adminRole: 'quản trị viên', // Vai trò 'quản trị viên'
      },
      // Thêm các admin khác nếu cần
    ]);
  }, []);

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleViewDetails = (adminId: string) => {
    navigate(`/admin/users/admin/${adminId}`); // Điều hướng đến trang chi tiết admin
  };

  const handleDeleteAdmin = (adminId: string, role: 'admin' | 'quản trị viên') => {
    if (role === 'admin') {
      message.error('Không thể xóa quản trị viên có quyền "admin".');
      return;
    }
    // Logic xóa admin ở đây (trong thực tế: gọi API để xóa người dùng)
    setData(data.filter((admin) => admin.key !== adminId));
    message.success(`Đã xóa quản trị viên có ID: ${adminId}`);
  };

  return (
    <div className="tw-p-6 tw-bg-white tw-rounded-xl tw-shadow-sm tw-min-h-screen">
      {/* Breadcrumb */}
      <div className="tw-mb-6 tw-text-gray-500 tw-text-sm">
        <Link to="/" className="tw-text-blue-600 hover:tw-text-blue-800">Home</Link> /
        <Link to="/admin" className="tw-text-blue-600 hover:tw-text-blue-800"> Admin</Link> /
        <span className="tw-font-medium tw-text-gray-700"> Hr</span>
      </div>

      <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-4">Đây là trang danh sách admin</h2>

      {/* Search Input */}
      <div className="tw-mb-6">
        <Input
          placeholder="Tìm kiếm theo tên"
          prefix={<SearchOutlined className="tw-text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="tw-w-full sm:tw-w-80 tw-rounded-md tw-border tw-border-gray-300 tw-py-2 tw-px-4 focus:tw-border-blue-500 focus:tw-ring-0 tw-shadow-none"
          style={{ height: '40px' }}
        />
      </div>

      {/* Table */}
      <Table
        rowClassName={() => 'tw-h-16 hover:tw-bg-gray-100'}
        columns={[
          {
            title: <span className="tw-font-bold tw-text-gray-700">Avatar</span>,
            dataIndex: 'avatarUrl',
            key: 'avatarUrl',
            render: (url: string, record: AdminUser) => (
              <img
                src={url}
                alt={record.name}
                className="tw-w-10 tw-h-10 tw-rounded-full tw-object-cover"
              />
            ),
            align: 'center',
            onCell: () => ({ className: 'tw-text-center' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Tên</span>,
            dataIndex: 'name',
            key: 'name',
            onCell: () => ({ className: 'tw-font-medium' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Email</span>,
            dataIndex: 'email',
            key: 'email',
            onCell: () => ({ className: 'tw-text-gray-600' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Số điện thoại</span>,
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            onCell: () => ({ className: 'tw-text-gray-600' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Quyền Quản Trị</span>,
            dataIndex: 'adminRole',
            key: 'adminRole',
            onCell: () => ({ className: 'tw-text-gray-600' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Hành động</span>,
            key: 'action',
            align: 'center',
            render: (_, record: AdminUser) => (
              <Space size="middle">
                <Button
                  icon={<EyeOutlined />}
                  type="link"
                  className="tw-text-blue-500 hover:tw-text-blue-700 tw-text-lg tw-p-1"
                  onClick={() => handleViewDetails(record.key)}
                />
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa quản trị viên này?"
                  onConfirm={() => handleDeleteAdmin(record.key, record.adminRole)}
                  okText="Xóa"
                  cancelText="Hủy"
                  disabled={record.adminRole === 'admin'} // Vô hiệu hóa xóa cho vai trò 'admin'
                >
                  <Button
                    icon={<DeleteOutlined />}
                    type="link"
                    danger
                    className={`tw-text-lg tw-p-1 ${record.adminRole === 'admin' ? 'tw-text-gray-400 tw-cursor-not-allowed' : 'tw-text-red-500 hover:tw-text-red-700'}`}
                    disabled={record.adminRole === 'admin'} // Vô hiệu hóa nút
                  />
                </Popconfirm>
              </Space>
            ),
            onCell: () => ({ className: 'tw-text-center' }),
          },
        ]}
        dataSource={currentData}
        pagination={false}
        className="tw-border tw-border-gray-200 tw-rounded-lg"
      />

      {/* Custom Pagination */}
      <div className="tw-flex tw-justify-end tw-items-center tw-p-4 tw-bg-white tw-border-t tw-border-gray-200">
        <div className="tw-flex tw-items-center tw-space-x-2 tw-mr-4">
          <span className="tw-text-sm tw-text-gray-700">Rows per page:</span>
          <Select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            size="small"
            className="tw-w-16"
          >
            <Option value={5}>5</Option>
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
          </Select>
        </div>
        <div className="tw-flex tw-items-center tw-space-x-10">
          <span className="tw-text-sm tw-text-gray-700">
            {startIndex + (currentData.length > 0 ? 1 : 0)}-{endIndex > filteredData.length ? filteredData.length : endIndex} of {filteredData.length}
          </span>
          <Pagination
            current={currentPage}
            pageSize={rowsPerPage}
            total={filteredData.length}
            onChange={handlePageChange}
            showSizeChanger={false}
            simple
            className="custom-pagination"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminList;