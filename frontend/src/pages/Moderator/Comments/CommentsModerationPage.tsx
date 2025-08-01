import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Tag,
  Button,
  Popconfirm,
  message,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Avatar,
  Badge,
  Tooltip,
  Modal,
  Progress,
} from "antd";
import { 
  SearchOutlined, 
  EyeInvisibleOutlined, 
  DeleteOutlined,
  UserOutlined,
  CommentOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleFilled,
} from "@ant-design/icons";
import { fetchComments, updateCommentStatus, deleteComment } from '../../../services/commentModerationService';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface Comment {
  id: string;
  content: string;
  userName: string;
  postTitle: string;
  createdAt: string;
  status?: "approved" | "hidden" | "pending";
}

const CommentsModerationPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filtered, setFiltered] = useState<Comment[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  useEffect(() => {
    const getComments = async () => {
      setLoading(true);
      try {
        const res = await fetchComments();
        setComments(res.data.data.map((c: any) => ({
          id: c?._id || Math.random().toString(36).slice(2),
          content: c?.content || "",
          userName: c?.author?.fullname || c?.author?.nickname || 'Ẩn danh',
          postTitle: c?.blog?.title || 'Không rõ',
          createdAt: c?.createdAt || '',
          status: c?.status || 'pending',
        })));
      } catch (err) {
        message.error('Lỗi tải danh sách bình luận');
      } finally {
        setLoading(false);
      }
    };
    getComments();
  }, []);

  useEffect(() => {
    let result = [...comments];
          if (searchText) {
        result = result.filter((c) =>
          c.content.toLowerCase().includes(searchText.toLowerCase()) ||
          c.userName.toLowerCase().includes(searchText.toLowerCase())
        );
      }
    setFiltered(result);
  }, [searchText, comments]);

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
      message.success('Đã xóa bình luận thành công!');
    } catch {
      message.error('Lỗi xóa bình luận!');
    }
  };

  const updateStatus = async (id: string, status: "hidden") => {
    try {
      await updateCommentStatus(id, status);
      setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      message.success('Đã ẩn bình luận thành công!');
    } catch {
      message.error('Lỗi cập nhật trạng thái bình luận!');
    }
  };

  const handleViewComment = (comment: Comment) => {
    setSelectedComment(comment);
    setViewModalVisible(true);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "hidden":
        return { color: "red", text: "ĐÃ ẨN", icon: <CloseCircleFilled /> };
      case "pending":
        return { color: "orange", text: "CHỜ XỬ LÝ", icon: <ClockCircleFilled /> };
      default:
        return { color: "default", text: "CHỜ XỬ LÝ", icon: <ClockCircleFilled /> };
    }
  };

  // Calculate statistics
  const stats = {
    totalComments: comments.length,
    pendingComments: comments.filter(c => c.status === 'pending').length,
    hiddenComments: comments.filter(c => c.status === 'hidden').length,
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center' as const,
      render: (_: any, record: Comment, idx: number) => (
        <Badge 
          count={idx + 1} 
          style={{ 
            backgroundColor: '#1890ff',
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      ),
    },
    {
      title: "Người bình luận",
      dataIndex: "userName",
      key: "userName",
      width: 150,
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar 
            icon={<UserOutlined />} 
            size="small"
            style={{ backgroundColor: '#1890ff' }}
          />
          <Text strong style={{ fontSize: '13px' }}>{text}</Text>
        </div>
      ),
    },
         {
       title: "Nội dung",
       dataIndex: "content",
       key: "content",
       width: 250,
       render: (text: string) => (
         <div style={{ maxWidth: 200 }}>
           <Paragraph 
             style={{ 
               margin: 0, 
               fontSize: '13px',
               color: '#1e293b',
               lineHeight: '1.4'
             }}
             ellipsis={{ 
               rows: 2, 
               expandable: true, 
               symbol: 'Xem thêm' 
             }}
           >
             {text}
           </Paragraph>
         </div>
       ),
     },

    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(date).toLocaleString("vi-VN", {
              hour12: false,
            })}
          </Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (_: any, record: Comment) => {
        const config = getStatusConfig(record.status || 'pending');
        return (
          <Tag 
            color={config.color} 
            icon={config.icon}
            style={{ 
              margin: 0, 
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '11px'
            }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 200,
      align: "center" as const,
      render: (_: any, record: Comment) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              style={{ color: '#1890ff' }}
              onClick={() => handleViewComment(record)}
            />
          </Tooltip>

          {record.status !== 'hidden' && (
            <Tooltip title="Ẩn bình luận">
              <Button
                size="small"
                icon={<EyeInvisibleOutlined />}
                style={{ 
                  color: '#faad14',
                  borderColor: '#faad14',
                  borderRadius: '6px'
                }}
                onClick={() => updateStatus(record.id, "hidden")}
              >
                Ẩn
              </Button>
            </Tooltip>
          )}
          <Popconfirm
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                <span>Xác nhận xóa bình luận</span>
              </div>
            }
            description="Bình luận này sẽ bị xóa vĩnh viễn và không thể khôi phục."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ 
              danger: true,
              style: { borderRadius: '6px' }
            }}
            cancelButtonProps={{ 
              style: { borderRadius: '6px' }
            }}
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              style={{ borderRadius: '6px' }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: '24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        borderRadius: '16px', 
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <Title level={2} style={{ 
          marginBottom: '32px', 
          color: '#1e293b',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          💬 Quản lý bình luận
        </Title>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={12} sm={4} md={4}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    Tổng số bình luận
                  </Text>
                }
                value={stats.totalComments}
                prefix={<CommentOutlined style={{ color: '#1890ff', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#1890ff', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={4} md={4}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    Chờ xử lý
                  </Text>
                }
                value={stats.pendingComments}
                prefix={<ClockCircleFilled style={{ color: '#faad14', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#faad14', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={stats.totalComments > 0 ? (stats.pendingComments / stats.totalComments) * 100 : 0} 
                      size="small" 
                      strokeColor="#faad14"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={12} sm={4} md={4}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    Đã ẩn
                  </Text>
                }
                value={stats.hiddenComments}
                prefix={<CloseCircleFilled style={{ color: '#ff4d4f', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#ff4d4f', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={stats.totalComments > 0 ? (stats.hiddenComments / stats.totalComments) * 100 : 0} 
                      size="small" 
                      strokeColor="#ff4d4f"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Search Bar */}
        <Card 
          style={{ 
            marginBottom: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FilterOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                         <Search
               placeholder="🔍 Tìm kiếm bình luận hoặc người dùng..."
               value={searchText}
               onChange={e => setSearchText(e.target.value)}
              style={{ 
                flex: 1,
                borderRadius: '8px',
                border: '1px solid #d9d9d9'
              }}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {filtered.length} bình luận
            </Text>
          </div>
        </Card>

        {/* Table */}
        <Card 
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
        >
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={{ 
              pageSize: 10, 
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bình luận`,
              showSizeChanger: true,
              showQuickJumper: true,
              size: 'default'
            }}
            className="comments-moderation-table"
            loading={loading}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* View Comment Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CommentOutlined style={{ color: '#1890ff' }} />
              <span>Chi tiết bình luận</span>
            </div>
          }
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedComment && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                  Người bình luận:
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Avatar 
                    icon={<UserOutlined />} 
                    size="small"
                    style={{ backgroundColor: '#1890ff' }}
                  />
                  <Text>{selectedComment.userName}</Text>
                </div>
              </div>
              
              
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                  Nội dung:
                </Text>
                <div style={{ 
                  marginTop: '8px', 
                  padding: '12px', 
                  background: '#f8fafc', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <Text>{selectedComment.content}</Text>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                  Thời gian:
                </Text>
                <div style={{ marginTop: '4px' }}>
                  <Text type="secondary">
                    {new Date(selectedComment.createdAt).toLocaleString("vi-VN", {
                      hour12: false,
                    })}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </Modal>

        <style>{`
          .comments-moderation-table .ant-table-thead > tr > th {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            font-weight: 600;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding: 16px 12px;
          }
          .comments-moderation-table .ant-table-tbody > tr:hover > td {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          }
          .comments-moderation-table .ant-table-tbody > tr > td {
            padding: 16px 12px;
            border-bottom: 1px solid #f1f5f9;
          }
          .comments-moderation-table .ant-table-pagination {
            margin: 16px 0 0 0;
          }
          .ant-tag {
            margin: 0;
          }
          .ant-card {
            transition: all 0.3s ease;
          }
          .ant-card:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    </div>
  );
};

export default CommentsModerationPage;
