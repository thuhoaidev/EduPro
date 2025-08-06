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
        <Space style={{ cursor: 'pointer' }} onClick={() => navigate(`/instructor/courses/${record.id}`)}>
          <Avatar shape="square" size={64} src={record.Image} />
          <Text strong>{record.title}</Text>
        </Space>
      ),
    },
    {
      title: "Học viên",
      dataIndex: "students",
      key: "students",
      render: () => Math.floor(Math.random() * 500) + 50,
    },
    {
      title: "Giá gốc",
      dataIndex: "oldPrice",
      key: "oldPrice",
      render: (oldPrice, record) => {
        if (!record.hasDiscount || !oldPrice) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <span style={{ textDecoration: 'line-through', color: '#999' }}>
            {Number(oldPrice).toLocaleString('vi-VN')}đ
          </span>
        );
      },
    },
    {
      title: "Giá đã giảm",
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
      title: "Trạng thái hiển thị",
      key: "displayStatus",
      render: (_, record) => {
        const isApproved = record.status === 'approved' || record.status === 'published';
        const displayOptions = [
          { value: 'published', label: 'Hiển thị' },
          { value: 'hidden', label: 'Ẩn' }
        ];
        const handleChangeDisplay = async (value: string) => {
          try {
            await courseService.updateCourseStatus(record.id, { displayStatus: value });
            setCourses((prev) =>
              prev.map((course) =>
                course.id === record.id ? { ...course, displayStatus: value } : course
              )
            );
            message.success(value === 'published' ? 'Đã chuyển sang hiển thị' : 'Đã ẩn khóa học');
          } catch (err) {
            console.error('Lỗi khi thay đổi trạng thái hiển thị:', err);
            message.error('Không thể thay đổi trạng thái hiển thị');
          }
        };
        return (
          <Space>
            <Select
              value={record.displayStatus || 'published'}
              style={{ width: 120 }}
              onChange={handleChangeDisplay}
              disabled={!isApproved}
              options={displayOptions}
            />
          </Space>
        );
      },
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt: string) => dayjs(updatedAt).format('DD/MM/YYYY HH:mm'),
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
    totalStudents: 1234,
  }), [courses]);

  return (
    <div style={{ padding: 24 }}>
      <style>{`
        .ant-table-row:hover {
          background-color: #fafafa !important;
        }
        .ant-table-row:hover td {
            background: #fafafa !important;
        }
      `}</style>
      <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP_VARIANTS}>
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col span={6}><motion.div whileHover={{ y: -5 }}><Card><Statistic title="Tổng số khóa học" value={stats.totalCourses} prefix={<BookOutlined />} /></Card></motion.div></Col>
          <Col span={6}><motion.div whileHover={{ y: -5 }}><Card><Statistic title="Đã xuất bản" value={stats.publishedCourses} prefix={<BookOutlined />} valueStyle={{ color: '#3f8600' }} /></Card></motion.div></Col>
          <Col span={6}><motion.div whileHover={{ y: -5 }}><Card><Statistic title="Chưa xuất bản" value={stats.draftCourses} prefix={<BookOutlined />} valueStyle={{ color: '#cf1322' }} /></Card></motion.div></Col>
          <Col span={6}><motion.div whileHover={{ y: -5 }}><Card><Statistic title="Tổng học viên" value={stats.totalStudents} prefix={<UserOutlined />} /></Card></motion.div></Col>
        </Row>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={{ ...FADE_IN_UP_VARIANTS, visible: { ...FADE_IN_UP_VARIANTS.visible, transition: { delay: 0.2 } } }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Title level={4} style={{ margin: 0 }}>Danh sách khóa học của tôi</Title>
            <Space>
              <Input
                placeholder="Tìm kiếm theo tên..."
                prefix={<SearchOutlined />}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                defaultValue="all"
                onChange={setStatusFilter}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="draft">Bản nháp</Option>
                <Option value="pending">Chờ duyệt</Option>
                <Option value="approved">Đã duyệt</Option>
                <Option value="rejected">Bị từ chối</Option>
              </Select>
              <Select
                defaultValue="all"
                onChange={setDisplayStatusFilter}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả hiển thị</Option>
                <Option value="published">Đang hiển thị</Option>
                <Option value="hidden">Đang ẩn</Option>
              </Select>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/instructor/courses/create')}>
                Tạo khóa học mới
              </Button>
            </Space>
          </div>
          <Table
            columns={columns}
            dataSource={filteredCourses}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 5, total: filteredCourses.length }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default MyCourseList; 