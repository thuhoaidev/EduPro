import React from 'react';
import { Card, Table, Tag, Button, Space } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';

const SimpleBlogModeration: React.FC = () => {
  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'orange' : status === 'approved' ? 'green' : 'red'}>
          {status === 'pending' ? 'Chờ duyệt' : status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
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
          <Button type="primary" icon={<CheckOutlined />} size="small" style={{ backgroundColor: '#52c41a' }}>
            Duyệt
          </Button>
          <Button type="primary" icon={<CloseOutlined />} size="small" danger>
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      title: 'Hướng dẫn React cơ bản',
      author: 'Nguyễn Văn A',
      status: 'pending',
    },
    {
      key: '2',
      title: 'JavaScript ES6+ Features',
      author: 'Trần Thị B',
      status: 'approved',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Duyệt Blog" style={{ marginBottom: '16px' }}>
        <p>Quản lý và duyệt các bài viết blog từ người dùng.</p>
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default SimpleBlogModeration; 