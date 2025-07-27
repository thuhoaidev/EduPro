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
import styles from '../Users/UserPage.module.css';

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
  <Card className={styles.filterCard} bordered={false}>
    <div className={styles.filterHeader}>
      <div className={styles.filterTitle}>
        <FilterOutlined className={styles.filterIcon} />
        <Text strong>Bộ lọc tìm kiếm</Text>
      </div>
      <div className={styles.realtimeIndicator}>
        <ClockCircleOutlined className={styles.pulse} />
        <Text type="secondary">Cập nhật tự động</Text>
      </div>
    </div>
    <div className={styles.filterGroup}>
      <Input
        placeholder="Tìm kiếm danh mục..."
        prefix={<SearchOutlined />}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onPressEnter={() => setSearch(searchInput)}
        className={styles.filterInput}
        allowClear
      />
      <Select
        placeholder="Lọc theo trạng thái"
        value={selectedStatus}
        onChange={setSelectedStatus}
        className={styles.filterSelect}
        allowClear
      >
        <Select.Option value="active">Hiển thị</Select.Option>
        <Select.Option value="inactive">Ẩn</Select.Option>
      </Select>
      <RangePicker
        placeholder={['Từ ngày', 'Đến ngày']}
        onChange={(dates) => setDateRange(dates)}
        className={styles.filterDateRange}
        format="DD/MM/YYYY"
        value={dateRange}
      />
    </div>
    
    {/* Active Filters Display */}
    {(search || selectedStatus || dateRange) && (
      <Card className={styles.activeFiltersCard} bordered={false}>
        <div className={styles.activeFiltersHeader}>
          <Text strong>Bộ lọc đang áp dụng:</Text>
        </div>
        <div className={styles.activeFiltersContent}>
          {search && (
            <Tag 
              closable 
              onClose={() => {
                setSearchInput('');
                setSearch('');
              }}
              color="blue"
            >
              Tìm kiếm: "{search}"
            </Tag>
          )}
          {selectedStatus && (
            <Tag 
              closable 
              onClose={() => setSelectedStatus(undefined)}
              color="green"
            >
              Trạng thái: {selectedStatus === 'active' ? 'Hiển thị' : 'Ẩn'}
            </Tag>
          )}
          {dateRange && (
            <Tag 
              closable 
              onClose={() => setDateRange(null)}
              color="orange"
            >
              Ngày: {dateRange[0]?.format('DD/MM/YYYY')} - {dateRange[1]?.format('DD/MM/YYYY')}
            </Tag>
          )}
        </div>
      </Card>
    )}
  </Card>
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
    <Row gutter={[16, 16]} className={styles.statsRow} justify="center">
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#1890ff' }}>
              <TagsOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Tổng số danh mục" 
                value={categoryStats.total} 
                valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">Tất cả danh mục</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#52c41a' }}>
              <CheckCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Hiển thị" 
                value={categoryStats.active} 
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
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#ff4d4f' }}>
              <CloseCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Ẩn" 
                value={categoryStats.inactive} 
                valueStyle={{ color: '#ff4d4f', fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className={styles.statTrend}>
                <FallOutlined style={{ color: '#ff4d4f' }} />
                <Text type="secondary">{inactivePercentage.toFixed(1)}%</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard} bordered={false}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#722ed1' }}>
              <FileTextOutlined style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <div className={styles.statInfo}>
              <Statistic 
                title="Tỷ lệ hoạt động" 
                value={activePercentage} 
                suffix="%" 
                precision={1}
                valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 'bold' }}
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
    pageSize: 10,
    total: 0,
  });

  const [categoryStats, setCategoryStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Fetch categories with realtime updates
  const fetchCategories = useCallback(async (page = 1, limit = 10) => {
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
      width: 80,
      render: (number) => (
        <Badge count={number} showZero style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (name, record) => (
        <div className={styles.courseCell}>
          <div className={styles.courseInfo}>
            <Text strong style={{ fontSize: '16px' }}>{name}</Text>
            <div className={styles.courseCategory}>
              <TagsOutlined style={{ marginRight: '4px', color: '#1890ff' }} />
              <Text type="secondary">Danh mục khóa học</Text>
            </div>
          </div>
        </div>
      ),
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt) => (
        <div className={styles.dateCell}>
          <CalendarOutlined className={styles.dateIcon} />
          <Text>{dayjs(createdAt).format('DD/MM/YYYY HH:mm')}</Text>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewCategory(record);
              }}
              className={styles.actionBtn}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEditCategory(record);
              }}
              className={styles.actionBtn}
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
                danger
                icon={<DeleteOutlined />}
                className={styles.actionBtn}
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
            Quản lý danh mục
          </Title>
          <Paragraph className={styles.pageSubtitle}>
            Quản lý và theo dõi các danh mục khóa học trong hệ thống
          </Paragraph>
        </div>
        <div className={styles.headerRight}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddCategory}
            className={styles.addUserBtn}
          >
            Thêm danh mục
          </Button>
        </div>
      </div>

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
      <Card className={styles.userTableCard} bordered={false}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitleSection}>
            <BookOutlined className={styles.tableIcon} />
            <Title level={4} className={styles.tableTitle}>
              Danh sách danh mục
            </Title>
            <Badge count={categories.length} className={styles.userCountBadge} />
          </div>
          <div className={styles.tableActions}>
            <Text type="secondary">
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
          }}
          onChange={(pagination) => fetchCategories(pagination.current, pagination.pageSize)}
          rowKey="_id"
          className={styles.userTable}
          scroll={{ x: 1200 }}
          onRow={(record) => ({
            onClick: () => handleViewCategory(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* Add/Edit Category Modal */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <TagsOutlined className={styles.modalIcon} />
            {editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
        width={800}
        className={styles.userModal}
      >
        <Form form={form} layout="vertical" className={styles.userForm}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Tên danh mục"
                rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                className={styles.formItem}
              >
                <Input placeholder="Nhập tên danh mục" className={styles.input} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                className={styles.formItem}
              >
                <Input.TextArea 
                  placeholder="Nhập mô tả danh mục" 
                  className={styles.input}
                  rows={4}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                className={styles.formItem}
              >
                <Select placeholder="Chọn trạng thái" className={styles.input}>
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
          <div className={styles.modalTitle}>
            <TagsOutlined className={styles.modalIcon} />
            Chi tiết danh mục
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={600}
        className={styles.userModal}
      >
        {viewingCategory && (
          <div>
            <div className={styles.userDetailHeaderBox}>
              <Title level={3} style={{ margin: 0 }}>
                {viewingCategory.name}
              </Title>
              {getStatusTag(viewingCategory.status)}
            </div>
            
            <Divider />
            
            <Card className={styles.userDetailCard} bordered={false}>
              <div className={styles.userDetailRow}>
                <div className={styles.userDetailLabel}>
                  <FileTextOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  <Text strong>Mô tả:</Text>
                </div>
                <div>
                  <Text type="secondary">
                    {viewingCategory.description || 'Không có mô tả'}
                  </Text>
                </div>
              </div>
            </Card>
            
            <Divider />
            
            <div className={styles.userDetailRow}>
              <div className={styles.userDetailLabel}>
                <CalendarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                <Text strong>Ngày tạo:</Text>
              </div>
              <Text>{dayjs(viewingCategory.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
            </div>
            
            <div className={styles.userDetailRow}>
              <div className={styles.userDetailLabel}>
                <CalendarOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                <Text strong>Ngày chỉnh sửa:</Text>
              </div>
              <Text>{dayjs(viewingCategory.updatedAt).format('DD/MM/YYYY HH:mm')}</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoryPage;