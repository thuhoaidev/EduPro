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
  DatePicker,
  InputNumber,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  message
} from 'antd';
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import type { Coupon } from "../../../interfaces/Admin.interface";


const { Option } = Select;


const VouchersPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage] = useState<number>(8); // Increased default pageSize and removed unused setter
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form] = Form.useForm();
  const [data, setData] = useState<Coupon[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');

  // Danh sách khóa học giả lập dùng trong Select
  const courses = [
    { id: 'all', name: 'Tất cả khóa học' },
    { id: 'course-1', name: 'Khóa học React Nâng cao' },
    { id: 'course-2', name: 'Khóa học Node.js và API' },
    { id: 'course-3', name: 'Khóa học Python cho Data Science' },
    { id: 'course-4', name: 'Khóa học Thiết kế UI/UX cơ bản' },
  ];

  // Initial mock data with correct structure
  const initialMockData: Coupon[] = [
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
      code: 'FREECOURSE',
      courseApplied: 'Khóa học Node.js và API',
      type: 'amount',
      value: 100,
      usedCount: 50,
      quantity: 50,
      createdAt: '2024-01-01',
      expiresAt: '2024-02-01', // Expired
    },
     {
      key: '4',
      code: 'NEWUSER',
      courseApplied: 'Tất cả khóa học',
      type: 'percentage',
      value: 15,
      usedCount: 0,
      quantity: 200,
      createdAt: '2025-05-20',
      expiresAt: '', // No expiry
    },
  ];


  useEffect(() => {
    // Simulate fetching data
    setData(initialMockData);
  }, []);

  const isCouponActive = (coupon: Coupon) => {
    if (!coupon.expiresAt) return true; // No expiry date
    // Check if expiresAt is a valid date string before parsing
    const expiryDate = dayjs(coupon.expiresAt);
    return expiryDate.isValid() ? dayjs().isBefore(expiryDate) : true; // Assume active if date is invalid
  };

  // Lọc theo tìm kiếm và trạng thái
  const filteredData = data.filter((item) => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchText.toLowerCase()) ||
      item.courseApplied.toLowerCase().includes(searchText.toLowerCase());
    
    const isActive = isCouponActive(item);
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && isActive) ||
      (filterStatus === 'expired' && !isActive);

    return matchesSearch && matchesStatus;
  });

  // Sắp xếp theo giá trị giảm
  const sortedData = [...filteredData].sort((a, b) =>
    sortOrder === 'asc' ? a.value - b.value : b.value - a.value
  );

  // Phân trang
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const showAddModal = () => {
    setEditingCoupon(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'amount',
      value: 0,
      quantity: 1,
      startDate: dayjs(),
      endDate: null,
      courseId: 'all',
    });
    setIsModalVisible(true);
  };

  const showEditModal = (record: Coupon) => {
    setEditingCoupon(record);
    form.setFieldsValue({
      code: record.code,
      courseId: courses.find(c => c.name === record.courseApplied)?.id || 'all',
      type: record.type,
      value: record.value,
      quantity: record.quantity,
      startDate: dayjs(record.createdAt), // Keep original creation date
      endDate: record.expiresAt ? dayjs(record.expiresAt) : null,
    });
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields()
      .then(values => {
        const courseName = courses.find(c => c.id === values.courseId)?.name || 'Tất cả khóa học';

        const newCoupon: Coupon = {
          key: editingCoupon ? editingCoupon.key : (data.length + 1 + Math.random()).toString(),
          code: values.code,
          courseApplied: courseName,
          type: values.type,
          value: values.value,
          usedCount: editingCoupon ? editingCoupon.usedCount : 0, // Keep usedCount for edit
          quantity: values.quantity,
          createdAt: editingCoupon ? editingCoupon.createdAt : dayjs().format('YYYY-MM-DD'), // Keep original creation date
          expiresAt: values.endDate ? values.endDate.format('YYYY-MM-DD') : '',
        };

        if (editingCoupon) {
          setData(data.map(item => item.key === newCoupon.key ? newCoupon : item));
        } else {
          setData([...data, newCoupon]);
        }

        setIsModalVisible(false);
        setEditingCoupon(null);
        form.resetFields();
        message.success(editingCoupon ? 'Cập nhật mã giảm giá thành công' : 'Tạo mã giảm giá thành công');
      })
      .catch(err => {
        console.log('Validate Failed:', err);
        message.error('Vui lòng kiểm tra lại thông tin');
      });
  };

  const handleDelete = (key: string) => {
    setData(data.filter(item => item.key !== key));
    message.success('Đã xóa mã giảm giá');
  };

   // Calculate statistics
   const stats = {
    total: data.length,
    active: data.filter(c => isCouponActive(c)).length,
    expired: data.filter(c => !isCouponActive(c)).length,
  };

   useEffect(() => {
    // Reset page to 1 when search or filter changes
    setCurrentPage(1);
  }, [searchText, filterStatus]);


  const columns: ColumnsType<Coupon> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      className: "font-medium text-gray-800",
    },
    {
      title: 'Áp dụng khóa học',
      dataIndex: 'courseApplied',
      key: 'courseApplied',
       className: "text-gray-600",
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      render: (type: 'amount' | 'percentage') =>
        type === 'amount' ? 'Số tiền' : 'Phần trăm',
       className: "text-gray-600 text-sm"
    },
    {
      title: 'Giá trị giảm',
      dataIndex: 'value',
      key: 'value',
      align: 'center',
      render: (value: number, record: Coupon) =>
        record.type === 'percentage'
          ? `${value}%`
          : `${value.toLocaleString('vi-VN')} VNĐ`,
       className: "font-semibold text-blue-600"
    },
    {
      title: 'Đã sử dụng / Số lượng',
      key: 'usage',
      align: 'center',
       className: "text-gray-600 text-sm",
       render: (_: void, record: Coupon) => `${record.usedCount} / ${record.quantity}`,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (_: void, record: Coupon) => {
        const isActive = isCouponActive(record);
        const statusConfig = isActive 
          ? { color: 'success' as const, icon: <CheckCircleOutlined />, text: 'Đang hoạt động' }
          : { color: 'error' as const, icon: <CloseCircleOutlined />, text: 'Đã hết hạn' };

        return (
           <Tag 
            color={statusConfig.color}
            icon={statusConfig.icon}
            className="px-2 py-1 rounded-full text-sm font-medium"
          >
            {statusConfig.text}
          </Tag>
        );
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
       className: "text-gray-600 text-sm"
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      align: 'center',
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : 'Không giới hạn'),
       className: "text-gray-600 text-sm"
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 120, // Adjusted width
      render: (_: void, record: Coupon) => (
        <Space size="small">
           <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              type="text"
              onClick={() => showEditModal(record)}
              className="tw-text-blue-600 flex items-center"
              size="small"
            />
          </Tooltip>
           <Popconfirm
            title="Bạn có chắc chắn muốn xóa mã này?"
            onConfirm={() => handleDelete(record.key)}
            okText="Có"
            cancelText="Hủy"
             okButtonProps={{ danger: true }}
          >
             <Tooltip title="Xóa">
                <Button
                  icon={<DeleteOutlined />}
                  type="text"
                  danger
                  className="tw-text-red-600 flex items-center"
                  size="small"
                />
             </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý mã giảm giá</h2>
          <p className="text-gray-500 mt-1">Tạo và quản lý các mã giảm giá cho khóa học</p>
        </div>
         <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={showAddModal}
          className="flex items-center font-medium px-4 py-2"
          size="large"
        >
          Tạo mã giảm giá
        </Button>
      </div>

       {/* Stats Cards */}
       <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng số mã"
              value={stats.total}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đã hết hạn"
              value={stats.expired}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm kiếm mã hoặc khóa học..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="max-w-sm"
            allowClear
          />
          <Select
            defaultValue="all"
            style={{ width: 180 }}
            onChange={value => setFilterStatus(value as 'all' | 'active' | 'expired')}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "active", label: "Đang hoạt động" },
              { value: "expired", label: "Đã hết hạn" },
            ]}
            suffixIcon={<FilterOutlined />}
          />
           <Space className="ml-auto">
              <span className="text-sm text-gray-700">Sắp xếp giá trị:</span>
              <Select
                value={sortOrder}
                onChange={value => setSortOrder(value as 'asc' | 'desc')}
                style={{ width: 120 }}
              >
                <Option value="asc">Tăng dần</Option>
                <Option value="desc">Giảm dần</Option>
              </Select>
            </Space>
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-sm">
        <Table
          rowKey="key"
          columns={columns as ColumnsType<Coupon>}
          dataSource={currentData}
          pagination={false}
          scroll={{ x: 1100 }}
          className="vouchers-table"
        />

        <div className="text-right mt-4 px-4">
          <Pagination
            current={currentPage}
            pageSize={rowsPerPage}
            total={filteredData.length} // Use filteredData.length for total
            onChange={page => setCurrentPage(page)}
            showSizeChanger={false}
            showTotal={(total) => `Tổng số ${total} mã giảm giá`}
          />
        </div>
      </Card>

      <Modal
        title={<div className="text-xl font-semibold text-gray-800">{editingCoupon ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</div>}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCoupon(null);
          form.resetFields();
        }}
        okText={editingCoupon ? 'Lưu thay đổi' : 'Tạo mã'}
        cancelText="Hủy"
        destroyOnClose
        centered
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'amount',
            value: 0,
            quantity: 1,
            // startDate: dayjs(), // Handled in showAddModal/showEditModal
            // endDate: null, // Handled in showAddModal/showEditModal
            courseId: 'all',
          }}
        >
          <Form.Item
            label="Mã giảm giá"
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá' }]}
          >
            <Input placeholder="Nhập mã giảm giá" maxLength={20} disabled={!!editingCoupon} />
          </Form.Item>

          <Form.Item label="Khóa học áp dụng" name="courseId" rules={[{ required: true }]}>
            <Select>
              {courses.map(c => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Loại giảm giá" name="type" rules={[{ required: true }]}>
            <Select>
              <Option value="amount">Số tiền (VNĐ)</Option>
              <Option value="percentage">Phần trăm (%)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá trị giảm"
            name="value"
            rules={[
              { required: true, message: 'Vui lòng nhập giá trị giảm' },
              { type: 'number', min: 0, message: 'Giá trị không thể âm' },
            ]}
          >
        <InputNumber<number>
                style={{ width: '100%' }}
                min={0}
                placeholder="Nhập giá trị giảm"
                formatter={(value) => {
                if (value === null || value === undefined) return '';
                const type = form.getFieldValue('type');
                return type === 'percentage' ? `${value}%` : `${value} VNĐ`;
             }}
             parser={(value) => {
               if (!value) return 0;
               return Number(value.replace('%', '').replace(' VNĐ', '').replace(/,/g, '')); // Handle commas
            }}
/>
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="Nhập số lượng" />
          </Form.Item>

          <Form.Item label="Ngày tạo" name="startDate" rules={[{ required: true }]}>
            <DatePicker
              style={{ width: '100%' }}
              disabled // Creation date is not editable after creation
              format="YYYY-MM-DD"
              placeholder="Ngày tạo"
            />
          </Form.Item>

          <Form.Item label="Ngày hết hạn" name="endDate">
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD" 
              placeholder="Chọn ngày hết hạn (Không bắt buộc)"
              disabledDate={current => current && current < dayjs().startOf('day')} // Disable past dates
            />
          </Form.Item>
        </Form>
      </Modal>

       {/* Custom styles */}
       <style>
        {`
          .vouchers-table .ant-table-thead > tr > th {
            background: #fafafa;
            font-weight: 600;
            color: #1f2937;
          }
          .vouchers-table .ant-table-tbody > tr:hover > td {
            background: #f5f7fa;
          }
           .vouchers-table .ant-table-tbody > tr > td {
            padding: 12px 8px;
          }
          .ant-tag {
            margin: 0;
          }
          .ant-form-item-label > label {
            font-weight: 500;
          }
        `}
      </style>
    </div>
  );
};

export default VouchersPage;
