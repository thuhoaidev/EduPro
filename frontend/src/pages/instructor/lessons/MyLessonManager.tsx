import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Input,
  Divider,
  Checkbox,
  Space,
  Select,
  Row,
  Col,
  Typography,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

// Mock data
const mockCourses = [
  { id: "course1", title: "ReactJS Toàn Tập" },
  { id: "course2", title: "Thiết kế Giao diện với Figma" },
];

const mockSections: Record<string, { id: string; title: string }[]> = {
  course1: [
    { id: "sec1", title: "Chương 1: Giới thiệu và Cài đặt" },
    { id: "sec2", title: "Chương 2: Components và Props" },
  ],
  course2: [
    { id: "sec3", title: "Chương 1: Làm quen Figma" },
    { id: "sec4", title: "Chương 2: Design System" },
  ],
};

const MyLessonManager = () => {
  const [form] = Form.useForm();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [sections, setSections] = useState<{ id: string; title: string }[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCourse) {
      setSections(mockSections[selectedCourse] || []);
      setSelectedSection(null);
      form.resetFields(['section']);
    } else {
      setSections([]);
    }
  }, [selectedCourse, form]);

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
  };
  
  const handleSectionChange = (value: string) => {
      setSelectedSection(value);
  }

  const onFinish = (values: any) => {
    console.log({ ...values, courseId: selectedCourse, sectionId: selectedSection });
  };

  const selectedSectionTitle = sections.find(s => s.id === selectedSection)?.title || "";

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Quản lý bài học</Title>
      <Text type="secondary">Thêm video và bài quiz cho từng bài học trong khóa học của bạn.</Text>
      
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>1. Chọn Khóa học & Chương</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Khóa học">
              <Select placeholder="Chọn khóa học" onChange={handleCourseChange} value={selectedCourse}>
                {mockCourses.map(course => <Option key={course.id} value={course.id}>{course.title}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Chương">
              <Select placeholder="Chọn chương" disabled={!selectedCourse} onChange={handleSectionChange} value={selectedSection}>
                {sections.map(section => <Option key={section.id} value={section.id}>{section.title}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {selectedSection && (
        <Card style={{ marginTop: 24 }}>
            <Title level={4}>2. Nội dung bài học cho chương: <Text type="success">{selectedSectionTitle}</Text></Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item label="Tiêu đề bài học" name="title" rules={[{ required: true, message: "Vui lòng nhập tiêu đề bài học" }]}> <Input placeholder="Nhập tiêu đề bài học" /> </Form.Item>
                <Form.Item name="is_preview" valuePropName="checked"> <Checkbox>Cho phép xem trước (Preview)</Checkbox> </Form.Item>
                <Divider>Video bài học</Divider>
                <Form.Item label="Tiêu đề video" name={["video", "title"]} rules={[{ required: true, message: "Nhập tiêu đề video" }]}> <Input placeholder="VD: Giới thiệu component trong React" /> </Form.Item>
                <Form.Item label="URL video" name={["video", "url"]} rules={[{ required: true, message: "Nhập URL video" }]}> <Input placeholder="Dán URL video từ YouTube, Vimeo,..." /> </Form.Item>
                
                <Divider>Quiz</Divider>
                <Form.List name={["quiz", "questions"]}>
                {(fields, { add, remove }) => (
                    <>
                    {fields.map(({ key, name }) => (
                        <Card key={key} size="small" title={`Câu hỏi ${key + 1}`} extra={<Button danger size="small" onClick={() => remove(name)}>Xóa</Button>} style={{ marginBottom: 16, background: '#fafafa' }}>
                        <Form.Item name={[name, "question"]} rules={[{ required: true, message: "Nhập nội dung câu hỏi" }]}> <TextArea rows={2} placeholder="Nội dung câu hỏi" /> </Form.Item>
                        <Form.List name={[name, "options"]}>
                            {(optionFields, { add: addOption, remove: removeOption }) => (
                            <>
                                {optionFields.map(({ key: optionKey, name: optionName }) => (
                                <Space key={optionKey} align="baseline" style={{ display: "flex", marginBottom: 8 }}>
                                    <Form.Item name={[optionName, "content"]} rules={[{ required: true, message: "Nhập nội dung đáp án" }]} style={{flex: 1}}> <Input placeholder={`Đáp án ${optionKey + 1}`} /> </Form.Item>
                                    <Form.Item name={[optionName, "isCorrect"]} valuePropName="checked"> <Checkbox>Đáp án đúng</Checkbox> </Form.Item>
                                    <MinusCircleOutlined onClick={() => removeOption(optionName)} />
                                </Space>
                                ))}
                                <Form.Item> <Button type="dashed" onClick={() => addOption({isCorrect: false})} block icon={<PlusOutlined />}>Thêm đáp án</Button> </Form.Item>
                            </>
                            )}
                        </Form.List>
                        </Card>
                    ))}
                    <Form.Item> <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm câu hỏi</Button> </Form.Item>
                    </>
                )}
                </Form.List>
                <Form.Item style={{marginTop: 24}}> <Button type="primary" htmlType="submit" block size="large">Lưu bài học</Button> </Form.Item>
            </Form>
        </Card>
      )}
    </div>
  );
};

export default MyLessonManager; 