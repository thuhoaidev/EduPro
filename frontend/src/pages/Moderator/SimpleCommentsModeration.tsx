import React from 'react';
import { Card, Table, Tag, Button, Space } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const SimpleCommentsModeration: React.FC = () => {
  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: '40%',
    },
    {
      title: 'Người bình luận',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Bài viết',
      dataIndex: 'post',
      key: 'post',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'orange' : status === 'approved' ? 'green' : 'red'}>
          {status === 'pending' ? 'Chờ duyệt' : status === 'approved' ? 'Đã duyệt' : 'Bị xóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="primary" icon={<EyeOutlined />} size="small">
            Xem
          </Button>
          <Button type="primary" icon={<DeleteOutlined />} size="small" danger>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      content: 'Bài viết rất hay và hữu ích!',
      author: 'Nguyễn Văn A',
      post: 'Hướng dẫn React cơ bản',
      status: 'pending',
    },
    {
      key: '2',
      content: 'Cảm ơn tác giả đã chia sẻ',
      author: 'Trần Thị B',
      post: 'JavaScript ES6+ Features',
      status: 'approved',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Quản lý Bình luận" style={{ marginBottom: '16px' }}>
        <p>Kiểm tra và quản lý các bình luận từ người dùng.</p>
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default SimpleCommentsModeration; 