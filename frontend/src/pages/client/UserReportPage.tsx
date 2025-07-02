import React, { useState, useEffect } from 'react';
import { Form, Input, Button, List, message } from 'antd';
import { reportService } from '../../services/reportService';

interface Report {
  _id: string;
  title: string;
  content: string;
  status: string;
  adminReply?: string;
}

interface UserReportPageProps {
  userId: string;
}

const UserReportPage: React.FC<UserReportPageProps> = ({ userId }) => {
  const [form] = Form.useForm();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await reportService.getUserReports(userId);
      setReports(res.data.data);
    } catch (error) {
      message.error('Không thể tải lịch sử báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { title: string; content: string }) => {
    try {
      await reportService.create({ ...values, userId });
      message.success('Đã gửi báo cáo');
      form.resetFields();
      fetchReports();
    } catch (error) {
      message.error('Gửi báo cáo thất bại');
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [userId]);

  if (!userId) return <div>Vui lòng đăng nhập để gửi báo cáo.</div>;

  return (
    <>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}> 
          <Input.TextArea rows={4} />
        </Form.Item>
        <Button type="primary" htmlType="submit">Gửi Báo Cáo</Button>
      </Form>

      <List
        header={<b>Lịch sử báo cáo</b>}
        dataSource={reports}
        loading={loading}
        renderItem={(item) => (
          <List.Item key={item._id}>
            <div>
              <b>{item.title}</b> - {item.status}
              <p>{item.content}</p>
              {item.adminReply && <p><b>Phản hồi:</b> {item.adminReply}</p>}
            </div>
          </List.Item>
        )}
      />
    </>
  );
};

export default UserReportPage;