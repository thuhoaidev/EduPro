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
  Steps,
  Row,
  Col,
} from "antd";
import { UploadOutlined, PlusOutlined, MinusCircleOutlined, BookOutlined } from "@ant-design/icons";

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
  const [currentStep, setCurrentStep] = useState(0);

  const handleFinish = (values: any) => {
    console.log("Dữ liệu gửi đi:", values);
    message.success("Tạo khóa học thành công!");
    form.resetFields();
  };

  const steps = [
    { title: "Thông tin cơ bản", description: "Thông tin chung về khóa học" },
    { title: "Nội dung khóa học", description: "Chương trình và bài học" },
    { title: "Xem trước & Hoàn tất", description: "Kiểm tra và xuất bản" },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card className="shadow-sm">
                <Form.Item
                  label="Tiêu đề khóa học"
                  name="title"
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                >
                  <Input placeholder="VD: Lập trình React từ A-Z" size="large" />
                </Form.Item>

                <Form.Item
                  label="Slug (URL)"
                  name="slug"
                  rules={[{ required: true, message: "Vui lòng nhập slug!" }]}
                >
                  <Input placeholder="VD: react-tu-a-den-z" size="large" />
                </Form.Item>

                <Form.Item
                  label="Mô tả"
                  name="description"
                  rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
                >
                  <Input.TextArea rows={4} className="text-base" />
                </Form.Item>

                <Form.Item
                  label="Danh mục"
                  name="category_id"
                  rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
                >
                  <Select options={categories} placeholder="Chọn danh mục" size="large" />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card className="shadow-sm">
                <Form.Item label="Ảnh đại diện" name="thumbnail">
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                    className="w-full"
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                    </div>
                  </Upload>
                </Form.Item>

                <Form.Item
                  label="Trình độ"
                  name="level"
                  rules={[{ required: true, message: "Chọn trình độ!" }]}
                >
                  <Select options={levels} size="large" />
                </Form.Item>

                <Form.Item
                  label="Ngôn ngữ"
                  name="language"
                  rules={[{ required: true, message: "Chọn ngôn ngữ!" }]}
                >
                  <Select options={languages} size="large" />
                </Form.Item>

                <Form.Item
                  label="Giá gốc (VNĐ)"
                  name="price"
                  rules={[{ required: true, message: "Nhập giá!" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    size="large"
                    placeholder="VD: 990000"
                    formatter={(value) => `${value}đ`}
                  />
                </Form.Item>

                <Form.Item label="Giảm giá (VNĐ)" name="discount">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    size="large"
                    placeholder="VD: 490000"
                    formatter={(value) => `${value}đ`}
                  />
                </Form.Item>

                <Form.Item
                  label="Trạng thái"
                  name="status"
                  rules={[{ required: true, message: "Chọn trạng thái!" }]}
                >
                  <Select options={statuses} size="large" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        );
      case 1:
        return (
          <Card className="shadow-sm">
            <Divider orientation="left">
              <Space>
                <BookOutlined />
                <span>Yêu cầu trước khóa học</span>
              </Space>
            </Divider>
            <Form.List name="requirements">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Space key={key} align="baseline" className="mb-4 w-full">
                      <Form.Item
                        name={name}
                        rules={[{ required: true, message: "Nhập nội dung yêu cầu" }]}
                        className="flex-1"
                      >
                        <Input 
                          placeholder="VD: Có kiến thức cơ bản về JavaScript" 
                          size="large"
                        />
                      </Form.Item>
                      <Button 
                        type="text" 
                        danger 
                        icon={<MinusCircleOutlined />} 
                        onClick={() => remove(name)}
                        className="text-lg"
                      />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      block
                      size="large"
                    >
                      Thêm yêu cầu
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Divider orientation="left">
              <Space>
                <BookOutlined />
                <span>Chương trình học</span>
              </Space>
            </Divider>
            <Form.List name="sections">
              {(sectionFields, { add: addSection, remove: removeSection }) => (
                <>
                  {sectionFields.map(({ key, name }) => (
                    <Card
                      key={key}
                      title={`Chương ${key + 1}`}
                      className="mb-4 shadow-sm"
                      extra={
                        <Button 
                          danger 
                          type="link" 
                          onClick={() => removeSection(name)}
                          icon={<MinusCircleOutlined />}
                        >
                          Xóa chương
                        </Button>
                      }
                    >
                      <Form.Item
                        name={[name, "title"]}
                        label="Tiêu đề chương"
                        rules={[{ required: true, message: "Nhập tiêu đề chương!" }]}
                      >
                        <Input placeholder="VD: Giới thiệu React" size="large" />
                      </Form.Item>

                      <Form.List name={[name, "lessons"]}>
                        {(lessonFields, { add: addLesson, remove: removeLesson }) => (
                          <>
                            {lessonFields.map(({ key: lessonKey, name: lessonName }) => (
                              <Card
                                key={lessonKey}
                                size="small"
                                className="mb-2 shadow-sm"
                                title={`Bài ${lessonKey + 1}`}
                                extra={
                                  <Button
                                    danger
                                    type="link"
                                    onClick={() => removeLesson(lessonName)}
                                    icon={<MinusCircleOutlined />}
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
                                  <Input placeholder="VD: JSX là gì?" size="large" />
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
                                    size="large"
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
                                size="large"
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
                      size="large"
                    >
                      Thêm chương
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>
        );
      case 2:
        return (
          <Card className="shadow-sm">
            <div className="text-center py-8">
              <BookOutlined className="text-6xl text-blue-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">Kiểm tra thông tin khóa học</h3>
              <p className="text-gray-500 mb-6">
                Vui lòng kiểm tra lại toàn bộ thông tin trước khi xuất bản khóa học
              </p>
              <Space size="large">
                <Button size="large" onClick={() => setCurrentStep(1)}>
                  Quay lại
                </Button>
                <Button type="primary" size="large" onClick={() => form.submit()}>
                  Xuất bản khóa học
                </Button>
              </Space>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tạo Khóa Học Mới</h2>
        <p className="text-gray-500 mt-1">Thiết lập thông tin và nội dung cho khóa học của bạn</p>
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Card className="shadow-sm mb-6">
          <Steps
            current={currentStep}
            items={steps}
            onChange={setCurrentStep}
            className="mb-8"
          />
        </Card>

        {renderStepContent()}

        {currentStep < 2 && (
          <div className="mt-6 text-right">
            <Space>
              {currentStep > 0 && (
                <Button size="large" onClick={() => setCurrentStep(currentStep - 1)}>
                  Quay lại
                </Button>
              )}
              <Button 
                type="primary" 
                size="large" 
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                {currentStep === 1 ? "Tiếp tục" : "Tiếp theo"}
              </Button>
            </Space>
          </div>
        )}
      </Form>

      {/* Custom styles */}
      <style>
        {`
          .ant-upload-list-picture-card .ant-upload-list-item {
            padding: 8px;
            border: 1px solid #d9d9d9;
            border-radius: 8px;
          }
          .ant-upload.ant-upload-select-picture-card {
            width: 100%;
            height: 200px;
            margin: 0;
          }
          .ant-upload.ant-upload-select-picture-card > .ant-upload {
            padding: 32px 8px;
          }
          .ant-card-head {
            border-bottom: 1px solid #f0f0f0;
          }
          .ant-divider-inner-text {
            font-weight: 500;
          }
        `}
      </style>
    </div>
  );
};

export default CreateCourse;
