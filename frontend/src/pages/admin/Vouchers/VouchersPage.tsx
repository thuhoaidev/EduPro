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
  message,
  Switch,
  Typography,
  Badge,
  Divider,
  Spin,
  DatePicker as AntdDatePicker,
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
  FilterOutlined,
  TrophyOutlined,
  BookOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import voucherService from '../../../services/voucher.service';
import type { Voucher, CreateVoucherData } from '../../../services/voucher.service';
import { getAllCategories } from '../../../services/categoryService';
import type { Category } from '../../../interfaces/Category.interface';
import styles from '../Users/UserPage.module.css';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = AntdDatePicker;

// FilterSection component
interface FilterSectionProps {
  searchText: string;
  setSearchText: (value: string) => void;
  filterStatus: 'all' | 'active' | 'expired';
  setFilterStatus: (value: 'all' | 'active' | 'expired') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
}

const FilterSection = ({
  searchText,
  setSearchText,
  filterStatus,
  setFilterStatus,
  sortOrder,
  setSortOrder,
}: FilterSectionProps) => {
  return (
    <Card className={styles.filterCard} bordered={false}>
      <div className={styles.filterGroup}>
        <Input
          placeholder="Tìm kiếm mã giảm giá..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className={styles.filterInput}
          allowClear
        />
        <Select
          value={filterStatus}
          onChange={value => setFilterStatus(value as 'all' | 'active' | 'expired')}
          className={styles.filterSelect}
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "active", label: "Đang hoạt động" },
            { value: "expired", label: "Đã hết hạn" },
          ]}
        />
        <Select
          value={sortOrder}
          onChange={value => setSortOrder(value as 'asc' | 'desc')}
          className={styles.filterSelect}
          options={[
            { value: "asc", label: "Giá trị tăng dần" },
            { value: "desc", label: "Giá trị giảm dần" },
          ]}
        />
      </div>
    </Card>
  );
};

// StatCards component
interface StatCardsProps {
  stats: {
    total: number;
    active: number;
    expired: number;
  };
}

