import React, { useEffect, useState } from "react";
import {
  Card,
  List,
  Avatar,
  Input,
  Button,
  Divider,
  Form,
  Tag,
  Row,
  Col,
  Statistic,
  Space,
} from "antd";
import { UserOutlined, MessageOutlined, TeamOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import leoProfanity from 'leo-profanity';

interface Comment {
  id: number;
  author: string;
  avatar?: string;
  content: string;
  date: string;
}

interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  time: string;
}

const CourseDiscussion: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [commentForm] = Form.useForm();
  const [chatForm] = Form.useForm();
  const [commentContent, setCommentContent] = useState('');
  const [chatContent, setChatContent] = useState('');
  const [commentWarning, setCommentWarning] = useState('');
  const [chatWarning, setChatWarning] = useState('');

  useEffect(() => {
    leoProfanity.add([
      'đm', 'dm', 'cc', 'vcl', 'clm', 'cl', 'dcm', 'địt', 'dit', 'lồn', 'lon', 'cặc', 'cu', 'buồi', 'buoi', 'đụ', 'đéo', 'má', 'me', 'mẹ', 'bố', 'bo', 'chim', 'cai', 'cai...', 'thang', 'thang...', 'con', 'con...', 'chó', 'cho', 'cho chet', 'do ngu', 'mặt dày', 'mat day', 'chó chết', 'cho chet', 'ngu', 'fuck', 'shit'
    ]);
    setComments([
      {
        id: 1,
        author: "Nguyễn Văn A",
        content: "Mình có thắc mắc về bài học 3, ai giải đáp giúp?",
        date: "2025-05-20 10:15",
      },
      {
        id: 2,
        author: "Trần Thị B",
        content: "Bài 3 mình hiểu rồi, bạn thử dùng useEffect nhé.",
        date: "2025-05-20 10:45",
      },
    ]);
    setChatMessages([
      {
        id: 1,
        sender: "Nguyễn Văn A",
        content: "Mọi người ơi, giờ ai rảnh cùng trao đổi bài tập không?",
        time: "10:00",
      },
      {
        id: 2,
        sender: "Trần Thị B",
        content: "Mình rảnh lúc 10:30, bạn nhắn trước nhé.",
        time: "10:05",
      },
    ]);
  }, []);

  const onCommentFinish = (values: { content: string }) => {
    const newComment: Comment = {
      id: comments.length + 1,
      author: "Bạn (Giáo viên)",
      content: values.content,
      date: dayjs().format("YYYY-MM-DD HH:mm"),
    };
    setComments([newComment, ...comments]);
    commentForm.resetFields();
  };

  const onChatFinish = (values: { content: string }) => {
    const newMsg: ChatMessage = {
      id: chatMessages.length + 1,
      sender: "Bạn (Giáo viên)",
      content: values.content,
      time: dayjs().format("HH:mm"),
    };
    setChatMessages([...chatMessages, newMsg]);
    chatForm.resetFields();
  };

  // Calculate statistics
  const stats = {
    totalComments: comments.length,
    totalMessages: chatMessages.length,
    activeUsers: 12, // Mock data
    responseTime: "2h", // Mock data
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cộng đồng & Thảo luận</h2>
        <p className="text-gray-500 mt-1">Quản lý thảo luận và tương tác với học viên</p>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng số bình luận"
              value={stats.totalComments}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tin nhắn nhóm"
              value={stats.totalMessages}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Học viên đang hoạt động"
              value={stats.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Thời gian phản hồi trung bình"
              value={stats.responseTime}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Comments Section */}
        <Col xs={24} lg={12}>
          <Card 
            title="Bình luận khóa học" 
            className="shadow-sm h-full"
            extra={<Tag color="blue">{comments.length} bình luận</Tag>}
          >
            <Form form={commentForm} onFinish={onCommentFinish}>
              <Form.Item
                name="content"
                rules={[{ required: true, message: "Vui lòng nhập bình luận!" }]}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Nhập bình luận..." 
                  className="text-base"
                  value={commentContent}
                  onChange={(e) => {
                    setCommentContent(e.target.value);
                    if (leoProfanity.check(e.target.value)) setCommentWarning('⚠️ Bình luận của bạn chứa ngôn từ không phù hợp!');
                    else setCommentWarning('');
                  }}
                />
                {commentWarning && <div style={{ color: 'red', marginBottom: 8 }}>{commentWarning}</div>}
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" type="primary" size="large" block disabled={!commentContent.trim() || !!commentWarning}>
                  Gửi bình luận
                </Button>
              </Form.Item>
            </Form>
            <Divider />
            <List
              dataSource={comments}
              itemLayout="horizontal"
              className="comment-list"
              renderItem={(item) => (
                <List.Item className="hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} className="bg-blue-500" />}
                    title={
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{item.author}</span>
                        <Tag color="default" className="text-xs">
                          {dayjs(item.date).format("DD/MM/YYYY HH:mm")}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="text-gray-600 mt-1">
                        {item.content}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Chat Section */}
        <Col xs={24} lg={12}>
          <Card 
            title="Nhóm học tập" 
            className="shadow-sm h-full"
            extra={<Tag color="green">{chatMessages.length} tin nhắn</Tag>}
          >
            <div className="chat-container bg-gray-50 rounded-lg p-4 mb-4 h-[400px] overflow-y-auto">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className="mb-4 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{msg.sender}</span>
                    <Tag color="default" className="text-xs">
                      {msg.time}
                    </Tag>
                  </div>
                  <div className="text-gray-600">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <Form form={chatForm} onFinish={onChatFinish}>
              <Form.Item
                name="content"
                rules={[{ required: true, message: "Nhập tin nhắn!" }]}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Nhập tin nhắn..." 
                  className="text-base"
                  value={chatContent}
                  onChange={(e) => {
                    setChatContent(e.target.value);
                    if (leoProfanity.check(e.target.value)) setChatWarning('⚠️ Tin nhắn của bạn chứa ngôn từ không phù hợp!');
                    else setChatWarning('');
                  }}
                />
                {chatWarning && <div style={{ color: 'red', marginBottom: 8 }}>{chatWarning}</div>}
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" type="primary" size="large" block disabled={!chatContent.trim() || !!chatWarning}>
                  Gửi tin nhắn
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Custom styles */}
      <style>
        {`
          .comment-list .ant-list-item {
            padding: 12px;
            border-radius: 8px;
            transition: all 0.3s;
          }
          .comment-list .ant-list-item:hover {
            background-color: #f9fafb;
          }
          .chat-container::-webkit-scrollbar {
            width: 6px;
          }
          .chat-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          .chat-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
          }
          .chat-container::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>
    </div>
  );
};

export default CourseDiscussion;
