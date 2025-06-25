import { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../../../services/categoryService";
import type { Category } from "../../../interfaces/Category.interface";
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import styles from '../Users/UserPage.module.css';

dayjs.locale('vi');

const { RangePicker } = DatePicker;

// FilterSection component
interface FilterSectionProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  setSearch: (value: string) => void;
  selectedStatus: string | undefined;
  setSelectedStatus: (status: string | undefined) => void;
  setDateRange: (dates: any) => void;
}

const FilterSection = ({
  searchInput,
  setSearchInput,
  setSearch,
  selectedStatus,
  setSelectedStatus,
  setDateRange,
}: FilterSectionProps) => (
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
    />
  </div>
);

const CategoryPage = () => {
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

  useEffect(() => {
    fetchCategories();
  }, []); // Only fetch when component mounts

  useEffect(() => {
    if (search) {
      fetchCategories(1, pagination.pageSize);
    }
  }, [search]);

  // Fetch categories
  const fetchCategories = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search,
        status: selectedStatus,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
      };
      
      const response = await getAllCategories(params);
      console.log('API Response:', response); // Debug log

      if (response.success) {
        // Ensure categories is an array
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
  };

  // Fetch categories when search or filters change
  useEffect(() => {
    fetchCategories();
  }, [search, selectedStatus, dateRange]);

  const columns: ColumnsType<Category> = [
    {
      title: 'STT',
      dataIndex: 'number',
      key: 'number',
      width: 60,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Button type="link" className={styles.linkBtn} onClick={() => handleViewCategory(record)}>
          {name}
        </Button>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (description) => <span>{description || 'Không có mô tả'}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hiển thị' : 'Ẩn'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => dayjs(createdAt).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
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
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDeleteCategory(record._id);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Xóa"
              cancelText="Hủy"
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

  return (
    <div className={styles.userPageContainer}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h2>
          <p className="text-gray-500 mt-1">Quản lý và theo dõi các danh mục khóa học</p>
        </div>
      </div>

      <Row gutter={[16, 16]} className={styles.statsRow} justify="center">
        <Col xs={24} sm={12} md={8}>
          <Card className={styles.statsCard}>
            <Statistic title="Tổng số danh mục" value={categoryStats.total} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className={styles.statsCard}>
            <Statistic title="Hiển thị" value={categoryStats.active} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className={styles.statsCard}>
            <Statistic title="Ẩn" value={categoryStats.inactive} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>

      <FilterSection
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setSearch={setSearch}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        setDateRange={setDateRange}
      />

      <Card className={styles.userTableCard}>
        <Table
          columns={columns}
          dataSource={categories}
          loading={loading}
          pagination={pagination}
          onChange={(pagination) => fetchCategories(pagination.current, pagination.pageSize)}
          rowKey="_id"
          className={styles.userTable}
          scroll={{ x: true }}
          title={() => (
            <div className={styles.tableHeader}>
              <h4 className={styles.tableTitle}>Danh sách danh mục</h4>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddCategory}
                className={styles.addUserBtn}
              >
                Thêm danh mục
              </Button>
            </div>
          )}
          onRow={(record) => ({
            onClick: () => handleViewCategory(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
        className={styles.userModal}
      >
        <Card>
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
                  <Input.TextArea placeholder="Nhập mô tả danh mục" className={styles.input} />
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
        </Card>
      </Modal>

      <Modal
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={500}
        className={styles.userModal}
      >
        {viewingCategory && (
          <div style={{ padding: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: 22, margin: 0 }}>{viewingCategory.name}</h2>
            </div>
            <Tag color={viewingCategory.status === 'active' ? 'green' : 'red'} style={{ marginRight: 12, fontSize: 16, marginBottom: 12 }}>
              {viewingCategory.status === 'active' ? 'Hiển thị' : 'Ẩn'}
            </Tag>
            <div style={{ marginBottom: 12 }}>
              <b>Mô tả:</b>
              <div style={{ color: '#555', marginTop: 4, fontStyle: 'italic' }}>
                {viewingCategory.description || 'Không có mô tả'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ color: '#888' }}><b>Ngày tạo:</b></span>
              <span>{dayjs(viewingCategory.createdAt).format('DD/MM/YYYY HH:mm')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#888' }}><b>Ngày chỉnh sửa:</b></span>
              <span>{dayjs(viewingCategory.updatedAt).format('DD/MM/YYYY HH:mm')}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoryPage;