import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  Button,
  Tag,
  Tooltip,
  message,
  Table,
  Space,
  Typography,
  Avatar,
  Popconfirm,
} from "antd";
import {
  BookOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseService } from '../../../services/apiService';
import type { Course } from '../../../services/apiService';
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { Option } = Select;

const FADE_IN_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const MyCourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [displayStatusFilter, setDisplayStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await courseService.getInstructorCourses();
        setCourses(data);
      } catch {
        setCourses([]);
        message.error('Không thể lấy danh sách khóa học.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      const matchesDisplayStatus = displayStatusFilter === 'all' ||
        (displayStatusFilter === 'hidden' && course.displayStatus === 'hidden') ||
        (displayStatusFilter === 'published' && course.displayStatus === 'published');
      return matchesSearch && matchesStatus && matchesDisplayStatus;
    });
  }, [courses, searchTerm, statusFilter, displayStatusFilter]);

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      const success = await courseService.deleteCourse(id);
      if (success) {
        setCourses((prev) => prev.filter((course) => course.id !== id));
        message.success("Đã xóa khóa học thành công.");
      } else {
        message.error("Không thể xóa khóa học. Vui lòng thử lại.");
      }
    } catch (error: unknown) {
      console.error('Lỗi khi xóa khóa học:', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa khóa học.";
      message.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (courseId: string) => {
    try {
      await courseService.updateCourseStatus(courseId, { status: 'pending' });
      // Cập nhật trạng thái khóa học trong state
      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, status: 'pending' } : course
        )
      );
      message.success("Đã gửi khóa học để duyệt thành công.");
    } catch (error: unknown) {
      console.error('Lỗi khi gửi khóa học:', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi gửi khóa học.";
      message.error(errorMessage);
    }
  };

  const columns: ColumnsType<Course> = [
    {
      title: "Khóa học",
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <div 
          style={{ 
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            border: '1px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
            e.currentTarget.style.borderColor = '#667eea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          onClick={() => navigate(`/instructor/courses/${record.id}`)}
        >
          <Space size="middle">
            <Avatar 
              shape="square" 
              size={64} 
              src={record.Image} 
              className="course-avatar"
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            />
            <div>
              <Text strong style={{ 
                fontSize: '16px', 
                color: '#2c3e50',
                display: 'block',
                marginBottom: '4px'
              }}>
                {record.title}
              </Text>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                {record.type || 'Chưa phân loại'}
              </Text>
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      render: (price, record) => {
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice === 0) {
          return <Tag color="green">Miễn phí</Tag>;
        }

        const displayPrice = numPrice.toLocaleString('vi-VN') + 'đ';

        if (record.hasDiscount && record.discountPercent) {
          return (
            <div>
              <div style={{ color: '#52c41a', fontWeight: 'bold' }}>
                {displayPrice}
              </div>
              <Tag color="red">
                -{record.discountPercent}%
              </Tag>
            </div>
          );
        }

        return displayPrice;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: Course) => {
        const statusColors: Record<string, string> = {
          'draft': 'default',
          'pending': 'orange',
          'approved': 'green',
          'rejected': 'red'
        };

        const statusLabels: Record<string, string> = {
          'draft': 'Bản nháp',
          'pending': 'Chờ duyệt',
          'approved': 'Đã duyệt',
          'rejected': 'Bị từ chối'
        };

        return (
          <div>
            <Tag color={statusColors[status] || 'default'}>
              {statusLabels[status] || status}
            </Tag>
            {status === 'rejected' && record.rejection_reason && (
              <Tooltip title={record.rejection_reason}>
                <div className="text-xs text-red-500 mt-1 cursor-help">
                  Xem lý do từ chối
                </div>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'draft' && (
            <Tooltip title="Gửi để duyệt">
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => handleSubmit(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/instructor/courses/edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
                <span style={{ fontWeight: '600' }}>Xác nhận xóa khóa học</span>
              </Space>
            }
            description={
              <div style={{ maxWidth: '320px' }}>
                {/* Cảnh báo chính */}
                <div style={{
                  marginBottom: '12px',
                  padding: '12px',
                  backgroundColor: '#fff2f0',
                  border: '1px solid #ffccc7',
                  borderRadius: '6px'
                }}>
                  <Space>
                    <WarningOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
                    <span style={{ fontWeight: '500', color: '#262626' }}>
                      Bạn có chắc chắn muốn xóa khóa học này?
                    </span>
                  </Space>
                </div>

                {/* Danh sách nội dung */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    marginBottom: '8px',
                    color: '#595959',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Thao tác này sẽ xóa tất cả nội dung bao gồm:
                  </div>

                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#fafafa',
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px'
                  }}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>📚</span>
                        <span style={{ fontSize: '13px', color: '#595959' }}>Chương học</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>📖</span>
                        <span style={{ fontSize: '13px', color: '#595959' }}>Bài học</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>🎥</span>
                        <span style={{ fontSize: '13px', color: '#595959' }}>Video</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>❓</span>
                        <span style={{ fontSize: '13px', color: '#595959' }}>Quiz</span>
                      </div>
                    </Space>
                  </div>
                </div>

                {/* Cảnh báo cuối */}
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#fff2f0',
                  border: '1px solid #ffccc7',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <Space>
                    <span style={{ fontSize: '14px' }}>⚠️</span>
                    <span style={{
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#ff4d4f'
                    }}>
                      Hành động này không thể hoàn tác!
                    </span>
                  </Space>
                </div>
              </div>
            }
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleteLoading === record.id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = useMemo(() => ({
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.status === 'published').length,
    draftCourses: courses.filter(c => c.status === 'draft').length,
    totalStudents: courses.reduce((total, course) => total + (course.students_count || 0), 0),
  }), [courses]);

  return (
    <div style={{ 
      padding: '32px 24px', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <style>{`
        .stats-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          border: none;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .stats-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
        }
        .main-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          border: none;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }
        .ant-table {
          background: transparent;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          font-weight: 600;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0;
          background: transparent;
        }
        .ant-table-tbody > tr:hover > td {
          background: rgba(102, 126, 234, 0.05) !important;
        }
        .course-avatar {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .search-input {
          border-radius: 12px;
          border: 2px solid #e8e8e8;
          transition: all 0.3s ease;
        }
        .search-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .filter-select {
          border-radius: 12px;
          border: 2px solid #e8e8e8;
        }
        .create-button {
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          height: 40px;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }
        .create-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }
        .page-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          margin-bottom: 32px;
        }
      `}</style>

      <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP_VARIANTS}>
        <Title level={2} className="page-title" style={{ textAlign: 'center' }}>
          Quản lý khóa học của tôi
        </Title>
        
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="stats-card">
                <Statistic 
                  title={<span style={{ color: '#667eea', fontWeight: '600' }}>Tổng số khóa học</span>}
                  value={stats.totalCourses} 
                  prefix={<BookOutlined style={{ color: '#667eea' }} />}
                  valueStyle={{ color: '#2c3e50', fontWeight: '700', fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="stats-card">
                <Statistic 
                  title={<span style={{ color: '#52c41a', fontWeight: '600' }}>Đã xuất bản</span>}
                  value={stats.publishedCourses} 
                  prefix={<BookOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontWeight: '700', fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="stats-card">
                <Statistic 
                  title={<span style={{ color: '#faad14', fontWeight: '600' }}>Chưa xuất bản</span>}
                  value={stats.draftCourses} 
                  prefix={<BookOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14', fontWeight: '700', fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="stats-card">
                <Statistic 
                  title={<span style={{ color: '#722ed1', fontWeight: '600' }}>Tổng học viên</span>}
                  value={stats.totalStudents} 
                  prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1', fontWeight: '700', fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{ ...FADE_IN_UP_VARIANTS, visible: { ...FADE_IN_UP_VARIANTS.visible, transition: { delay: 0.2 } } }}
      >
        <Card className="main-card">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <Title level={3} style={{ 
                margin: 0, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '700'
              }}>
                Danh sách khóa học
              </Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => navigate('/instructor/courses/create')}
                className="create-button"
                size="large"
              >
                Tạo khóa học mới
              </Button>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <Input
                placeholder="🔍 Tìm kiếm theo tên khóa học..."
                prefix={<SearchOutlined style={{ color: '#667eea' }} />}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: 300 }}
                allowClear
                className="search-input"
                size="large"
              />
              <Select
                defaultValue="all"
                onChange={setStatusFilter}
                style={{ width: 180 }}
                className="filter-select"
                size="large"
                placeholder="Trạng thái"
              >
                <Option value="all">📋 Tất cả trạng thái</Option>
                <Option value="draft">📝 Bản nháp</Option>
                <Option value="pending">⏳ Chờ duyệt</Option>
                <Option value="approved">✅ Đã duyệt</Option>
                <Option value="rejected">❌ Bị từ chối</Option>
              </Select>
              <Select
                defaultValue="all"
                onChange={setDisplayStatusFilter}
                style={{ width: 180 }}
                className="filter-select"
                size="large"
                placeholder="Hiển thị"
              >
                <Option value="all">👁️ Tất cả hiển thị</Option>
                <Option value="published">🌐 Đang hiển thị</Option>
                <Option value="hidden">🙈 Đang ẩn</Option>
              </Select>
            </div>
          </div>
          
          <Table
            columns={columns}
            dataSource={filteredCourses}
            loading={loading}
            rowKey="id"
            pagination={{ 
              pageSize: 8, 
              total: filteredCourses.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khóa học`,
              style: { marginTop: '24px' }
            }}
            style={{ borderRadius: '12px', overflow: 'hidden' }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default MyCourseList; 