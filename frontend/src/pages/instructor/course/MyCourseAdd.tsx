import React, { useState, useEffect } from "react";
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
import { courseService } from '../../../services/apiService';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../../services/categoryService';
import type { Category } from '../../../interfaces/Category.interface';

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

const MyCourseAdd: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getAllCategories();
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    };
    fetchCategories();
  }, []);

  const handleFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('slug', values.slug);
      formData.append('description', values.description);
      formData.append('category', values.category);
      formData.append('level', values.level);
      formData.append('language', values.language);
      formData.append('price', values.price);
      if (values.discount) formData.append('discount', values.discount);
      formData.append('status', values.status);
      // Thumbnail
      if (values.thumbnail && values.thumbnail.length > 0) {
        formData.append('avatar', values.thumbnail[0].originFileObj);
      }
      // Requirements (gửi mảng)
      if (Array.isArray(values.requirements)) {
        values.requirements.forEach((req: string) => {
          formData.append('requirements', req);
        });
      }
      // Sections/Chapters (gửi mảng object)
      if (Array.isArray(values.chapters)) {
        values.chapters.forEach((chapter: { title: string }) => {
          formData.append('sections', JSON.stringify({ title: chapter.title }));
        });
      }
      for (let pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]);
      }
      await courseService.createCourse(formData);
      message.success("Tạo khóa học thành công!");
      form.resetFields();
      setCurrentStep(0);
      setTimeout(() => navigate('/instructor/courses'), 1000);
    } catch (err: any) {
      message.error(err?.message || 'Tạo khóa học thất bại!');
    }
  };

  const steps = [
    { title: "Thông tin cơ bản" },
    { title: "Yêu cầu & Chương trình học" },
  ];

  const renderStepContent = () => (
    <>
      <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card>
              <Form.Item label="Tiêu đề khóa học" name="title" rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}> <Input placeholder="VD: Lập trình React từ A-Z" size="large" /> </Form.Item>
              <Form.Item label="Slug (URL)" name="slug" rules={[{ required: true, message: "Vui lòng nhập slug!" }]}> <Input placeholder="VD: react-tu-a-den-z" size="large" /> </Form.Item>
              <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: "Vui lòng nhập mô tả!" }, { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" }]}> <TextArea rows={4} /> </Form.Item>
              <Form.Item label="Danh mục" name="category" rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}> <Select options={categories.map(c => ({ label: c.name, value: c._id }))} placeholder="Chọn danh mục" size="large" /> </Form.Item>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card>
              <Form.Item label="Ảnh đại diện" name="thumbnail" valuePropName="fileList" getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}>
                <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                  </div>
                </Upload>
              </Form.Item>
              <Form.Item label="Trình độ" name="level" rules={[{ required: true, message: "Chọn trình độ!" }]}> <Select options={levels} size="large" /> </Form.Item>
              <Form.Item label="Ngôn ngữ" name="language" rules={[{ required: true, message: "Chọn ngôn ngữ!" }]}> <Select options={languages} size="large" /> </Form.Item>
              <Form.Item label="Giá gốc (VNĐ)" name="price" rules={[{ required: true, message: "Nhập giá!" }]}> <InputNumber style={{ width: "100%" }} min={0} size="large" placeholder="VD: 990000" formatter={(value) => `${value}đ`} /> </Form.Item>
              <Form.Item label="Giảm giá (%)" name="discount" rules={[{ type: 'number', min: 0, max: 100, message: 'Nhập phần trăm từ 0-100' }]}> <InputNumber style={{ width: "100%" }} min={0} max={100} size="large" placeholder="VD: 30" addonAfter="%" /> </Form.Item>
              <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: "Chọn trạng thái!" }]}> <Select options={statuses} size="large" /> </Form.Item>
            </Card>
          </Col>
        </Row>
      </div>
      <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
        <Card>
          <Divider orientation="left"> <Space><BookOutlined /> <span>Yêu cầu trước khóa học</span></Space> </Divider>
          <Form.List name="requirements">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item name={name} rules={[{ required: true, message: "Nhập nội dung yêu cầu" }]} style={{ flex: 1 }} noStyle>
                      <Input placeholder="VD: Có kiến thức cơ bản về JavaScript" size="large" />
                    </Form.Item>
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
                    <Form.Item name={[name, 'title']} rules={[{ required: true, message: "Nhập tiêu đề chương" }]} style={{ flex: 1 }} noStyle>
                      <Input placeholder={`Chương ${key + 1}: Nhập tiêu đề chương`} />
                    </Form.Item>
                    <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item> <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm chương</Button> </Form.Item>
              </>
            )}
          </Form.List>
        </Card>
      </div>
    </>
  );

  return (
    <div style={{ padding: 24 }}>
      <Form form={form} layout="vertical" onFinish={handleFinish} onFinishFailed={(errorInfo) => { console.log('Failed:', errorInfo); message.error('Vui lòng điền đầy đủ và hợp lệ tất cả các trường!'); }}>
        <Divider orientation="left">Thông tin cơ bản</Divider>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card>
              <Form.Item label="Tiêu đề khóa học" name="title" rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}> <Input placeholder="VD: Lập trình React từ A-Z" size="large" /> </Form.Item>
              <Form.Item label="Slug (URL)" name="slug" rules={[{ required: true, message: "Vui lòng nhập slug!" }]}> <Input placeholder="VD: react-tu-a-den-z" size="large" /> </Form.Item>
              <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: "Vui lòng nhập mô tả!" }, { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" }]}> <TextArea rows={4} /> </Form.Item>
              <Form.Item label="Danh mục" name="category" rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}> <Select options={categories.map(c => ({ label: c.name, value: c._id }))} placeholder="Chọn danh mục" size="large" /> </Form.Item>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card>
              <Form.Item label="Ảnh đại diện" name="thumbnail" valuePropName="fileList" getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}>
                <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                  </div>
                </Upload>
              </Form.Item>
              <Form.Item label="Trình độ" name="level" rules={[{ required: true, message: "Chọn trình độ!" }]}> <Select options={levels} size="large" /> </Form.Item>
              <Form.Item label="Ngôn ngữ" name="language" rules={[{ required: true, message: "Chọn ngôn ngữ!" }]}> <Select options={languages} size="large" /> </Form.Item>
              <Form.Item label="Giá gốc (VNĐ)" name="price" rules={[{ required: true, message: "Nhập giá!" }]}> <InputNumber style={{ width: "100%" }} min={0} size="large" placeholder="VD: 990000" formatter={(value) => `${value}đ`} /> </Form.Item>
              <Form.Item label="Giảm giá (%)" name="discount" rules={[{ type: 'number', min: 0, max: 100, message: 'Nhập phần trăm từ 0-100' }]}> <InputNumber style={{ width: "100%" }} min={0} max={100} size="large" placeholder="VD: 30" addonAfter="%" /> </Form.Item>
              <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: "Chọn trạng thái!" }]}> <Select options={statuses} size="large" /> </Form.Item>
            </Card>
          </Col>
        </Row>
        <Divider orientation="left">Yêu cầu & Chương trình học</Divider>
        <Card>
          <Divider orientation="left"> <Space><BookOutlined /> <span>Yêu cầu trước khóa học</span></Space> </Divider>
          <Form.List name="requirements">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item name={name} rules={[{ required: true, message: "Nhập nội dung yêu cầu" }]} style={{ flex: 1 }} noStyle>
                      <Input placeholder="VD: Có kiến thức cơ bản về JavaScript" size="large" />
                    </Form.Item>
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
                    <Form.Item name={[name, 'title']} rules={[{ required: true, message: "Nhập tiêu đề chương" }]} style={{ flex: 1 }} noStyle>
                      <Input placeholder={`Chương ${key + 1}: Nhập tiêu đề chương`} />
                    </Form.Item>
                    <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item> <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm chương</Button> </Form.Item>
              </>
            )}
          </Form.List>
        </Card>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" htmlType="submit">Hoàn tất</Button>
        </div>
      </Form>
    </div>
  );
};

export default MyCourseAdd; 