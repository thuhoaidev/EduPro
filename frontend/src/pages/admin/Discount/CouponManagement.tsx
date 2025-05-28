import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Pagination,
  Popconfirm,
  Select,
  Modal,
  Form,
  DatePicker, // Import DatePicker
  InputNumber, // Import InputNumber cho Số lượng, Giá trị giảm giá
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs'; // Import dayjs để làm việc với ngày tháng

const { Option } = Select;

// Định nghĩa kiểu dữ liệu cho Coupon
interface Coupon {
  key: string;
  code: string;
  courseApplied: string; // Tên khóa học áp dụng (hoặc "Tất cả")
  type: 'amount' | 'percentage'; // Loại giảm giá: số tiền hay phần trăm
  value: number; // Giá trị giảm giá
  usedCount: number; // Số lượng đã sử dụng
  quantity: number; // Tổng số lượng
  createdAt: string; // Ngày tạo
  expiresAt: string; // Ngày hết hạn
}

const CouponManagement = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // 'asc' for Tăng dần, 'desc' for Giảm dần
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form] = Form.useForm();

  const [data, setData] = useState<Coupon[]>([]); // Dữ liệu mã giảm giá

  // Mock data cho danh sách khóa học (dùng trong select box)
  const courses = [
    { id: 'all', name: 'Tất cả khóa học' },
    { id: 'course-1', name: 'Khóa học React Nâng cao' },
    { id: 'course-2', name: 'Khóa học Node.js và API' },
    { id: 'course-3', name: 'Khóa học Python cho Data Science' },
    { id: 'course-4', name: 'Khóa học Thiết kế UI/UX cơ bản' },
  ];

  // Hàm để tạo mã ngẫu nhiên
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldsValue({ code: result });
  };

  // Tải dữ liệu mẫu khi component mount
  useEffect(() => {
    setData([
      {
        key: '1',
        code: 'GIAM10K',
        courseApplied: 'Tất cả khóa học',
        type: 'amount',
        value: 10000,
        usedCount: 5,
        quantity: 100,
        createdAt: '2025-05-01',
        expiresAt: '2025-06-30',
      },
      {
        key: '2',
        code: 'SALE20',
        courseApplied: 'Khóa học React Nâng cao',
        type: 'percentage',
        value: 20,
        usedCount: 10,
        quantity: 50,
        createdAt: '2025-04-15',
        expiresAt: '2025-05-31',
      },
      {
        key: '3',
        code: 'FREESHIP',
        courseApplied: 'Khóa học Node.js và API',
        type: 'amount',
        value: 0,
        usedCount: 2,
        quantity: 200,
        createdAt: '2025-05-10',
        expiresAt: '2025-07-15',
      },
      {
        key: '4',
        code: 'SUMMER30',
        courseApplied: 'Tất cả khóa học',
        type: 'percentage',
        value: 30,
        usedCount: 1,
        quantity: 30,
        createdAt: '2025-05-20',
        expiresAt: '2025-08-31',
      },
      {
        key: '5',
        code: 'VIPMEMBER',
        courseApplied: 'Khóa học Python cho Data Science',
        type: 'amount',
        value: 50000,
        usedCount: 0,
        quantity: 5,
        createdAt: '2025-05-22',
        expiresAt: '2025-12-31',
      },
      {
        key: '6',
        code: 'NEWSTUDENT',
        courseApplied: 'Khóa học Thiết kế UI/UX cơ bản',
        type: 'percentage',
        value: 15,
        usedCount: 3,
        quantity: 70,
        createdAt: '2025-04-01',
        expiresAt: '2025-06-15',
      },
    ]);
  }, []);

  // Lọc dữ liệu theo tìm kiếm
  const filteredData = data.filter((item) =>
    item.code.toLowerCase().includes(searchText.toLowerCase()) ||
    item.courseApplied.toLowerCase().includes(searchText.toLowerCase())
  );

  // Sắp xếp dữ liệu theo giá trị giảm
  const sortedData = [...filteredData].sort((a, b) => {
    const valA = a.value;
    const valB = b.value;
    if (sortOrder === 'asc') {
      return valA - valB;
    } else {
      return valB - valA;
    }
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
    setCurrentPage(1);
  };

  const showAddModal = () => {
    setEditingCoupon(null);
    form.resetFields();
    // Đặt giá trị mặc định cho ngày bắt đầu là ngày hiện tại
    form.setFieldsValue({
      startDate: dayjs(), // Ant Design DatePicker cần object dayjs
      type: 'amount', // Mặc định là số tiền
      value: 0,
      quantity: 1
    });
    setIsModalVisible(true);
  };

  const showEditModal = (record: Coupon) => {
    setEditingCoupon(record);
    form.setFieldsValue({
      code: record.code,
      courseId: courses.find(c => c.name === record.courseApplied)?.id || 'all', // Tìm ID của khóa học
      type: record.type,
      value: record.value,
      startDate: dayjs(record.createdAt), // Chuyển đổi chuỗi ngày thành dayjs object
      endDate: record.expiresAt ? dayjs(record.expiresAt) : null, // Chuyển đổi chuỗi ngày thành dayjs object
      quantity: record.quantity,
    });
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        const selectedCourse = courses.find(c => c.id === values.courseId);
        const courseName = selectedCourse ? selectedCourse.name : '';

        const newOrUpdatedCoupon: Coupon = {
          key: editingCoupon ? editingCoupon.key : String(data.length + 1 + Math.random()),
          code: values.code,
          courseApplied: courseName,
          type: values.type,
          value: values.value,
          usedCount: editingCoupon ? editingCoupon.usedCount : 0, // Giữ nguyên số lượng đã sử dụng khi chỉnh sửa
          quantity: values.quantity,
          createdAt: editingCoupon ? editingCoupon.createdAt : dayjs().format('YYYY-MM-DD'), // Giữ nguyên ngày tạo khi chỉnh sửa
          expiresAt: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : '',
        };

        if (editingCoupon) {
          setData(
            data.map((item) =>
              item.key === newOrUpdatedCoupon.key ? newOrUpdatedCoupon : item
            )
          );
        } else {
          setData([...data, newOrUpdatedCoupon]);
        }
        setIsModalVisible(false);
        setEditingCoupon(null);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Xác thực thất bại:', info);
      });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingCoupon(null);
    form.resetFields();
  };

  const handleDelete = (key: string) => {
    setData(data.filter(item => item.key !== key));
  };

  return (
    <div className="tw-p-6 tw-bg-white tw-rounded-xl tw-shadow-sm tw-min-h-screen">
      <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-justify-between tw-items-start sm:tw-items-center tw-gap-2 tw-mb-4">
        <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800">Quản lý mã giảm giá</h2>
        <Button
          type="default"
          className="tw-font-medium tw-border-blue-300 tw-text-blue-600 hover:tw-text-blue-700 hover:tw-border-blue-400 tw-h-10 tw-px-6 tw-rounded-md"
          icon={<PlusOutlined />}
          onClick={showAddModal}
        >
          Tạo Mã
        </Button>
      </div>

      <div className="tw-mb-6 tw-flex tw-items-center tw-gap-4">
        <Input
          placeholder="Tìm kiếm mã hoặc khóa học..."
          prefix={<SearchOutlined className="tw-text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="tw-w-full sm:tw-w-80 tw-rounded-md tw-border tw-border-gray-300 tw-py-2 tw-px-4 focus:tw-border-blue-500 focus:tw-ring-0 tw-shadow-none"
          style={{ height: '40px' }}
        />
        <Space>
          <span className="tw-text-sm tw-text-gray-700">Sắp xếp theo giá trị giảm:</span>
          <Select
            value={sortOrder}
            onChange={(value) => setSortOrder(value as 'asc' | 'desc')}
            size="middle"
            className="tw-w-32"
          >
            <Option value="asc">Tăng dần</Option>
            <Option value="desc">Giảm dần</Option>
          </Select>
        </Space>
      </div>

      <Table
        rowClassName={() => 'tw-h-16 hover:tw-bg-gray-100'}
        columns={[
          {
            title: <span className="tw-font-bold tw-text-gray-700">Mã</span>,
            dataIndex: 'code',
            key: 'code',
            onCell: () => ({ className: 'tw-font-medium' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Áp dụng khóa học</span>,
            dataIndex: 'courseApplied',
            key: 'courseApplied',
            onCell: () => ({ className: 'tw-text-sm' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Loại giảm giá</span>,
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            render: (type: 'amount' | 'percentage') => (
              type === 'amount' ? 'Số tiền' : 'Phần trăm'
            ),
            onCell: () => ({ className: 'tw-text-center' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Giá trị giảm</span>,
            dataIndex: 'value',
            key: 'value',
            align: 'center',
            render: (value: number, record: Coupon) => (
              record.type === 'percentage' ? `${value}%` : `${value.toLocaleString('vi-VN')} VNĐ`
            ),
            onCell: () => ({ className: 'tw-text-center' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Đã sử dụng</span>,
            dataIndex: 'usedCount',
            key: 'usedCount',
            align: 'center',
            onCell: () => ({ className: 'tw-text-center' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Số lượng</span>,
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            onCell: () => ({ className: 'tw-text-center' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Ngày tạo</span>,
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            onCell: () => ({ className: 'tw-text-center' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Ngày hết hạn</span>,
            dataIndex: 'expiresAt',
            key: 'expiresAt',
            align: 'center',
            onCell: () => ({ className: 'tw-text-center' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Hành động</span>,
            key: 'action',
            align: 'right',
            render: (_, record: Coupon) => (
              <Space size="middle">
                <Button
                  icon={<EditOutlined />}
                  type="link"
                  className="tw-text-blue-500 hover:tw-text-blue-700 tw-text-lg tw-p-1"
                  onClick={() => showEditModal(record)}
                />
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa mã giảm giá này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleDelete(record.key)}
                >
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    type="link"
                    className="tw-text-red-500 hover:tw-text-red-700 tw-text-lg tw-p-1"
                  />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
        dataSource={currentData}
        pagination={false}
        className="tw-border tw-border-gray-200 tw-rounded-lg"
      />

      <div className="tw-flex tw-justify-end tw-items-center tw-p-4 tw-bg-white tw-border-t tw-border-gray-200">
        <div className="tw-flex tw-items-center tw-space-x-2 tw-mr-4">
          <span className="tw-text-sm tw-text-gray-700">Số dòng trên trang:</span>
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

      <Modal
        title={<span className="tw-font-bold tw-text-lg">{editingCoupon ? 'Chỉnh sửa Mã giảm giá' : 'Tạo Mã giảm giá'}</span>}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        footer={[
          <Button key="back" onClick={handleModalCancel} className="tw-px-4 tw-py-2 tw-rounded-md tw-text-gray-700 tw-border tw-border-gray-300 hover:tw-bg-gray-50">
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk} className="tw-px-4 tw-py-2 tw-rounded-md tw-bg-blue-500 hover:tw-bg-blue-600 tw-border-none">
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="coupon_form"
        >
          <Form.Item
            name="code"
            label={<span className="tw-font-semibold">Mã giảm giá</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá!' }]}
            className="tw-mb-4"
          >
            <Input
              className="tw-rounded-md tw-border tw-border-gray-300 tw-py-2 tw-px-3"
              addonAfter={<Button type="text" onClick={generateRandomCode}>Tạo Ngẫu Nhiên</Button>}
            />
          </Form.Item>

          <Form.Item
            name="courseId"
            label={<span className="tw-font-semibold">Áp dụng cho khóa học:</span>}
            rules={[{ required: true, message: 'Vui lòng chọn khóa học!' }]}
            className="tw-mb-4"
          >
            <Select
              placeholder="Chọn khóa học"
              className="tw-w-full"
            >
              {courses.map(course => (
                <Option key={course.id} value={course.id}>{course.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label={<span className="tw-font-semibold">Loại giảm giá</span>}
            rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá!' }]}
            className="tw-mb-4"
          >
            <Select
              placeholder="Chọn loại giảm giá"
              className="tw-w-full"
              onChange={() => form.setFieldsValue({ value: 0 })} // Reset value when type changes
            >
              <Option value="amount">Số tiền</Option>
              <Option value="percentage">Phần trăm</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="value"
            label={<span className="tw-font-semibold">Giá trị giảm giá</span>}
            rules={[
                { required: true, message: 'Vui lòng nhập giá trị giảm giá!' },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                        const type = getFieldValue('type');
                        if (type === 'percentage' && (value < 0 || value > 100)) {
                            return Promise.reject(new Error('Giá trị phần trăm phải từ 0 đến 100!'));
                        }
                        if (type === 'amount' && value < 0) {
                            return Promise.reject(new Error('Giá trị số tiền không thể âm!'));
                        }
                        return Promise.resolve();
                    },
                }),
            ]}
            className="tw-mb-4"
          >
            <InputNumber
              min={0}
              max={form.getFieldValue('type') === 'percentage' ? 100 : undefined}
              addonAfter={form.getFieldValue('type') === 'percentage' ? '%' : 'VNĐ'}
              className="tw-w-full"
            />
          </Form.Item>

          <Form.Item
            name="startDate"
            label={<span className="tw-font-semibold">Ngày bắt đầu</span>}
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
            className="tw-mb-4"
          >
            <DatePicker
              showTime={{ format: 'HH:mm' }} // Cho phép chọn giờ và phút
              format="DD/MM/YYYY HH:mm"
              className="tw-w-full"
              placeholder="dd/mm/yyyy hh:mm AM/PM"
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label={<span className="tw-font-semibold">Ngày kết thúc</span>}
            className="tw-mb-4"
          >
            <DatePicker
              format="DD/MM/YYYY"
              className="tw-w-full"
              placeholder="dd/mm/yyyy"
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label={<span className="tw-font-semibold">Số lượng</span>}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
            className="tw-mb-4"
          >
            <InputNumber min={1} className="tw-w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponManagement;