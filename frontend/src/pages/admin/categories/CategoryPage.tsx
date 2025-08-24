import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Select,
  Tag,
  Space,
  Button,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Popconfirm,
  Spin,
  DatePicker,
  Tooltip,
  Typography,
  Badge,
  Divider,
  Progress,
  Alert,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  BookOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  TagsOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../../../services/categoryService";
import type { Category } from "../../../interfaces/Category.interface";
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { motion } from 'framer-motion';

dayjs.locale('vi');

const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;

// FilterSection component
interface FilterSectionProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  setSearch: (value: string) => void;
  selectedStatus: string | undefined;
  setSelectedStatus: (status: string | undefined) => void;
  setDateRange: (dates: any) => void;
  dateRange: any;
  search: string;
}

const FilterSection = ({
  searchInput,
  setSearchInput,
  setSearch,
  selectedStatus,
  setSelectedStatus,
  setDateRange,
  dateRange,
  search,
}: FilterSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
  >
    <Card 
      style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <Input
          placeholder="Tìm kiếm danh mục..."
          prefix={<SearchOutlined />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={() => setSearch(searchInput)}
          style={{ 
            minWidth: '250px',
            borderRadius: '8px',
            border: '1px solid #d9d9d9'
          }}
          allowClear
        />
        <Select
          placeholder="Lọc theo trạng thái"
          value={selectedStatus}
          onChange={setSelectedStatus}
          style={{ 
            minWidth: '180px',
            borderRadius: '8px'
          }}
          allowClear
        >
          <Select.Option value="active">Hiển thị</Select.Option>
          <Select.Option value="inactive">Ẩn</Select.Option>
        </Select>
        <RangePicker
          placeholder={['Từ ngày', 'Đến ngày']}
          onChange={(dates) => setDateRange(dates)}
          style={{ 
            borderRadius: '8px',
            border: '1px solid #d9d9d9'
          }}
          format="DD/MM/YYYY"
          value={dateRange}
        />
        <Button
          type="primary"
          icon={<FilterOutlined />}
          onClick={() => setSearch(searchInput)}
          style={{ 
            borderRadius: '8px',
            height: '40px'
          }}
        >
          Lọc
        </Button>
      </div>
    </Card>
  </motion.div>
);

// StatCards component
interface StatCardsProps {
  categoryStats: {
    total: number;
    active: number;
    inactive: number;
  };
}

const StatCards = ({ categoryStats }: StatCardsProps) => {
  const activePercentage = categoryStats.total > 0 ? (categoryStats.active / categoryStats.total) * 100 : 0;
  const inactivePercentage = categoryStats.total > 0 ? (categoryStats.inactive / categoryStats.total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                backgroundColor: '#e6f7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TagsOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Tổng số danh mục</Text>}
                  value={categoryStats.total}
                  valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Tất cả danh mục</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                backgroundColor: '#f6ffed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Hiển thị</Text>}
                  value={categoryStats.active}
                  valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{activePercentage.toFixed(1)}%</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                backgroundColor: '#fff1f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Ẩn</Text>}
                  value={categoryStats.inactive}
                  valueStyle={{ color: '#ff4d4f', fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <FallOutlined style={{ color: '#ff4d4f' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{inactivePercentage.toFixed(1)}%</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                backgroundColor: '#f9f0ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileTextOutlined style={{ color: '#722ed1', fontSize: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title={<Text style={{ fontSize: '14px', color: '#666' }}>Tỷ lệ hoạt động</Text>}
                  value={activePercentage} 
                  suffix="%" 
                  precision={1}
                  valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 600 }}
                />
                <Progress 
                  percent={activePercentage} 
                  size="small" 
                  strokeColor="#722ed1"
                  showInfo={false}
                  style={{ marginTop: '8px' }}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

const CategoryPage = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  const [categoryStats, setCategoryStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Fetch categories with realtime updates
  const fetchCategories = useCallback(async (page = 1, limit = 15) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: search,
        status: selectedStatus,
        startDate: dateRange?.[0]?.startOf('day').toISOString(),
        endDate: dateRange?.[1]?.endOf('day').toISOString(),
      };
      
      console.log("Fetching categories with params:", params);
      const response = await getAllCategories(params);

      if (response.success) {
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : [];
        // Sort categories by creation date
        const sortedCategories = [...categoriesData].sort((a: Category, b: Category) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        // Map and add sequence number
        const mappedCategories = sortedCategories.map((category: Category, index: number) => ({
          ...category,
          number: (page - 1) * limit + index + 1,
        }));
        setAllCategories(mappedCategories);
        setCategories(mappedCategories);
        setPagination({
          ...pagination,
          current: page,
          pageSize: limit,
          total: categoriesData.length,
        });
        
        // Update category stats
        const stats = {
          total: categoriesData.length,
          active: categoriesData.filter((category: Category) => category.status === 'active' && category.status !== undefined).length,
          inactive: categoriesData.filter((category: Category) => category.status === 'inactive' && category.status !== undefined).length,
        };
        setCategoryStats(stats);
      } else {
        message.error(response.message || "Lỗi khi tải danh sách danh mục");
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error(error instanceof Error ? error.message : 'Lỗi khi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, dateRange, pagination.pageSize]);

  // Initial fetch and realtime updates
  useEffect(() => {
    fetchCategories();
    
    // Set up realtime updates every 30 seconds
    const interval = setInterval(() => {
      fetchCategories();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCategories]);

  // Filter categories when searchInput or selectedStatus changes
  useEffect(() => {
    const filtered = allCategories.filter(category => {
      const matchName = category.name.toLowerCase().includes(searchInput.toLowerCase());
      const matchStatus = selectedStatus ? category.status === selectedStatus : true;
      return matchName && matchStatus;
    });
    setCategories(filtered);
  }, [searchInput, selectedStatus, allCategories]);

  // Fetch categories when search or filters change
  useEffect(() => {
    fetchCategories();
  }, [search, selectedStatus, dateRange]);

  const getStatusTag = (status: string) => {
    return status === 'active' ? (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        Hiển thị
      </Tag>
    ) : (
      <Tag color="red" icon={<CloseCircleOutlined />}>
        Ẩn
      </Tag>
    );
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'STT',
      dataIndex: 'number',
      key: 'number',
      width: 70,
      align: 'center',
      render: (number) => (
        <Badge count={number} showZero style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '8px', 
            backgroundColor: '#f0f8ff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #e6f7ff'
          }}>
            <TagsOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
          </div>
          <div>
            <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
              {name}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description ? 
                (record.description.length > 50 ? 
                  `${record.description.substring(0, 50)}...` : 
                  record.description
                ) : 
                'Không có mô tả'
              }
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      align: 'center',
      render: (createdAt) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
            {dayjs(createdAt).format('DD/MM/YYYY')}
          </div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            {dayjs(createdAt).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewCategory(record);
              }}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEditCategory(record);
              }}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa danh mục này?"
              description="Hành động này không thể hoàn tác. Tất cả khóa học thuộc danh mục này sẽ không có danh mục."
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDeleteCategory(record._id);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={e => e.stopPropagation()}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleAddCategory = () => {
    form.resetFields();
    form.setFieldsValue({
      status: 'active'
    });
    setEditingCategory(null);
    setIsModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      status: category.status,
    });
    setEditingCategory(category);
    setIsModalVisible(true);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await deleteCategory(id);
      if (response.success) {
        message.success('Xóa danh mục thành công');
        fetchCategories();
      } else {
        message.error(response.message || 'Lỗi khi xóa danh mục');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error(error instanceof Error ? error.message : 'Lỗi khi xóa danh mục');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingCategory) {
        // Update category
        const response = await updateCategory(editingCategory._id, values);
        if (response.success) {
          message.success('Cập nhật danh mục thành công');
          fetchCategories();
          setIsModalVisible(false);
        } else {
          console.error('Error updating category:', response.message);
          message.error(response.message || 'Lỗi khi cập nhật danh mục');
        }
      } else {
        // Create new category
        const response = await createCategory(values);
        if (response.success) {
          message.success('Tạo danh mục thành công');
          fetchCategories();
          setIsModalVisible(false);
        } else {
          console.error('Error creating category:', response.message);
          message.error(response.message || 'Lỗi khi tạo danh mục');
        }
      }
    } catch (error) {
      console.error('Error validating form:', error);
      message.error('Lỗi kiểm tra dữ liệu');
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setEditingCategory(null);
    setIsModalVisible(false);
  };

  const handleViewCategory = (category: Category) => {
    setViewingCategory(category);
    setIsDetailModalVisible(true);
  };

  if (loading && categories.length === 0) {
    return (
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              padding: '80px 24px'
            }}
          >
            <Spin size="large" />
            <Text style={{ marginTop: 16, fontSize: '16px' }}>Đang tải dữ liệu...</Text>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ marginBottom: '32px' }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                  <TrophyOutlined style={{ marginRight: '12px', color: '#667eea' }} />
                  Quản lý danh mục
                </Title>
                <Paragraph style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
                  Quản lý và theo dõi các danh mục khóa học trong hệ thống
                </Paragraph>
                <div style={{ marginTop: '12px' }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                    Cập nhật: {new Date().toLocaleString('vi-VN')}
                  </Text>
                </div>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddCategory}
                style={{ 
                  borderRadius: '8px',
                  height: '40px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Thêm danh mục
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <StatCards categoryStats={categoryStats} />

        {/* Filter Section */}
        <FilterSection
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          setSearch={setSearch}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          setDateRange={setDateRange}
          dateRange={dateRange}
          search={search}
        />

        {/* Categories Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              paddingBottom: '12px', 
              borderBottom: '1px solid #f0f0f0',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
                  Danh sách danh mục
                </Title>
                <Badge count={categories.length} style={{ 
                  backgroundColor: '#1890ff',
                  borderRadius: '8px'
                }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Hiển thị {((pagination.current - 1) * pagination.pageSize) + 1} - {Math.min(pagination.current * pagination.pageSize, categories.length)} của {categories.length} danh mục
                </Text>
              </div>
            </div>
            
            <Table
              columns={columns}
              dataSource={categories}
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} danh mục`,
                pageSizeOptions: ['10', '20', '50', '100'],
                size: 'small',
              }}
              onChange={(pagination) => fetchCategories(pagination.current, pagination.pageSize)}
              rowKey="_id"
              style={{ 
                borderRadius: '12px',
                overflow: 'hidden'
              }}
              scroll={{ x: 800 }}
              size="small"
              onRow={(record) => ({
                onClick: () => handleViewCategory(record),
                style: { cursor: 'pointer' },
              })}
            />
          </Card>
        </motion.div>

        {/* Add/Edit Category Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TagsOutlined style={{ color: '#667eea', fontSize: '20px' }} />
              <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
              </Text>
            </div>
          }
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText="Lưu"
          cancelText="Hủy"
          width={800}
          style={{ borderRadius: '16px' }}
          okButtonProps={{ 
            style: { 
              borderRadius: '8px',
              height: '40px',
              fontSize: '14px',
              fontWeight: '500'
            } 
          }}
          cancelButtonProps={{ 
            style: { 
              borderRadius: '8px',
              height: '40px',
              fontSize: '14px'
            } 
          }}
        >
          <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label={<Text strong>Tên danh mục</Text>}
                  rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                >
                  <Input 
                    placeholder="Nhập tên danh mục" 
                    style={{ 
                      borderRadius: '8px',
                      height: '40px',
                      fontSize: '14px'
                    }} 
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="description"
                  label={<Text strong>Mô tả</Text>}
                >
                  <Input.TextArea 
                    placeholder="Nhập mô tả danh mục" 
                    style={{ 
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                    rows={4}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="status"
                  label={<Text strong>Trạng thái</Text>}
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                  <Select 
                    placeholder="Chọn trạng thái" 
                    style={{ 
                      borderRadius: '8px',
                      height: '40px'
                    }}
                  >
                    <Select.Option value="active">
                      <Space>
                        <CheckCircleOutlined style={{ color: 'green' }} />
                        Hiển thị
                      </Space>
                    </Select.Option>
                    <Select.Option value="inactive">
                      <Space>
                        <CloseCircleOutlined style={{ color: 'red' }} />
                        Ẩn
                      </Space>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Category Detail Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TagsOutlined style={{ color: '#667eea', fontSize: '20px' }} />
              <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
                Chi tiết danh mục
              </Text>
            </div>
          }
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={null}
          width={600}
          style={{ borderRadius: '16px' }}
        >
          {viewingCategory && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <Title level={3} style={{ margin: 0, color: '#1a1a1a' }}>
                  {viewingCategory.name}
                </Title>
                {getStatusTag(viewingCategory.status)}
              </div>
              
              <Divider />
              
              <Card 
                style={{ 
                  backgroundColor: '#fafafa',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0'
                }} 
                bordered={false}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px',
                  padding: '12px 0'
                }}>
                  <FileTextOutlined style={{ 
                    marginTop: '2px',
                    color: '#1890ff', 
                    fontSize: '16px' 
                  }} />
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Mô tả:</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        {viewingCategory.description || 'Không có mô tả'}
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Divider />
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px 0'
              }}>
                <CalendarOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Ngày tạo:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text style={{ fontSize: '14px', color: '#666' }}>
                      {dayjs(viewingCategory.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px 0'
              }}>
                <CalendarOutlined style={{ color: '#faad14', fontSize: '16px' }} />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Ngày chỉnh sửa:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text style={{ fontSize: '14px', color: '#666' }}>
                      {dayjs(viewingCategory.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </motion.div>
  );
};

export default CategoryPage;