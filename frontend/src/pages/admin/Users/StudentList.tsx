import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Space,
  Pagination,
  Select,
  Button,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

const { Option } = Select;

interface User {
  key: string;
  avatarUrl: string;
  name: string;
  email: string;
  phoneNumber: string;
}

const StudentList: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const [data, setData] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setData([
      {
        key: '1',
        avatarUrl: 'https://via.placeholder.com/40/ADD8E6/00008B?text=DP',
        name: 'Dương Đức Phương',
        email: 'phuongddph40819@fpt.edu.vn',
        phoneNumber: '0354179061',
      },
      {
        key: '2',
        avatarUrl: 'https://via.placeholder.com/40/ADD8E6/00008B?text=NM',
        name: 'Nguyễn Quang Minh',
        email: 'minhdaoho@gmail.com',
        phoneNumber: 'N/A',
      },
      {
        key: '3',
        avatarUrl: 'https://via.placeholder.com/40/ADD8E6/00008B?text=TK',
        name: 'Trần Đức Khoa',
        email: 'khoatdph50040@gmail.com',
        phoneNumber: 'N/A',
      },
      {
        key: '4',
        avatarUrl: 'https://via.placeholder.com/40/ADD8E6/00008B?text=TH',
        name: 'Nguyễn Trung Hiếu',
        email: 'nguyenthieu11a7@gmail.com',
        phoneNumber: 'N/A',
      },
      {
        key: '5',
        avatarUrl: 'https://via.placeholder.com/40/ADD8E6/00008B?text=DB',
        name: 'Đỗ Xuân Bắc',
        email: 'thanhnha041225@gmail.com',
        phoneNumber: 'N/A',
      },
      {
        key: '6',
        avatarUrl: 'https://via.placeholder.com/40/ADD8E6/00008B?text=VV',
        name: 'Nguyễn Văn V',
        email: 'nguyenvana@gmail.com',
        phoneNumber: '0912345678',
      },
      {
        key: '7',
        avatarUrl: 'https://via.placeholder.com/40/ADD8E6/00008B?text=TL',
        name: 'Lê Thị L',
        email: 'lethil@gmail.com',
        phoneNumber: 'N/A',
      },
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

  const handleViewDetails = (userId: string) => {
    // Điều hướng đến đường dẫn đã cấu hình trong App.tsx: /admin/users/student/:id
    navigate(`/admin/users/student/${userId}`);
  };

  return (
    <div className="tw-p-6 tw-bg-white tw-rounded-xl tw-shadow-sm tw-min-h-screen">
      {/* Breadcrumb - Cập nhật đường dẫn */}
      <div className="tw-mb-6 tw-text-gray-500 tw-text-sm">
        <Link to="/" className="tw-text-blue-600 hover:tw-text-blue-800">Home</Link> /
        <Link to="/admin" className="tw-text-blue-600 hover:tw-text-blue-800"> Admin</Link> /
        <span className="tw-font-medium tw-text-gray-700"> Student-list</span>
      </div>

      <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-4">Đây là trang chi danh sách người dùng</h2>

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

      <Table
        rowClassName={() => 'tw-h-16 hover:tw-bg-gray-100'}
        columns={[
          {
            title: <span className="tw-font-bold tw-text-gray-700">Avatar</span>,
            dataIndex: 'avatarUrl',
            key: 'avatarUrl',
            render: (url: string, record: User) => (
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
            title: <span className="tw-font-bold tw-text-gray-700">Địa chỉ Email</span>,
            dataIndex: 'email',
            key: 'email',
            onCell: () => ({ className: 'tw-text-gray-600' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Số Điện thoại</span>,
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            onCell: () => ({ className: 'tw-text-gray-600' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Hành động</span>,
            key: 'action',
            align: 'center',
            render: (_, record: User) => (
              <Space size="middle">
                <Button
                  icon={<EyeOutlined />}
                  type="link"
                  className="tw-text-blue-500 hover:tw-text-blue-700 tw-text-lg tw-p-1"
                  onClick={() => handleViewDetails(record.key)}
                />
              </Space>
            ),
            onCell: () => ({ className: 'tw-text-center' }),
          },
        ]}
        dataSource={currentData}
        pagination={false}
        className="tw-border tw-border-gray-200 tw-rounded-lg"
      />

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

export default StudentList;