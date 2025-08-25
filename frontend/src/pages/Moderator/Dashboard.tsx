import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Tag, Button, Space, Typography, Divider, message } from 'antd';
import { 
  FileSearchOutlined, 
  CommentOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled
} from '@ant-design/icons';
import { fetchReports } from '../../services/reportModerationService';
import { fetchBlogs } from '../../services/blogModerationService';
import { fetchComments } from '../../services/commentModerationService';

const { Title, Text, Paragraph } = Typography;

interface DashboardStats {
  pendingReports: number;
  pendingBlogs: number;
  pendingComments: number;
  todayResolved: number;
}

interface RecentActivity {
  id: string;
  type: 'report' | 'blog' | 'comment' | 'course';
  title: string;
  description: string;
  time: string;
  status: 'pending' | 'resolved' | 'approved' | 'rejected';
  user: string;
  userAvatar?: string;
}

const ModeratorDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    pendingReports: 0,
    pendingBlogs: 0,
    pendingComments: 0,
    todayResolved: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [reportsRes, blogsRes, commentsRes] = await Promise.all([
          fetchReports('pending'),
          fetchBlogs('pending'),
          fetchComments()
        ]);

        const reports = reportsRes.data.data || [];
        const blogs = blogsRes.data.data || [];
        const comments = commentsRes.data.data || [];

        // Calculate today's resolved items
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayResolved = reports.filter((report: any) => {
          if (report.status === 'resolved') {
            const resolvedDate = new Date(report.updatedAt || report.createdAt);
            resolvedDate.setHours(0, 0, 0, 0);
            return resolvedDate.getTime() === today.getTime();
          }
          return false;
        }).length;

        setStats({
          pendingReports: reports.length,
          pendingBlogs: blogs.length,
          pendingComments: comments.filter((c: any) => c.status === 'pending').length,
          todayResolved
        });

        // Generate recent activities from real data
        const activities: RecentActivity[] = [];
        
                 // Add recent reports
         reports.slice(0, 2).forEach((report: any) => {
           activities.push({
             id: report._id,
             type: 'report',
             title: `Báo cáo: ${report.title}`,
             description: '', // Không hiển thị nội dung
             time: getTimeAgo(report.createdAt),
             status: report.status,
             user: report.userId?.name || report.userId?.fullname || 'Ẩn danh',
             userAvatar: report.userId?.avatar
           });
         });

         // Add recent blogs
         blogs.slice(0, 2).forEach((blog: any) => {
           activities.push({
             id: blog._id,
             type: 'blog',
             title: `Blog: ${blog.title}`,
             description: '', // Không hiển thị nội dung
             time: getTimeAgo(blog.createdAt),
             status: blog.status,
             user: blog.author?.fullname || blog.author?.nickname || 'Ẩn danh',
             userAvatar: blog.author?.avatar
           });
         });

         // Add recent comments
         const pendingComments = comments.filter((c: any) => c.status === 'pending').slice(0, 2);
         pendingComments.forEach((comment: any) => {
           activities.push({
             id: comment._id,
             type: 'comment',
             title: 'Bình luận cần kiểm tra',
             description: '', // Không hiển thị nội dung
             time: getTimeAgo(comment.createdAt),
             status: comment.status,
             user: comment.author?.fullname || comment.author?.nickname || 'Ẩn danh',
             userAvatar: comment.author?.avatar
           });
         });

        // Sort by time and take first 4
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setRecentActivities(activities.slice(0, 4));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        message.error('Lỗi tải dữ liệu dashboard');
        
        // Fallback to mock data if API fails
        setStats({
          pendingReports: 15,
          pendingBlogs: 8,
          pendingComments: 23,
          todayResolved: 12
        });
        
                 setRecentActivities([
           {
             id: '1',
             type: 'report',
             title: 'Báo cáo vi phạm khóa học',
             description: '', // Không hiển thị nội dung
             time: '2 phút trước',
             status: 'pending',
             user: 'Nguyễn Văn A',
             userAvatar: undefined
           },
           {
             id: '2',
             type: 'blog',
             title: 'Blog mới cần duyệt',
             description: '', // Không hiển thị nội dung
             time: '15 phút trước',
             status: 'pending',
             user: 'Trần Thị B',
             userAvatar: undefined
           },
           {
             id: '3',
             type: 'comment',
             title: 'Bình luận spam',
             description: '', // Không hiển thị nội dung
             time: '1 giờ trước',
             status: 'resolved',
             user: 'Lê Văn C',
             userAvatar: undefined
           },
           {
             id: '4',
             type: 'course',
             title: 'Khóa học mới',
             description: '', // Không hiển thị nội dung
             time: '2 giờ trước',
             status: 'approved',
             user: 'Phạm Thị D',
             userAvatar: undefined
           }
         ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'report':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'blog':
        return <FileSearchOutlined style={{ color: '#1890ff' }} />;
      case 'comment':
        return <CommentOutlined style={{ color: '#52c41a' }} />;
      case 'course':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return <UserOutlined />;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange" icon={<ClockCircleOutlined />}>Chờ xử lý</Tag>;
      case 'resolved':
        return <Tag color="green" icon={<CheckCircleFilled />}>Đã xử lý</Tag>;
      case 'approved':
        return <Tag color="blue" icon={<CheckCircleFilled />}>Đã duyệt</Tag>;
      case 'rejected':
        return <Tag color="red" icon={<CloseCircleFilled />}>Đã từ chối</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  const totalPending = stats.pendingReports + stats.pendingBlogs + stats.pendingComments;
  const progressPercent = totalPending > 0 ? (stats.todayResolved / totalPending) * 100 : 0;

  // Hàm xử lý xem chi tiết item
  const handleViewItem = (item: RecentActivity) => {
    switch (item.type) {
      case 'report':
        // Chuyển đến trang xem báo cáo
        window.open(`/admin/reports/${item.id}`, '_blank');
        break;
      case 'blog':
        // Chuyển đến trang xem blog
        window.open(`/moderator/blogs/${item.id}`, '_blank');
        break;
      case 'comment':
        // Chuyển đến trang xem bình luận
        window.open(`/moderator/comments/${item.id}`, '_blank');
        break;
      case 'course':
        // Chuyển đến trang xem khóa học
        window.open(`/admin/courses/${item.id}`, '_blank');
        break;
      default:
        break;
    }
  };

  // Hàm xử lý xử lý item
  const handleProcessItem = (item: RecentActivity) => {
    switch (item.type) {
      case 'report':
        // Chuyển đến trang xử lý báo cáo
        window.open(`/admin/reports/${item.id}`, '_blank');
        break;
      case 'blog':
        // Chuyển đến trang xử lý blog
        window.open(`/moderator/blogs/${item.id}`, '_blank');
        break;
      case 'comment':
        // Chuyển đến trang xử lý bình luận
        window.open(`/moderator/comments/${item.id}`, '_blank');
        break;
      default:
        break;
    }
  };

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
          🛡️ Bảng điều khiển Kiểm duyệt viên
        </Title>
        
        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>
                    Báo cáo chờ xử lý
                  </Text>
                }
                value={stats.pendingReports}
                prefix={<WarningOutlined style={{ color: '#faad14', fontSize: '24px' }} />}
                valueStyle={{ 
                  color: '#faad14', 
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={totalPending > 0 ? (stats.pendingReports / totalPending) * 100 : 0} 
                      size="small" 
                      strokeColor="#faad14"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>
                    Blog cần duyệt
                  </Text>
                }
                value={stats.pendingBlogs}
                prefix={<FileSearchOutlined style={{ color: '#1890ff', fontSize: '24px' }} />}
                valueStyle={{ 
                  color: '#1890ff', 
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={totalPending > 0 ? (stats.pendingBlogs / totalPending) * 100 : 0} 
                      size="small" 
                      strokeColor="#1890ff"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>
                    Bình luận cần kiểm tra
                  </Text>
                }
                value={stats.pendingComments}
                prefix={<CommentOutlined style={{ color: '#52c41a', fontSize: '24px' }} />}
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={totalPending > 0 ? (stats.pendingComments / totalPending) * 100 : 0} 
                      size="small" 
                      strokeColor="#52c41a"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }}
            >
              <Statistic
                title={
                  <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>
                    Đã xử lý hôm nay
                  </Text>
                }
                value={stats.todayResolved}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />}
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ marginTop: '8px' }}>
                    <Progress 
                      percent={progressPercent} 
                      size="small" 
                      strokeColor="#52c41a"
                      showInfo={false}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Recent Activities */}
          <Col xs={24} lg={16}>
            <Card 
              title={
                <Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                  📋 Hoạt động gần đây
                </Title>
              }
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }}
            >
              <List
                itemLayout="horizontal"
                dataSource={recentActivities}
                loading={loading}
                renderItem={(item) => (
                  <List.Item
                    style={{ 
                      padding: '16px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                                                              actions={[
                      
                       // Chỉ hiển thị nút Xử lý cho các item chưa được xử lý
                       (item.status === 'pending' || item.status === 'rejected') && (
                         <Button 
                           type="text" 
                           icon={<EditOutlined />} 
                           size="small"
                           style={{ color: '#52c41a' }}
                           onClick={() => handleProcessItem(item)}
                         >
                           Xử lý
                         </Button>
                       )
                     ].filter(Boolean)}
                  >
                    <List.Item.Meta
                                             avatar={
                         <Avatar 
                           src={item.userAvatar}
                           icon={getActivityIcon(item.type)}
                           style={{ 
                             backgroundColor: item.userAvatar ? 'transparent' : 
                                            item.type === 'report' ? '#fff2e8' : 
                                            item.type === 'blog' ? '#e6f7ff' : 
                                            item.type === 'comment' ? '#f6ffed' : '#f0f9ff'
                           }}
                         />
                       }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Text strong>{item.title}</Text>
                          {getStatusTag(item.status)}
                        </div>
                      }
                      description={
                        <div>
                          {item.description && (
                            <Paragraph style={{ margin: '4px 0', color: '#666' }}>
                              {item.description}
                            </Paragraph>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {item.user}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              ⏰ {item.time}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Quick Actions & Info */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Quick Actions */}
              <Card 
                title={
                  <Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                    ⚡ Thao tác nhanh
                  </Title>
                }
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: 'none'
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    block 
                    icon={<WarningOutlined />}
                    style={{ 
                      height: '48px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #faad14, #ff7a45)',
                      border: 'none'
                    }}
                  >
                    Xử lý báo cáo ({stats.pendingReports})
                  </Button>
                  <Button 
                    type="primary" 
                    block 
                    icon={<FileSearchOutlined />}
                    style={{ 
                      height: '48px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #1890ff, #722ed1)',
                      border: 'none'
                    }}
                  >
                    Duyệt blog ({stats.pendingBlogs})
                  </Button>
                  <Button 
                    type="primary" 
                    block 
                    icon={<CommentOutlined />}
                    style={{ 
                      height: '48px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                      border: 'none'
                    }}
                  >
                    Kiểm tra bình luận ({stats.pendingComments})
                  </Button>
                  <Button 
                    type="primary" 
                    block 
                    icon={<CheckCircleOutlined />}
                    style={{ 
                      height: '48px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #13c2c2, #36cfc9)',
                      border: 'none'
                    }}
                  >
                    Duyệt khóa học
                  </Button>
                </Space>
              </Card>

                             {/* System Info */}
               <Card 
                 title={
                   <Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                     ℹ️ Thông tin hệ thống
                   </Title>
                 }
                 style={{ 
                   borderRadius: '12px',
                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                   border: 'none'
                 }}
               >
                 <div style={{ lineHeight: '2' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <Text>Trạng thái hệ thống:</Text>
                     <Tag color="green">Hoạt động</Tag>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <Text>Báo cáo:</Text>
                     <Text strong style={{ color: '#faad14' }}>{stats.pendingReports}</Text>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <Text>Blog:</Text>
                     <Text strong style={{ color: '#1890ff' }}>{stats.pendingBlogs}</Text>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <Text>Bình luận:</Text>
                     <Text strong style={{ color: '#52c41a' }}>{stats.pendingComments}</Text>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <Text>Tổng:</Text>
                     <Text strong style={{ color: '#faad14' }}>{totalPending}</Text>
                   </div>
                 </div>
               </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ModeratorDashboard; 