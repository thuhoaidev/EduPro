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
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../../../services/categoryService";
import type { Category } from "../../../interfaces/Category.interface";
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import styles from '../../../styles/CategoryPage.module.css';

dayjs.locale('vi');

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
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
      const response = await getAllCategories({
        page,
        limit,
        search,
      });
      console.log('API Response:', response); // Debug log

      if (response.success) {
        // Ensure categories is an array
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : [];

        // Sort categories by creation date
        const sortedCategories = [...categoriesData].sort((a: Category, b: Category) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        // Map and add sequence number
        const mappedCategories = sortedCategories.map((category: Category, index: number) => ({
          ...category,
          number: (page - 1) * pagination.pageSize + index + 1,
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
          active: categoriesData.filter((category: Category) => category.status === 'active').length,
          inactive: categoriesData.filter((category: Category) => category.status === 'inactive').length,
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

  useEffect(() => {
    fetchCategories();
  }, []); // Only fetch when component mounts

  useEffect(() => {
    if (search) {
      fetchCategories(1, pagination.pageSize);
    }
  }, [search]);

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
      render: (name) => <span>{name}</span>,
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
      dataIndex: 'created_at',
      key: 'created_at',
      render: (createdAt) => dayjs(createdAt).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (updatedAt) => dayjs(updatedAt).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDeleteCategory(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAddCategory = () => {
    form.resetFields();
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

  return (
    <Card>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space className="flex justify-between items-center" direction="horizontal">
            <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
              Thêm danh mục
            </Button>
          </Space>
        </Col>

        <Col span={24}>
          <Input
            placeholder="Tìm kiếm danh mục..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '300px' }}
          />
        </Col>

        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic
                      title="Tổng số danh mục"
                      value={categoryStats.total}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Hiển thị"
                      value={categoryStats.active}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Ẩn"
                      value={categoryStats.inactive}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card>
                <Table
                  columns={columns}
                  dataSource={categories}
                  loading={loading}
                  pagination={pagination}
                  onChange={(pagination) => fetchCategories(pagination.current, pagination.pageSize)}
                  rowKey="_id"
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
        className={styles.customModal}
      >
        <Card>
          <Form form={form} layout="vertical">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Tên danh mục"
                  rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                >
                  <Input placeholder="Nhập tên danh mục" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Mô tả"
                >
                  <Input.TextArea placeholder="Nhập mô tả danh mục" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                  <Select placeholder="Chọn trạng thái">
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
    </Card>
  );
};

export default CategoryPage;