import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Upload,
  message,
  Card,
  Space,
  Divider,
} from "antd";
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const levels = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const languages = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "English", value: "en" },
];

const statuses = [
  { label: "Nháp", value: "draft" },
  { label: "Công khai", value: "published" },
];

// Tạm thời mock danh mục
const categories = [
  { label: "Frontend", value: 1 },
  { label: "Backend", value: 2 },
  { label: "UI/UX", value: 3 },
];

const CreateCourse: React.FC = () => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    console.log("Dữ liệu gửi đi:", values);
    message.success("Tạo khóa học thành công!");
    form.resetFields();
  };

  return (
    <Card title="Tạo Khóa Học Mới" className="max-w-4xl mx-auto mt-6">
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Tiêu đề khóa học"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input placeholder="VD: Lập trình React từ A-Z" />
        </Form.Item>

        <Form.Item
          label="Slug (URL)"
          name="slug"
          rules={[{ required: true, message: "Vui lòng nhập slug!" }]}
        >
          <Input placeholder="VD: react-tu-a-den-z" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Danh mục"
          name="category_id"
          rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
        >
          <Select options={categories} placeholder="Chọn danh mục" />
        </Form.Item>

        <Form.Item label="Ảnh đại diện" name="thumbnail">
          <Upload
            listType="picture"
            maxCount={1}
            beforeUpload={() => false} // Ngăn upload tự động
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Trình độ"
          name="level"
          rules={[{ required: true, message: "Chọn trình độ!" }]}
        >
          <Select options={levels} />
        </Form.Item>

        <Form.Item
          label="Ngôn ngữ"
          name="language"
          rules={[{ required: true, message: "Chọn ngôn ngữ!" }]}
        >
          <Select options={languages} />
        </Form.Item>

        <Form.Item
          label="Giá gốc (VNĐ)"
          name="price"
          rules={[{ required: true, message: "Nhập giá!" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            placeholder="VD: 990000"
            formatter={(value) => `${value}đ`}
          />
        </Form.Item>

        <Form.Item label="Giảm giá (VNĐ)" name="discount">
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            placeholder="VD: 490000"
            formatter={(value) => `${value}đ`}
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Chọn trạng thái!" }]}
        >
          <Select options={statuses} />
        </Form.Item>

        <Divider orientation="left">Yêu cầu trước khóa học</Divider>
        <Form.List name="requirements">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <Space key={key} align="baseline" className="mb-2">
                  <Form.Item
                    name={name}
                    rules={[{ required: true, message: "Nhập nội dung yêu cầu" }]}
                  >
                    <Input placeholder="VD: Có kiến thức cơ bản về JavaScript" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  block
                >
                  Thêm yêu cầu
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Divider orientation="left">Chương trình học</Divider>
        <Form.List name="sections">
          {(sectionFields, { add: addSection, remove: removeSection }) => (
            <>
              {sectionFields.map(({ key, name }) => (
                <Card
                  key={key}
                  title={`Chương ${key + 1}`}
                  className="mb-4"
                  extra={
                    <Button danger type="link" onClick={() => removeSection(name)}>
                      Xóa chương
                    </Button>
                  }
                >
                  <Form.Item
                    name={[name, "title"]}
                    label="Tiêu đề chương"
                    rules={[{ required: true, message: "Nhập tiêu đề chương!" }]}
                  >
                    <Input placeholder="VD: Giới thiệu React" />
                  </Form.Item>

                  <Form.List name={[name, "lessons"]}>
                    {(lessonFields, { add: addLesson, remove: removeLesson }) => (
                      <>
                        {lessonFields.map(({ key: lessonKey, name: lessonName }) => (
                          <Card
                            key={lessonKey}
                            size="small"
                            className="mb-2"
                            title={`Bài ${lessonKey + 1}`}
                            extra={
                              <Button
                                danger
                                size="small"
                                onClick={() => removeLesson(lessonName)}
                              >
                                Xóa bài
                              </Button>
                            }
                          >
                            <Form.Item
                              name={[lessonName, "title"]}
                              label="Tiêu đề bài"
                              rules={[{ required: true, message: "Nhập tiêu đề bài!" }]}
                            >
                              <Input placeholder="VD: JSX là gì?" />
                            </Form.Item>

                            <Form.Item
                              name={[lessonName, "is_preview"]}
                              label="Xem trước?"
                              valuePropName="checked"
                            >
                              <Select
                                options={[
                                  { label: "Có", value: true },
                                  { label: "Không", value: false },
                                ]}
                                placeholder="Chọn"
                              />
                            </Form.Item>
                          </Card>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => addLesson()}
                            block
                          >
                            Thêm bài học
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Card>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => addSection()}
                  block
                >
                  Thêm chương
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Tạo khóa học
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateCourse;
