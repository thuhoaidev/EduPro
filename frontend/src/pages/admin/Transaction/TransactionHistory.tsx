import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Space,
  Pagination,
  Select,
  Dropdown, // Import Dropdown cho sắp xếp
  Menu, // Import Menu cho Dropdown
  Button, // Để làm nút Dropdown
} from 'antd';
import {
  SearchOutlined,
  CaretDownOutlined, // Biểu tượng mũi tên xuống cho dropdown sắp xếp
} from '@ant-design/icons';
import dayjs from 'dayjs'; // Để làm việc với ngày tháng

const { Option } = Select;

// Định nghĩa kiểu dữ liệu cho một giao dịch
interface Transaction {
  key: string;
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  courseName: string;
  transactionDate: string; // Ngày và giờ giao dịch
  status: 'Chưa thanh toán' | 'Đã thanh toán' | 'Đang xử lý' | 'Đã hủy'; // Trạng thái giao dịch
  paymentMethod: string;
  totalAmount: number;
}

const TransactionHistory = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null); // 'asc' for Tăng dần, 'desc' for Giảm dần, null for không sắp xếp
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10); // Mặc định 10 rows per page như hình ảnh

  const [data, setData] = useState<Transaction[]>([]);

  // Tải dữ liệu mẫu khi component mount
  useEffect(() => {
    setData([
      {
        key: '1',
        orderId: '677f79f917379af5b1248583',
        buyerName: 'Dương Đức Phương',
        buyerEmail: 'admin@gmail.com',
        courseName: 'Node & ExpressJS',
        transactionDate: 'lúc 14:57 10 tháng 4, 2025',
        status: 'Chưa thanh toán',
        paymentMethod: 'MOMO',
        totalAmount: 438999,
      },
      {
        key: '2',
        orderId: '681c614e406d5be55375137b',
        buyerName: 'Hoài Thu',
        buyerEmail: 'dev.thuhoai@gmail.com',
        courseName: 'Kiến Thức Môn IT',
        transactionDate: 'lúc 14:46 8 tháng 5, 2025',
        status: 'Chưa thanh toán',
        paymentMethod: 'MOMO',
        totalAmount: 8888,
      },
      {
        key: '3',
        orderId: '681c6e7da2632535939374ad0',
        buyerName: 'Hoài Thu',
        buyerEmail: 'dev.thuhoai@gmail.com',
        courseName: 'HTML CSS từ Zero đến Hero',
        transactionDate: 'lúc 15:42 8 tháng 5, 2025',
        status: 'Chưa thanh toán',
        paymentMethod: 'MOMO',
        totalAmount: 2000,
      },
      {
        key: '4',
        orderId: '681dc133ec0838ab17e80f94',
        buyerName: 'thế hung',
        buyerEmail: 'hungtph51987@gmail.com',
        courseName: 'HTML CSS1',
        transactionDate: 'lúc 15:47 9 tháng 5, 2025',
        status: 'Chưa thanh toán',
        paymentMethod: 'MOMO',
        totalAmount: 10000,
      },
      {
        key: '5',
        orderId: 'abc123def456ghi789jkl0mn',
        buyerName: 'Nguyễn Văn A',
        buyerEmail: 'nguyenvana@gmail.com',
        courseName: 'Khóa học React Native',
        transactionDate: 'lúc 10:00 12 tháng 4, 2025',
        status: 'Đã thanh toán',
        paymentMethod: 'ZaloPay',
        totalAmount: 500000,
      },
      {
        key: '6',
        orderId: 'opq987rst654uvw321xyz123',
        buyerName: 'Trần Thị B',
        buyerEmail: 'tranthib@gmail.com',
        courseName: 'Lập trình Python cơ bản',
        transactionDate: 'lúc 09:30 11 tháng 5, 2025',
        status: 'Đã thanh toán',
        paymentMethod: 'Bank Transfer',
        totalAmount: 250000,
      },
    ]);
  }, []);

  // Lọc dữ liệu
  const filteredData = data.filter((item) => {
    const matchesSearchText = item.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
                              item.buyerName.toLowerCase().includes(searchText.toLowerCase()) ||
                              item.courseName.toLowerCase().includes(searchText.toLowerCase());

    const matchesMinAmount = minAmount === null || item.totalAmount >= minAmount;
    const matchesMaxAmount = maxAmount === null || item.totalAmount <= maxAmount;

    return matchesSearchText && matchesMinAmount && matchesMaxAmount;
  });

  // Sắp xếp dữ liệu
  const sortedData = [...filteredData].sort((a, b) => {
    // Để sắp xếp theo ngày, bạn cần chuyển đổi chuỗi ngày sang đối tượng Date hoặc dayjs
    // Ví dụ: "lúc 14:57 10 tháng 4, 2025" cần được parse đúng
    // Tạm thời, tôi sẽ sắp xếp theo TotalAmount như trong hình ảnh "Sắp xếp giá"
    const amountA = a.totalAmount;
    const amountB = b.totalAmount;

    if (sortOrder === 'asc') {
      return amountA - amountB;
    } else if (sortOrder === 'desc') {
      return amountB - amountA;
    }
    return 0; // Không sắp xếp nếu sortOrder là null
  });

  // Phân trang dữ liệu
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi số lượng dòng
  };

  const sortMenu = (
    <Menu onClick={({ key }) => setSortOrder(key as 'asc' | 'desc' | null)}>
      <Menu.Item key="asc">Giá tăng dần</Menu.Item>
      <Menu.Item key="desc">Giá giảm dần</Menu.Item>
    </Menu>
  );

  return (
    <div className="tw-p-6 tw-bg-white tw-rounded-xl tw-shadow-sm tw-min-h-screen">
      {/* Breadcrumb */}
      <div className="tw-mb-6 tw-text-gray-500 tw-text-sm">
        Home / Admin / Transaction / <span className="tw-font-medium tw-text-gray-700">History</span>
      </div>

      <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-4">Đây là trang lịch sử giao dịch</h2>

      {/* Filter and Sort Section */}
      <div className="tw-mb-6 tw-flex tw-flex-wrap tw-items-center tw-gap-4">
        <Input
          placeholder="Tìm kiếm ID Đơn Hàng"
          prefix={<SearchOutlined className="tw-text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="tw-w-full sm:tw-w-60 tw-rounded-md tw-border tw-border-gray-300 tw-py-2 tw-px-4 focus:tw-border-blue-500 focus:tw-ring-0 tw-shadow-none"
          style={{ height: '40px' }}
        />
        <Input
          placeholder="Giá tối thiểu"
          type="number"
          value={minAmount === null ? '' : minAmount}
          onChange={(e) => setMinAmount(e.target.value ? parseFloat(e.target.value) : null)}
          className="tw-w-full sm:tw-w-40 tw-rounded-md tw-border tw-border-gray-300 tw-py-2 tw-px-4 focus:tw-border-blue-500 focus:tw-ring-0 tw-shadow-none"
          style={{ height: '40px' }}
        />
        <Input
          placeholder="Giá tối đa"
          type="number"
          value={maxAmount === null ? '' : maxAmount}
          onChange={(e) => setMaxAmount(e.target.value ? parseFloat(e.target.value) : null)}
          className="tw-w-full sm:tw-w-40 tw-rounded-md tw-border tw-border-gray-300 tw-py-2 tw-px-4 focus:tw-border-blue-500 focus:tw-ring-0 tw-shadow-none"
          style={{ height: '40px' }}
        />
        <Dropdown overlay={sortMenu} trigger={['click']}>
          <Button className="tw-rounded-md tw-border tw-border-gray-300 tw-py-2 tw-px-4 tw-h-10 tw-flex tw-items-center tw-justify-between">
            Sắp xếp giá <CaretDownOutlined />
          </Button>
        </Dropdown>
      </div>

      {/* Table */}
      <Table
        rowClassName={() => 'tw-h-16 hover:tw-bg-gray-100'}
        columns={[
          {
            title: <span className="tw-font-bold tw-text-gray-700">ID Đơn Hàng</span>,
            dataIndex: 'orderId',
            key: 'orderId',
            onCell: () => ({ className: 'tw-font-medium' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Người Mua</span>,
            dataIndex: 'buyerName',
            key: 'buyer',
            render: (_, record) => (
              <div>
                <div className="tw-font-medium">{record.buyerName}</div>
                <div className="tw-text-sm tw-text-gray-500">{record.buyerEmail}</div>
              </div>
            ),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Khóa Học Mua</span>,
            dataIndex: 'courseName',
            key: 'courseName',
            render: (text) => (
              <div className="tw-flex tw-items-center tw-gap-2">
                {/* Bạn có thể thêm avatar khóa học ở đây nếu có */}
                <span className="tw-block tw-w-8 tw-h-8 tw-rounded-full tw-bg-blue-200 tw-flex tw-items-center tw-justify-center tw-text-blue-700 tw-text-xs tw-font-bold">
                    KH
                </span> {/* Placeholder for course avatar */}
                <span className="tw-font-medium">{text}</span>
              </div>
            ),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Ngày Mua</span>,
            dataIndex: 'transactionDate',
            key: 'transactionDate',
            align: 'center',
            onCell: () => ({ className: 'tw-text-center' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Trạng Thái</span>,
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status: Transaction['status']) => (
              <span
                className={`
                  tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold
                  ${status === 'Chưa thanh toán' ? 'tw-bg-yellow-100 tw-text-yellow-700' : ''}
                  ${status === 'Đã thanh toán' ? 'tw-bg-green-100 tw-text-green-700' : ''}
                  ${status === 'Đang xử lý' ? 'tw-bg-blue-100 tw-text-blue-700' : ''}
                  ${status === 'Đã hủy' ? 'tw-bg-red-100 tw-text-red-700' : ''}
                `}
              >
                {status}
              </span>
            ),
            onCell: () => ({ className: 'tw-text-center' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Phương Thức Thanh Toán</span>,
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            align: 'center',
            onCell: () => ({ className: 'tw-text-center' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Tổng Tiền</span>,
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'right',
            render: (amount: number) => (
              <span className="tw-font-semibold">
                {amount.toLocaleString('vi-VN')} đ
              </span>
            ),
            onCell: () => ({ className: 'tw-text-right' }),
          },
        ]}
        dataSource={currentData}
        pagination={false} // Tắt pagination mặc định của Ant Design Table
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
            className="custom-pagination" // Thêm class để tùy chỉnh nếu cần
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;