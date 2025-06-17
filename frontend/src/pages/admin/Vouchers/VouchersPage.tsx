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
import voucherService from '../../../services/voucher.service';
import type { Voucher, CreateVoucherData } from '../../../services/voucher.service';

const { Option } = Select;

const VouchersPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage] = useState<number>(8);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [form] = Form.useForm();
  const [data, setData] = useState<Voucher[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [loading, setLoading] = useState(false);

  // Danh sách khóa học giả lập dùng trong Select
  const courses = [
    { id: 'all', name: 'Tất cả khóa học' },
    { id: 'course-1', name: 'Khóa học React Nâng cao' },
    { id: 'course-2', name: 'Khóa học Node.js và API' },
    { id: 'course-3', name: 'Khóa học Python cho Data Science' },
    { id: 'course-4', name: 'Khóa học Thiết kế UI/UX cơ bản' },
  ];

  // Fetch data
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await voucherService.getAll();
      if (response.success) {
        setData(response.data);
      } else {
        message.error('Lỗi khi lấy danh sách mã giảm giá');
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      message.error('Lỗi khi lấy danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const isVoucherActive = (voucher: Voucher) => {
    if (!voucher.expiresAt) return true;
    const expiryDate = dayjs(voucher.expiresAt);
    return expiryDate.isValid() ? dayjs().isBefore(expiryDate) : true;
  };

  // Lọc theo tìm kiếm và trạng thái
  const filteredData = data.filter((item) => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.course && item.course.toLowerCase().includes(searchText.toLowerCase()));
    
    const isActive = isVoucherActive(item);
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
    setEditingVoucher(null);
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

  const showEditModal = (record: Voucher) => {
    setEditingVoucher(record);
    form.setFieldsValue({
      code: record.code,
      courseId: record.course || 'all',
      type: record.type,
      value: record.value,
      quantity: record.quantity,
      startDate: dayjs(record.createdAt),
      endDate: record.expiresAt ? dayjs(record.expiresAt) : null,
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const courseName = courses.find(c => c.id === values.courseId)?.name || 'Tất cả khóa học';

      const voucherData: CreateVoucherData = {
        code: values.code,
        course: values.courseId === 'all' ? null : values.courseId,
        type: values.type,
        value: values.value,
        quantity: values.quantity,
        expiresAt: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
      };

      if (editingVoucher) {
        const response = await voucherService.update(editingVoucher._id, voucherData);
        if (response.success) {
          message.success('Cập nhật mã giảm giá thành công');
          fetchVouchers();
        } else {
          message.error('Lỗi khi cập nhật mã giảm giá');
        }
      } else {
        const response = await voucherService.create(voucherData);
        if (response.success) {
          message.success('Tạo mã giảm giá thành công');
          fetchVouchers();
        } else {
          message.error('Lỗi khi tạo mã giảm giá');
        }
      }

      setIsModalVisible(false);
      setEditingVoucher(null);
      form.resetFields();
    } catch (error) {
      console.error('Error saving voucher:', error);
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await voucherService.delete(id);
      if (response.success) {
        message.success('Đã xóa mã giảm giá');
        fetchVouchers();
      } else {
        message.error('Lỗi khi xóa mã giảm giá');
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      message.error('Lỗi khi xóa mã giảm giá');
    }
  };

  // Calculate statistics
  const stats = {
    total: data.length,
    active: data.filter(c => isVoucherActive(c)).length,
    expired: data.filter(c => !isVoucherActive(c)).length,
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterStatus]);

  const columns: ColumnsType<Voucher> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      className: "font-medium text-gray-800",
    },
    {
      title: 'Áp dụng khóa học',
      dataIndex: 'course',
      key: 'course',
      className: "text-gray-600",
      render: (course: string | null) => course || 'Tất cả khóa học'
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
      render: (value: number, record: Voucher) =>
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
      render: (_: void, record: Voucher) => `${record.used} / ${record.quantity}`,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (_: void, record: Voucher) => {
        const isActive = isVoucherActive(record);
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
      className: "text-gray-600 text-sm",
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      align: 'center',
      render: (date: string | null) => (date ? dayjs(date).format('YYYY-MM-DD') : 'Không giới hạn'),
      className: "text-gray-600 text-sm"
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 120,
      render: (_: void, record: Voucher) => (
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
            onConfirm={() => handleDelete(record._id)}
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
          rowKey="_id"
          columns={columns}
          dataSource={currentData}
          pagination={false}
          scroll={{ x: 1100 }}
          className="vouchers-table"
          loading={loading}
        />

        <div className="text-right mt-4 px-4">
          <Pagination
            current={currentPage}
            pageSize={rowsPerPage}
            total={filteredData.length}
            onChange={page => setCurrentPage(page)}
            showSizeChanger={false}
            showTotal={(total) => `Tổng số ${total} mã giảm giá`}
          />
        </div>
      </Card>

      <Modal
        title={<div className="text-xl font-semibold text-gray-800">{editingVoucher ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</div>}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingVoucher(null);
          form.resetFields();
        }}
        okText={editingVoucher ? 'Lưu thay đổi' : 'Tạo mã'}
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
            courseId: 'all',
          }}
        >
          <Form.Item
            label="Mã giảm giá"
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá' }]}
          >
            <Input placeholder="Nhập mã giảm giá" maxLength={20} disabled={!!editingVoucher} />
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
                return Number(value.replace('%', '').replace(' VNĐ', '').replace(/,/g, ''));
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
              disabled
              format="YYYY-MM-DD"
              placeholder="Ngày tạo"
            />
          </Form.Item>

          <Form.Item label="Ngày hết hạn" name="endDate">
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD" 
              placeholder="Chọn ngày hết hạn (Không bắt buộc)"
              disabledDate={current => current && current < dayjs().startOf('day')}
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