const StatCards = ({ stats }: StatCardsProps) => {
  const activePercentage = stats.total > 0 ? (stats.active / stats.total) * 100 : 0;
  const expiredPercentage = stats.total > 0 ? (stats.expired / stats.total) * 100 : 0;

  return (
    <Row gutter={[16, 16]} className={styles.statsRow} justify="center">
      <Col xs={24} sm={12} md={8}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#1890ff' }}>
              <BookOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Tổng số mã" 
                value={stats.total} 
                valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">Tất cả mã giảm giá</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#52c41a' }}>
              <CheckCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Đang hoạt động" 
                value={stats.active} 
                valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">{activePercentage.toFixed(1)}%</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#ff4d4f' }}>
              <CloseCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Đã hết hạn" 
                value={stats.expired} 
                valueStyle={{ color: '#ff4d4f', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <FallOutlined style={{ color: '#ff4d4f' }} />
                <Text type="secondary">{expiredPercentage.toFixed(1)}%</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

const VouchersPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [form] = Form.useForm();
  const [data, setData] = useState<Voucher[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch data
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await voucherService.getAll();
      if (response.success) {
        const vouchersWithNumber = response.data.map((voucher: Voucher, index: number) => ({
          ...voucher,
          number: index + 1,
        }));
        setData(vouchersWithNumber);
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
    // Lấy danh mục khóa học
    const fetchCategories = async () => {
      const res = await getAllCategories();
      if (res.success) setCategories(res.data.filter(c => c.status === 'active'));
    };
    fetchCategories();
  }, []);

  const isVoucherActive = (voucher: Voucher) => {
    if (!voucher.endDate) return true;
    const expiryDate = dayjs(voucher.endDate);
    return expiryDate.isValid() ? dayjs().isBefore(expiryDate) && voucher.usageLimit > voucher.usedCount : true;
  };

  // Lọc theo tìm kiếm và trạng thái
  const filteredData = data.filter((item) => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchText.toLowerCase());
    const isActive = isVoucherActive(item);
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && isActive) ||
      (filterStatus === 'expired' && !isActive);

    return matchesSearch && matchesStatus;
  });

  // Sắp xếp theo giá trị giảm tối đa
  const sortedData = [...filteredData].sort((a, b) =>
    sortOrder === 'asc'
      ? (a.maxDiscount || 0) - (b.maxDiscount || 0)
      : (b.maxDiscount || 0) - (a.maxDiscount || 0)
  );

  const showAddModal = () => {
    setEditingVoucher(null);
    form.resetFields();
    form.setFieldsValue({
      discountType: 'percentage',
      discountValue: 0,
      maxDiscount: 0,
      minOrderValue: 0,
      usageLimit: 1,
      usedCount: 0,
      categories: [],
      tags: [],
      startDate: dayjs(),
      endDate: null,
      type: 'default',
    });
    setIsModalVisible(true);
  };

  const showEditModal = (record: Voucher) => {
    setEditingVoucher(record);
    form.setFieldsValue({
      code: record.code,
      title: record.title,
      description: record.description,
      discountType: record.discountType,
      discountValue: record.discountValue,
      maxDiscount: record.maxDiscount,
      minOrderValue: record.minOrderValue,
      usageLimit: record.usageLimit,
      usedCount: record.usedCount,
      categories: record.categories || [],
      tags: record.tags || [],
      startDate: dayjs(record.startDate),
      endDate: record.endDate ? dayjs(record.endDate) : null,
      type: record.type || 'default',
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const voucherData: CreateVoucherData = {
        code: values.code,
        title: values.title || '',
        description: values.description || '',
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscount: values.maxDiscount || 0,
        minOrderValue: values.minOrderValue || 0,
        usageLimit: values.usageLimit,
        usedCount: values.usedCount || 0,
        categories: values.categories || [],
        tags: values.tags || [],
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
        type: values.type || 'default',
      };
      if (editingVoucher) {
        const response = await voucherService.update(editingVoucher.id, voucherData);
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

  const showDetailModal = (record: Voucher) => {
    setSelectedVoucher(record);
    setIsDetailModalVisible(true);
  };

  const columns: ColumnsType<Voucher> = [
    {
      title: 'STT',
      dataIndex: 'number',
      key: 'number',
      width: 70,
      align: 'center' as const,
      render: (number: number) => (
        <Badge count={number} showZero style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Mã giảm giá',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      align: 'center' as const,
      render: (code: string, record: Voucher) => (
        <Button 
          type="link" 
          onClick={() => showDetailModal(record)}
          className="p-0 font-medium text-blue-600 hover:text-blue-800"
          style={{ fontSize: 14, wordBreak: 'break-all', whiteSpace: 'normal', padding: 0 }}
        >
          {code}
        </Button>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      align: 'left' as const,
      ellipsis: true,
      render: (title: string) => <span style={{ fontWeight: 500 }}>{title}</span>
    },
    {
      title: 'Giá trị giảm',
      dataIndex: 'discountValue',
      key: 'discountValue',
      width: 120,
      align: 'center' as const,
      render: (value: number, record: Voucher) =>
        <span style={{ color: '#1677ff', fontWeight: 600, fontSize: 13 }}>
          {record.discountType === 'percentage'
            ? `${value}%`
            : `${value.toLocaleString('vi-VN')} VNĐ`}
        </span>,
    },
    {
      title: 'Giảm tối đa',
      dataIndex: 'maxDiscount',
      key: 'maxDiscount',
      width: 120,
      align: 'center' as const,
      render: (max: number) => max ? `${max.toLocaleString('vi-VN')} VNĐ` : '-'
    },
    {
      title: 'Số lượng',
      dataIndex: 'usageLimit',
      key: 'usageLimit',
      width: 100,
      align: 'center' as const,
      render: (limit: number, record: Voucher) => `${record.usedCount} / ${limit}`
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      align: 'center' as const,
      render: (_: void, record: Voucher) => {
        const isActive = isVoucherActive(record);
        const isOutOfUsage = record.usedCount >= record.usageLimit;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {isActive && !isOutOfUsage ? (
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
            ) : (
              <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
            )}
            <span style={{ fontSize: 13, color: isActive && !isOutOfUsage ? '#52c41a' : '#ff4d4f', fontWeight: 500 }}>
              {isOutOfUsage ? 'Đã hết lượt' : (isActive ? 'Đang hoạt động' : 'Đã hết hạn')}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center' as const,
      width: 120,
      render: (_: void, record: Voucher) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              type="text"
              onClick={() => showDetailModal(record)}
              style={{ color: '#1677ff', fontSize: 16 }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              type="text"
              onClick={() => showEditModal(record)}
              style={{ color: '#1677ff', fontSize: 16 }}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa mã này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                icon={<DeleteOutlined />}
                type="text"
                danger
                style={{ fontSize: 16 }}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && data.length === 0) {
    return (
      <div className={styles.userPageContainer}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
          <Text style={{ marginTop: 16 }}>Đang tải dữ liệu...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.userPageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Title level={2} className={styles.pageTitle}>
            <TrophyOutlined className={styles.titleIcon} />
            Quản lý mã giảm giá
          </Title>
          <Paragraph className={styles.pageSubtitle}>
            Tạo và quản lý các mã giảm giá cho khóa học
          </Paragraph>
        </div>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={showAddModal}
          className={styles.addButton}
          size="large"
        >
          Tạo mã giảm giá
        </Button>
      </div>

      {/* Statistics Cards */}
      <StatCards stats={stats} />

      {/* Filter Section */}
      <FilterSection
        searchText={searchText}
        setSearchText={setSearchText}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Vouchers Table */}
      <Card className={styles.userTableCard} bordered={false}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitleSection}>
            <BookOutlined className={styles.tableIcon} />
            <Title level={4} className={styles.tableTitle}>
              Danh sách mã giảm giá
            </Title>
            <Badge count={sortedData.length} className={styles.userCountBadge} />
          </div>
          <div className={styles.tableActions}>
            <Text type="secondary">
              Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, sortedData.length)} của {sortedData.length} mã giảm giá
            </Text>
          </div>
        </div>
        
        <Table
          columns={columns}
          dataSource={sortedData}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: sortedData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mã giảm giá`,
            pageSizeOptions: ['10', '20', '50', '100'],
            size: 'small',
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 15);
            },
          }}
          rowKey="id"
          className={styles.userTable}
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <EditOutlined className={styles.modalIcon} />
            {editingVoucher ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingVoucher(null);
          form.resetFields();
        }}
        okText={editingVoucher ? 'Lưu thay đổi' : 'Tạo mã'}
        cancelText="Hủy"
        destroyOnHidden
        centered
        width={600}
        className={styles.userModal}
      >
        <Form
          form={form}
          layout="vertical"
          className={styles.userForm}
          initialValues={{
            discountType: 'percentage',
            discountValue: 0,
            maxDiscount: 0,
            minOrderValue: 0,
            usageLimit: 1,
            usedCount: 0,
            categories: [],
            tags: [],
            courseId: 'all',
          }}
        >
          <Form.Item
            label="Mã giảm giá"
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá' }]}
            className={styles.formItem}
          >
            <Input placeholder="Nhập mã giảm giá" maxLength={20} disabled={!!editingVoucher} className={styles.input} />
          </Form.Item>

          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            className={styles.formItem}
          >
            <Input maxLength={100} placeholder="Nhập tiêu đề cho mã giảm giá" className={styles.input} />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            className={styles.formItem}
          >
            <Input.TextArea maxLength={200} rows={2} placeholder="Nhập mô tả cho mã giảm giá" className={styles.input} />
          </Form.Item>

          <Form.Item
            label="Danh mục áp dụng"
            name="categories"
            className={styles.formItem}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Chọn danh mục áp dụng"
              className={styles.input}
              options={[
                { value: 'all', label: 'Tất cả danh mục' },
                ...categories.map(cat => ({ value: cat._id, label: cat.name }))
              ]}
            />
          </Form.Item>

          <Form.Item label="Loại giảm giá" name="discountType" rules={[{ required: true }]} className={styles.formItem}>
            <Select className={styles.input}>
              <Option value="fixed">Số tiền (VNĐ)</Option>
              <Option value="percentage">Phần trăm (%)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá trị giảm"
            name="discountValue"
            rules={[
              { required: true, message: 'Vui lòng nhập giá trị giảm' },
              { type: 'number', min: 0, message: 'Giá trị không thể âm' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const type = getFieldValue('discountType');
                  if (type === 'percentage') {
                    if (value < 1) return Promise.reject('Phần trăm giảm phải lớn hơn hoặc bằng 1%');
                    if (value > 100) return Promise.reject('Phần trăm giảm không được vượt quá 100%');
                  } else if (type === 'fixed') {
                    if (value < 10000) return Promise.reject('Giá trị giảm phải lớn hơn hoặc bằng 10,000 VNĐ');
                  }
                  return Promise.resolve();
                }
              })
            ]}
            className={styles.formItem}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập giá trị giảm"
              className={styles.input}
              formatter={(value) => {
                if (value === null || value === undefined) return '';
                const type = form.getFieldValue('discountType');
                return type === 'percentage' ? `${value}%` : `${value} VNĐ`;
              }}
              parser={(value) => {
                if (!value) return 0;
                return Number(value.replace('%', '').replace(' VNĐ', '').replace(/,/g, ''));
              }}
            />
          </Form.Item>

          <Form.Item
            label="Giảm tối đa"
            name="maxDiscount"
            rules={[
              { type: 'number', min: 0, message: 'Giá trị không thể âm' },
            ]}
            className={styles.formItem}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập giá trị giảm tối đa"
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            label="Đơn tối thiểu"
            name="minOrderValue"
            rules={[
              { type: 'number', min: 0, message: 'Giá trị không thể âm' },
            ]}
            className={styles.formItem}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập đơn tối thiểu"
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="usageLimit"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
            ]}
            className={styles.formItem}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="Nhập số lượng" className={styles.input} />
          </Form.Item>

          <Form.Item label="Loại voucher" name="type" rules={[{ required: true, message: 'Vui lòng chọn loại voucher!' }]} className={styles.formItem}> 
            <Select placeholder="Chọn loại voucher" className={styles.input}>
              <Select.Option value="default">default</Select.Option>
              <Select.Option value="new-user">new-user</Select.Option>
              <Select.Option value="birthday">birthday</Select.Option>
              <Select.Option value="first-order">first-order</Select.Option>
              <Select.Option value="order-count">order-count</Select.Option>
              <Select.Option value="order-value">order-value</Select.Option>
              <Select.Option value="flash-sale">flash-sale</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ngày tạo" name="startDate" rules={[{ required: true }]} className={styles.formItem}>
            <DatePicker
              style={{ width: '100%' }}
              disabled
              format="YYYY-MM-DD"
              placeholder="Ngày tạo"
              className={styles.input}
            />
          </Form.Item>

          <Form.Item label="Ngày hết hạn" name="endDate" className={styles.formItem}>
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD" 
              placeholder="Chọn ngày hết hạn (Không bắt buộc)"
              disabledDate={current => current && current < dayjs().startOf('day')}
              className={styles.input}
            />
          </Form.Item>

          <Form.Item label="Tags" name="tags" className={styles.formItem}>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Thêm tags (nhấn Enter để thêm)"
              tokenSeparators={[',']}
              className={styles.input}
            >
              <Select.Option value="new-user">new-user</Select.Option>
              <Select.Option value="birthday">birthday</Select.Option>
              <Select.Option value="first-order">first-order</Select.Option>
              <Select.Option value="order-count">order-count</Select.Option>
              <Select.Option value="order-value">order-value</Select.Option>
              <Select.Option value="flash-sale">flash-sale</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <EyeOutlined className={styles.modalIcon} />
            Chi tiết mã giảm giá
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedVoucher(null);
        }}
        footer={null}
        width={420}
        centered
        className={styles.userModal}
      >
        {selectedVoucher && (
          <div style={{ padding: 8 }}>
            <div className={styles.userDetailHeaderBox}>
              <Title level={3} style={{ margin: 0 }}>
                {selectedVoucher.code}
              </Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isVoucherActive(selectedVoucher) ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                )}
                <span style={{ fontSize: 14, color: isVoucherActive(selectedVoucher) ? '#52c41a' : '#ff4d4f', fontWeight: 500 }}>
                  {isVoucherActive(selectedVoucher) ? 'Đang hoạt động' : 'Đã hết hạn'}
                </span>
              </div>
            </div>
            
            <Divider />
            
            <Card className={styles.userDetailCard} bordered={false}>
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <Text strong>Tiêu đề:</Text>
                </div>
                <div>
                  <Text type="secondary">{selectedVoucher.title}</Text>
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <Text strong>Mô tả:</Text>
                </div>
                <div>
                  <Text type="secondary">{selectedVoucher.description || '-'}</Text>
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <Text strong>Loại giảm giá:</Text>
                </div>
                <div>
                  <Text type="secondary">{selectedVoucher.discountType === 'fixed' ? '💵 Số tiền' : '🎯 Phần trăm'}</Text>
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <Text strong>Giá trị giảm:</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontWeight: 600, color: '#1677ff' }}>
                    {selectedVoucher.discountType === 'percentage'
                      ? `${selectedVoucher.discountValue}%`
                      : `${selectedVoucher.discountValue.toLocaleString('vi-VN')} VNĐ`}
                  </Text>
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <Text strong>Giảm tối đa:</Text>
                </div>
                <div>
                  <Text type="secondary">{selectedVoucher.maxDiscount ? `${selectedVoucher.maxDiscount.toLocaleString('vi-VN')} VNĐ` : '-'}</Text>
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <Text strong>Đơn tối thiểu:</Text>
                </div>
                <div>
                  <Text type="secondary">
                    {selectedVoucher.minOrderValue && selectedVoucher.minOrderValue > 0
                      ? `${selectedVoucher.minOrderValue.toLocaleString('vi-VN')} VNĐ`
                      : '0 VNĐ'}
                  </Text>
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <Text strong>Đã sử dụng / Số lượng:</Text>
                </div>
                <div>
                  <Text type="secondary">{selectedVoucher.usedCount} / {selectedVoucher.usageLimit}</Text>
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <Text strong>Danh mục:</Text>
                </div>
                <div>
                  <Text type="secondary">
                    {selectedVoucher.categories && selectedVoucher.categories.length > 0
                      ? selectedVoucher.categories
                          .map(cid => {
                            if (cid === 'all') return 'Tất cả';
                            const cat = categories.find(c => c._id === cid);
                            return cat ? cat.name : cid;
                          })
                          .join(', ')
                      : 'Tất cả'}
                  </Text>
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <Text strong>Tags:</Text>
                </div>
                <div>
                  {selectedVoucher.tags && selectedVoucher.tags.length > 0
                    ? selectedVoucher.tags.map((tag, index) => (
                        <Tag key={index} color="blue" style={{ marginRight: 4 }}>
                          {tag}
                        </Tag>
                      ))
                    : <Text type="secondary">Không có tags</Text>}
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <Text strong>Loại voucher:</Text>
                </div>
                <div>
                  <Text type="secondary">{selectedVoucher.type || 'default'}</Text>
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <Text strong>Ngày bắt đầu:</Text>
                </div>
                <div>
                  <Text type="secondary">{dayjs(selectedVoucher.startDate).format('YYYY-MM-DD')}</Text>
                </div>
              </div>
              
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <Text strong>Ngày kết thúc:</Text>
                </div>
                <div>
                  <Text type="secondary">{selectedVoucher.endDate ? dayjs(selectedVoucher.endDate).format('YYYY-MM-DD') : 'Không giới hạn'}</Text>
                </div>
              </div>
            </Card>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
              <Button onClick={() => {
                setIsDetailModalVisible(false);
                showEditModal(selectedVoucher);
              }}>
                Chỉnh sửa
              </Button>
              <Button type="primary" onClick={() => setIsDetailModalVisible(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VouchersPage;
