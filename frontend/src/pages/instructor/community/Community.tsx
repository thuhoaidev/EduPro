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
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

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

  useEffect(() => {
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

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <Card title="Bình luận khóa học" style={{ marginBottom: 24 }}>
        <Form form={commentForm} onFinish={onCommentFinish}>
          <Form.Item
            name="content"
            rules={[{ required: true, message: "Vui lòng nhập bình luận!" }]}
          >
            <Input.TextArea rows={2} placeholder="Nhập bình luận..." />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">
              Gửi bình luận
            </Button>
          </Form.Item>
        </Form>
        <Divider />
        <List
          dataSource={comments}
          itemLayout="horizontal"
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <div>
                    <strong>{item.author}</strong>{" "}
                    <Tag color="default" style={{ marginLeft: 8 }}>
                      {item.date}
                    </Tag>
                  </div>
                }
                description={item.content}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title="Nhóm học tập (Chat)">
        <div
          style={{
            maxHeight: 300,
            overflowY: "auto",
            marginBottom: 16,
            padding: 8,
            border: "1px solid #f0f0f0",
            borderRadius: 4,
          }}
        >
          {chatMessages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 12 }}>
              <strong>{msg.sender}</strong>{" "}
              <Tag color="default">{msg.time}</Tag>
              <div>{msg.content}</div>
            </div>
          ))}
        </div>
        <Form form={chatForm} onFinish={onChatFinish}>
          <Form.Item
            name="content"
            rules={[{ required: true, message: "Nhập tin nhắn!" }]}
          >
            <Input.TextArea rows={2} placeholder="Nhập tin nhắn..." />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">
              Gửi tin nhắn
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CourseDiscussion;
