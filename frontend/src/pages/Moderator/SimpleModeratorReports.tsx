import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Input } from 'antd';
import { SearchOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';

const SimpleModeratorReports: React.FC = () => {
  const [search, setSearch] = useState('');

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
    },
    {
      title: 'Người báo cáo',
      dataIndex: 'reporterName',
      key: 'reporterName',
    },
    {
      title: 'Ngày báo cáo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'orange' : 'green'}>
          {status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record: any) => (
        <Space>
          <Button type="primary" icon={<EyeOutlined />} size="small">
            Xem
          </Button>
          {record.status === 'pending' && (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              size="small" 
              style={{ backgroundColor: '#52c41a' }}
            >
              Xử lý
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      title: 'Báo cáo vi phạm nội dung',
      reporterName: 'Nguyễn Văn A',
      createdAt: '2024-05-20',
      status: 'pending',
    },
    {
      key: '2',
      title: 'Báo cáo lỗi kỹ thuật',
      reporterName: 'Trần Thị B',
      createdAt: '2024-04-15',
      status: 'resolved',
    },
    {
      key: '3',
      title: 'Báo cáo hành vi không phù hợp',
      reporterName: 'Lê Văn C',
      createdAt: '2024-05-01',
      status: 'pending',
    },
  ];

  const filteredData = data.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.reporterName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Báo cáo vi phạm" style={{ marginBottom: '16px' }}>
        <p>Quản lý và xử lý các báo cáo vi phạm từ người dùng.</p>
      </Card>
      
      <Card style={{ marginBottom: '16px' }}>
        <Input
          placeholder="Tìm kiếm báo cáo..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={filteredData} 
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default SimpleModeratorReports; 