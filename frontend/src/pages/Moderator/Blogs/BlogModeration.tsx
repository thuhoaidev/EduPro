import { Table, Button, Tag, Space, message, Input, Card, Row, Col, Statistic, Popconfirm, Modal, Typography, Avatar, Tooltip, Badge, Image } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useEffect } from "react";
import { 
  CheckCircleOutlined, 
  EyeInvisibleOutlined, 
  SearchOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  FilterOutlined
} from "@ant-design/icons";
import { fetchBlogs, updateBlogStatus } from "../../../services/blogModerationService";

const { Title, Text, Paragraph } = Typography;

export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  author: { 
    _id: string; 
    fullname: string; 
    avatar?: string;
    name?: string;
  } | string;
  status: "pending" | "approved" | "hidden" | "rejected";
  createdAt: string;
  rejected_reason?: string;
}

const BlogModeration = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rejectModal, setRejectModal] = useState<{visible: boolean, blogId: string | null}>({visible: false, blogId: null});
  const [rejectReason, setRejectReason] = useState("");
  const [detailModal, setDetailModal] = useState<{visible: boolean, blog: BlogPost | null}>({visible: false, blog: null});

  // Thống kê số lượng bài viết theo trạng thái
  const total = blogs.length;
  const pending = blogs.filter(b => b.status === "pending").length;
  const approved = blogs.filter(b => b.status === "approved").length;
  const hidden = blogs.filter(b => b.status === "hidden").length;
  const rejected = blogs.filter(b => b.status === "rejected").length;

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const getBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetchBlogs();
      console.log("API response:", res.data.data);
      setBlogs(res.data.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      message.error("Không thể tải danh sách bài viết!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBlogs();
  }, []);

  const updateStatus = async (_id: string, newStatus: "approved" | "rejected") => {
    try {
      if (newStatus === "rejected") {
        setRejectModal({visible: true, blogId: _id});
        return;
      }
      await updateBlogStatus(_id, newStatus);
      await getBlogs();
      message.success(
        `Bài viết đã được ${newStatus === "approved" ? "duyệt" : "từ chối"} thành công`
      );
    } catch (err) {
      message.error("Cập nhật trạng thái thất bại!");
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối!");
      return;
    }
    if (rejectModal.blogId) {
      try {
        await updateBlogStatus(rejectModal.blogId, "rejected", rejectReason);
        setRejectModal({visible: false, blogId: null});
        setRejectReason("");
        await getBlogs();
        message.success("Bài viết đã bị từ chối thành công");
      } catch (err) {
        message.error("Cập nhật trạng thái thất bại!");
        console.error(err);
      }
    }
  };

  const handleViewDetail = (blog: BlogPost) => {
    setDetailModal({visible: true, blog});
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return { color: "green", text: "ĐÃ DUYỆT", icon: <CheckCircleFilled /> };
      case "pending":
        return { color: "orange", text: "CHỜ DUYỆT", icon: <ClockCircleOutlined /> };
      case "hidden":
        return { color: "red", text: "ĐÃ ẨN", icon: <EyeInvisibleOutlined /> };
      case "rejected":
        return { color: "red", text: "TỪ CHỐI", icon: <CloseCircleFilled /> };
      default:
        return { color: "default", text: status.toUpperCase(), icon: <FileTextOutlined /> };
    }
  };

  const columns: ColumnsType<BlogPost> = [
    {
      title: "#",
      dataIndex: "_id",
      width: 60,
      align: "center",
      render: (_: string, record, idx) => (
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
      title: "Tiêu đề",
      dataIndex: "title",
      render: (text) => (
        <div style={{ maxWidth: 300 }}>
          <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      width: 150,
      render: (author) => {
        // Kiểm tra xem author có phải là object không
        if (typeof author === 'object' && author !== null) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar 
                src={author.avatar}
                icon={<UserOutlined />} 
                size="small"
                style={{ 
                  backgroundColor: author.avatar ? 'transparent' : '#1890ff',
                  border: author.avatar ? '1px solid #d9d9d9' : 'none'
                }}
                onError={() => {
                  // Fallback khi avatar không tải được
                  return false;
                }}
              />
              <Text>{author.fullname || author.name || "Không rõ"}</Text>
            </div>
          );
        }
        // Nếu author là string
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar 
              icon={<UserOutlined />} 
              size="small"
              style={{ backgroundColor: '#1890ff' }}
            />
            <Text>{String(author) || "Không rõ"}</Text>
          </div>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 120,
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CalendarOutlined style={{ color: '#8c8c8c' }} />
          <Text type="secondary">{new Date(date).toLocaleDateString()}</Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      align: "center",
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag 
            color={config.color} 
            icon={config.icon}
            style={{ 
              margin: 0, 
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      width: 200,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              style={{ color: '#1890ff' }}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status !== "approved" && (
            <Popconfirm
              title="Xác nhận duyệt bài viết này?"
              description="Bài viết sẽ được hiển thị công khai sau khi duyệt"
              onConfirm={() => updateStatus(record._id, "approved")}
              okText="Duyệt"
              cancelText="Hủy"
              okButtonProps={{ 
                style: { 
                  background: '#52c41a',
                  borderColor: '#52c41a'
                } 
              }}
            >
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ 
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  borderRadius: '6px'
                }}
              >
                {record.status === "rejected" ? "Duyệt lại" : "Duyệt"}
              </Button>
            </Popconfirm>
          )}
          {record.status !== "rejected" && record.status !== "approved" && (
            <Button
              danger
              size="small"
              onClick={() => updateStatus(record._id, "rejected")}
              style={{ borderRadius: '6px' }}
            >
              Từ chối
            </Button>
          )}
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
          📝 Quản lý duyệt bài viết Blog
        </Title>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={12} sm={6} md={4}>
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
                    Tổng số bài
                  </Text>
                }
                value={total} 
                prefix={<FileTextOutlined style={{ color: '#1890ff', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#1890ff', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
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
                    Chờ duyệt
                  </Text>
                }
                value={pending} 
                prefix={<ClockCircleOutlined style={{ color: '#faad14', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#faad14', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
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
                    Đã duyệt
                  </Text>
                }
                value={approved} 
                prefix={<CheckCircleFilled style={{ color: '#52c41a', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
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
                    Từ chối
                  </Text>
                }
                value={rejected} 
                prefix={<CloseCircleFilled style={{ color: '#ff4d4f', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#ff4d4f', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
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
                value={hidden} 
                prefix={<EyeInvisibleOutlined style={{ color: '#8c8c8c', fontSize: '20px' }} />}
                valueStyle={{ 
                  color: '#8c8c8c', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
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
            <Input
              placeholder="🔍 Tìm kiếm bài viết theo tiêu đề..."
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
              {filteredBlogs.length} bài viết
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
            rowKey="_id"
            columns={columns}
            dataSource={filteredBlogs}
            pagination={{ 
              pageSize: 10, 
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài viết`,
              showSizeChanger: true,
              showQuickJumper: true,
              size: 'default'
            }}
            loading={loading}
            className="blog-moderation-table"
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Reject Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CloseCircleFilled style={{ color: '#ff4d4f' }} />
              <span>Lý do từ chối bài viết</span>
            </div>
          }
          open={rejectModal.visible}
          onOk={handleReject}
          onCancel={() => { 
            setRejectModal({visible: false, blogId: null}); 
            setRejectReason(""); 
          }}
          okText="Từ chối"
          cancelText="Hủy"
          okButtonProps={{ 
            danger: true,
            style: { borderRadius: '6px' }
          }}
          cancelButtonProps={{ 
            style: { borderRadius: '6px' }
          }}
          width={500}
        >
          <div style={{ marginTop: '16px' }}>
            <Paragraph style={{ marginBottom: '12px', color: '#666' }}>
              Vui lòng nhập lý do từ chối bài viết này để người dùng hiểu rõ và có thể cải thiện.
            </Paragraph>
            <Input.TextArea
              rows={4}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối bài viết..."
              style={{ 
                borderRadius: '8px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
        </Modal>

        {/* Blog Detail Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              <span>Chi tiết bài viết</span>
            </div>
          }
          open={detailModal.visible}
          onCancel={() => setDetailModal({visible: false, blog: null})}
          footer={null}
          width={800}
        >
          {detailModal.blog && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>
                  Tiêu đề:
                </Text>
                <div style={{ marginTop: '4px' }}>
                  <Text style={{ fontSize: '14px' }}>{detailModal.blog.title}</Text>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>
                  Tác giả:
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  {(() => {
                    const author = detailModal.blog.author;
                    if (typeof author === 'object' && author !== null) {
                      return (
                        <>
                          <Avatar 
                            src={author.avatar}
                            icon={<UserOutlined />} 
                            size="small"
                            style={{ 
                              backgroundColor: author.avatar ? 'transparent' : '#1890ff',
                              border: author.avatar ? '1px solid #d9d9d9' : 'none'
                            }}
                            onError={() => {
                              // Fallback khi avatar không tải được
                              return false;
                            }}
                          />
                          <Text>{author.fullname || author.name || 'Không rõ'}</Text>
                        </>
                      );
                    }
                    return (
                      <>
                        <Avatar 
                          icon={<UserOutlined />} 
                          size="small"
                          style={{ backgroundColor: '#1890ff' }}
                        />
                        <Text>{String(author) || 'Không rõ'}</Text>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>
                  Trạng thái:
                </Text>
                <div style={{ marginTop: '4px' }}>
                  {(() => {
                    const config = getStatusConfig(detailModal.blog.status);
                    return (
                      <Tag 
                        color={config.color} 
                        icon={config.icon}
                        style={{ 
                          margin: 0, 
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}
                      >
                        {config.text}
                      </Tag>
                    );
                  })()}
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>
                  Ngày tạo:
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <CalendarOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
                  <Text type="secondary">
                    {new Date(detailModal.blog.createdAt).toLocaleString("vi-VN", {
                      hour12: false,
                    })}
                  </Text>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>
                  Nội dung:
                </Text>
                <div style={{ 
                  marginTop: '8px', 
                  padding: '12px', 
                  background: '#f8fafc', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {(() => {
                      const content = detailModal.blog.content || "Không có nội dung";
                      if (typeof content === 'string') {
                        // Tách nội dung thành các phần: text và ảnh
                        const parts = [];
                        let lastIndex = 0;
                        
                        // Tìm markdown images ![alt](url)
                        const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
                        let match;
                        while ((match = markdownImageRegex.exec(content)) !== null) {
                          // Thêm text trước ảnh
                          if (match.index > lastIndex) {
                            parts.push({
                              type: 'text',
                              content: content.slice(lastIndex, match.index)
                            });
                          }
                          
                          // Thêm ảnh
                          parts.push({
                            type: 'image',
                            src: match[2],
                            alt: match[1] || 'Ảnh minh họa'
                          });
                          
                          lastIndex = match.index + match[0].length;
                        }
                        
                        // Thêm phần text còn lại
                        if (lastIndex < content.length) {
                          parts.push({
                            type: 'text',
                            content: content.slice(lastIndex)
                          });
                        }
                        
                        // Render các phần
                        return (
                          <div style={{ lineHeight: '1.6' }}>
                            {parts.map((part, index) => {
                              if (part.type === 'text') {
                                return (
                                  <div key={index} style={{ whiteSpace: 'pre-wrap' }}>
                                    {part.content}
                                  </div>
                                );
                              } else if (part.type === 'image') {
                                return (
                                  <div key={index} style={{ margin: '16px 0', textAlign: 'center' }}>
                                    <img 
                                      src={part.src} 
                                      alt={part.alt}
                                      style={{ 
                                        maxWidth: '100%', 
                                        height: 'auto', 
                                        borderRadius: '8px', 
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
                                      }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                    {part.alt && part.alt !== 'Ảnh minh họa' && (
                                      <div style={{ 
                                        marginTop: '8px', 
                                        fontSize: '12px', 
                                        color: '#666', 
                                        fontStyle: 'italic' 
                                      }}>
                                        {part.alt}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        );
                      }
                      return <Text>{content}</Text>;
                    })()}
                  </div>
                </div>
              </div>
              
              {detailModal.blog.rejected_reason && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>
                    Lý do từ chối:
                  </Text>
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '12px', 
                    background: '#fff2f0', 
                    borderRadius: '8px',
                    border: '1px solid #ffccc7'
                  }}>
                    <Text style={{ color: '#cf1322' }}>
                      {detailModal.blog.rejected_reason}
                    </Text>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        <style>{`
          .blog-moderation-table .ant-table-thead > tr > th {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            font-weight: 600;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding: 16px 12px;
          }
          .blog-moderation-table .ant-table-tbody > tr:hover > td {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          }
          .blog-moderation-table .ant-table-tbody > tr > td {
            padding: 16px 12px;
            border-bottom: 1px solid #f1f5f9;
          }
          .blog-moderation-table .ant-table-pagination {
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

export default BlogModeration;
