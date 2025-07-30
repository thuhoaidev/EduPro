import React from 'react';
import { Card, Table, Tag, Button, Space } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';

const SimpleCoursesModeration: React.FC = () => {
  const columns = [
    {
      title: 'Tên khóa học',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
    },
    {
      title: 'Giảng viên',
      dataIndex: 'instructor',
      key: 'instructor',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
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
      title: 'React cơ bản đến nâng cao',
      instructor: 'Nguyễn Văn A',
      category: 'Lập trình Web',
      status: 'pending',
    },
    {
      key: '2',
      title: 'JavaScript ES6+ Masterclass',
      instructor: 'Trần Thị B',
      category: 'Lập trình Web',
      status: 'approved',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Duyệt Khóa học" style={{ marginBottom: '16px' }}>
        <p>Quản lý và duyệt các khóa học từ giảng viên.</p>
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default SimpleCoursesModeration; 