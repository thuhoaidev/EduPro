import React from "react";
import {
  Card,
  Button,
  Form,
  Input,
  Space,
  Divider,
  Checkbox,
  List,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const ManageLesson = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Saved lesson data:", values);
  };

  return (
    <Card title="Quản lý Bài học, Video và Câu hỏi">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Tiêu đề bài học */}
        <Form.Item
          label="Tiêu đề bài học"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề bài học" }]}
        >
          <Input placeholder="Nhập tiêu đề bài học" />
        </Form.Item>

        {/* Xem trước bài học */}
        <Form.Item name="is_preview" valuePropName="checked">
          <Checkbox>Xem trước (Preview)</Checkbox>
        </Form.Item>

        <Divider>Video</Divider>
        <Form.List name="videos">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <Space key={key} align="baseline" style={{ display: "flex", marginBottom: 8 }}>
                  <Form.Item
                    name={[name, "title"]}
                    rules={[{ required: true, message: "Nhập tiêu đề video" }]}
                  >
                    <Input placeholder="Tiêu đề video" />
                  </Form.Item>

                  <Form.Item
                    name={[name, "url"]}
                    rules={[{ required: true, message: "Nhập URL video" }]}
                  >
                    <Input placeholder="URL video" />
                  </Form.Item>

                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm video
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Divider>Câu hỏi trắc nghiệm</Divider>
        <Form.List name="quizzes">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <Card
                  key={key}
                  size="small"
                  title={`Câu hỏi ${key + 1}`}
                  extra={
                    <Button danger size="small" onClick={() => remove(name)}>
                      Xóa
                    </Button>
                  }
                  style={{ marginBottom: 16 }}
                >
                  <Form.Item
                    name={[name, "question"]}
                    rules={[{ required: true, message: "Nhập nội dung câu hỏi" }]}
                  >
                    <TextArea rows={2} placeholder="Nội dung câu hỏi" />
                  </Form.Item>

                  <Form.List name={[name, "options"]}>
                    {(optionFields, { add: addOption, remove: removeOption }) => (
                      <>
                        {optionFields.map(({ key: optionKey, name: optionName }) => (
                          <Space
                            key={optionKey}
                            align="baseline"
                            style={{ display: "flex", marginBottom: 8 }}
                          >
                            <Form.Item
                              name={[optionName, "content"]}
                              rules={[{ required: true, message: "Nhập nội dung đáp án" }]}
                            >
                              <Input placeholder="Nội dung đáp án" />
                            </Form.Item>

                            <Form.Item name={[optionName, "isCorrect"]} valuePropName="checked">
                              <Checkbox>Đáp án đúng</Checkbox>
                            </Form.Item>

                            <MinusCircleOutlined onClick={() => removeOption(optionName)} />
                          </Space>
                        ))}

                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => addOption()}
                            block
                            icon={<PlusOutlined />}
                          >
                            Thêm đáp án
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Card>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm câu hỏi
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Lưu bài học
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ManageLesson;
