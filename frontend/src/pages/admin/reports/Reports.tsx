import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Tag, Space } from 'antd';
import { reportService } from '../../../services/reportService';

interface Report {
  _id: string;
  userId: string;
  title: string;
  content: string;
  status: string;
  adminReply?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [form] = Form.useForm();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await reportService.getAll();
      setReports(res.data.data);
    } catch (error) {
      message.error('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (values: { adminReply: string }) => {
    if (!selectedReport) return;
    
    try {
      await reportService.reply(selectedReport._id, values.adminReply);
      message.success('Đã trả lời báo cáo');
      setReplyModalVisible(false);
      form.resetFields();
      fetchReports();
    } catch (error) {
      message.error('Trả lời báo cáo thất bại');
    }
  };

  const showReplyModal = (report: Report) => {
    setSelectedReport(report);
    setReplyModalVisible(true);
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {content}
        </div>
      ),
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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record: Report) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => showReplyModal(record)}
          >
            Trả lời
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h2>Quản lý báo cáo người dùng</h2>
      
      <Table
        columns={columns}
        dataSource={reports}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <Modal
        title="Trả lời báo cáo"
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedReport && (
          <div style={{ marginBottom: 16 }}>
            <h4>Báo cáo từ người dùng:</h4>
            <p><strong>Tiêu đề:</strong> {selectedReport.title}</p>
            <p><strong>Nội dung:</strong> {selectedReport.content}</p>
            {selectedReport.adminReply && (
              <p><strong>Phản hồi trước:</strong> {selectedReport.adminReply}</p>
            )}
          </div>
        )}
        
        <Form form={form} onFinish={handleReply}>
          <Form.Item
            name="adminReply"
            label="Phản hồi"
            rules={[{ required: true, message: 'Vui lòng nhập phản hồi' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập phản hồi cho người dùng..." />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Gửi phản hồi
              </Button>
              <Button onClick={() => setReplyModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportsPage;