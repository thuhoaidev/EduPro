import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Upload,
  Card,
  Divider,
  Steps,
  Row,
  Col,
  Space,
  message,
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

const categories = [
  { label: "Frontend", value: 1 },
  { label: "Backend", value: 2 },
  { label: "UI/UX", value: 3 },
];

const MyCourseAdd: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  const handleFinish = (values: any) => {
    console.log("Course data:", values);
    message.success("Tạo khóa học thành công!");
    form.resetFields();
    setCurrentStep(0);
  };

  const steps = [
    { title: "Thông tin cơ bản" },
    { title: "Yêu cầu & Chương trình học" },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card>
                <Form.Item label="Tiêu đề khóa học" name="title" rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}> <Input placeholder="VD: Lập trình React từ A-Z" size="large" /> </Form.Item>
                <Form.Item label="Slug (URL)" name="slug" rules={[{ required: true, message: "Vui lòng nhập slug!" }]}> <Input placeholder="VD: react-tu-a-den-z" size="large" /> </Form.Item>
                <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}> <TextArea rows={4} /> </Form.Item>
                <Form.Item label="Danh mục" name="category_id" rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}> <Select options={categories} placeholder="Chọn danh mục" size="large" /> </Form.Item>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card>
                <Form.Item label="Ảnh đại diện" name="thumbnail"> <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}> <div> <PlusOutlined /> <div style={{ marginTop: 8 }}>Tải ảnh lên</div> </div> </Upload> </Form.Item>
                <Form.Item label="Trình độ" name="level" rules={[{ required: true, message: "Chọn trình độ!" }]}> <Select options={levels} size="large" /> </Form.Item>
                <Form.Item label="Ngôn ngữ" name="language" rules={[{ required: true, message: "Chọn ngôn ngữ!" }]}> <Select options={languages} size="large" /> </Form.Item>
                <Form.Item label="Giá gốc (VNĐ)" name="price" rules={[{ required: true, message: "Nhập giá!" }]}> <InputNumber style={{ width: "100%" }} min={0} size="large" placeholder="VD: 990000" formatter={(value) => `${value}đ`} /> </Form.Item>
                <Form.Item label="Giảm giá (VNĐ)" name="discount"> <InputNumber style={{ width: "100%" }} min={0} size="large" placeholder="VD: 490000" formatter={(value) => `${value}đ`} /> </Form.Item>
                <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: "Chọn trạng thái!" }]}> <Select options={statuses} size="large" /> </Form.Item>
              </Card>
            </Col>
          </Row>
        );
      case 1:
        return (
          <Card>
            <Divider orientation="left"> <Space><BookOutlined /> <span>Yêu cầu trước khóa học</span></Space> </Divider>
            <Form.List name="requirements">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item name={name} rules={[{ required: true, message: "Nhập nội dung yêu cầu" }]} style={{ flex: 1 }}> <Input placeholder="VD: Có kiến thức cơ bản về JavaScript" size="large" /> </Form.Item>
                      <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item> <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm yêu cầu</Button> </Form.Item>
                </>
              )}
            </Form.List>
            <Divider orientation="left"> <Space><BookOutlined /> <span>Chương trình học</span></Space> </Divider>
            <Form.List name="chapters">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item name={[name, 'title']} rules={[{ required: true, message: "Nhập tiêu đề chương" }]} style={{ flex: 1 }}>
                        <Input placeholder={`Chương ${key + 1}: Nhập tiêu đề chương`} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item> <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm chương</Button> </Form.Item>
                </>
              )}
            </Form.List>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        {steps.map((step) => (<Steps.Step key={step.title} title={step.title} />))}
      </Steps>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {renderStepContent()}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
          {currentStep > 0 && <Button onClick={() => setCurrentStep(currentStep - 1)}>Quay lại</Button>}
          {currentStep < steps.length - 1 ? (
            <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>Tiếp theo</Button>
          ) : (
            <Button type="primary" htmlType="submit">Hoàn tất</Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default MyCourseAdd; 