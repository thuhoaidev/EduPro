import React, { useState, useEffect } from "react";
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
  Tag,
} from "antd";
import { PlusOutlined, MinusCircleOutlined, BookOutlined } from "@ant-design/icons";
import { courseService } from '../../../services/apiService';
import { getAllCategories } from '../../../services/categoryService';
import { useNavigate } from 'react-router-dom';

const levels = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const languages = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "English", value: "en" },
];

const CreateCourse: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [requirementsPreview, setRequirementsPreview] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy danh mục từ backend
    const fetchCategories = async () => {
      const res = await getAllCategories();
      if (res.success) {
        setCategories(res.data.map(cat => ({ label: cat.name, value: cat._id })));
      }
    };
    fetchCategories();
  }, []);

  // Hàm upload ảnh lên cloud (giả sử backend có endpoint /api/upload)
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    // Thay đổi endpoint này nếu backend của bạn khác
    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success && data.url) return data.url;
    throw new Error('Upload ảnh thất bại!');
  };

  const handleFinish = async (values: unknown) => {
    const v = values as Record<string, any>;
    console.log('Dữ liệu form FE gửi lên:', v);
    try {
      setLoading(true);
      // Validate requirements
      const reqs = Array.isArray(v.requirements) ? v.requirements.filter((r: string) => r && r.trim().length >= 3) : [];
      if (reqs.length === 0) {
        message.error('Phải có ít nhất 1 yêu cầu trước khóa học!');
        setLoading(false);
        return;
      }
      // Validate thumbnail
      let thumbnailUrl = '';
      if (v.thumbnail && v.thumbnail.fileList && v.thumbnail.fileList[0]) {
        const fileObj = v.thumbnail.fileList[0].originFileObj;
        if (fileObj) {
          thumbnailUrl = await uploadImage(fileObj);
        } else if (v.thumbnail.fileList[0].url) {
          thumbnailUrl = v.thumbnail.fileList[0].url;
        }
      } else {
        message.error('Vui lòng chọn ảnh đại diện cho khóa học!');
        setLoading(false);
        return;
      }
      // Chuẩn bị dữ liệu JSON đúng format backend
      const body = {
        title: v.title,
        slug: v.slug,
        description: v.description,
        level: v.level,
        language: v.language,
        price: v.price,
        discount: v.discount || 0,
        status: 'draft',
        category: v.category_id,
        requirements: reqs,
        thumbnail: thumbnailUrl
      };
      console.log('Dữ liệu gửi lên backend:', body);
      const response = await courseService.createCourse(body);
      console.log('Dữ liệu trả về từ backend:', response);
      message.success('Tạo khóa học thành công!');
      if (response && response.data && (response.data._id || response.data.id)) {
        navigate(`/instructor/courses/${response.data._id || response.data.id}`);
      } else {
        form.resetFields();
        setRequirementsPreview([]);
      }
    } catch (err: unknown) {
      message.error((err as Error)?.message || 'Tạo khóa học thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // Log lỗi validate rõ ràng
  const handleFinishFailed = (errorInfo: unknown) => {
    console.log('Lỗi validate:', errorInfo);
    // Log chi tiết các trường bị lỗi nếu có
    if (typeof errorInfo === 'object' && errorInfo && 'errorFields' in errorInfo) {
      const ef = (errorInfo as any).errorFields;
      if (Array.isArray(ef)) {
        ef.forEach((field: any) => {
          console.log(`Trường lỗi: ${field.name?.join('.')}, Thông báo: ${field.errors?.join(', ')}`);
        });
      }
    }
    message.error('Vui lòng nhập đầy đủ và đúng các trường bắt buộc!');
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
                  {fields.map(({ key, name }, idx) => (
                    <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item
                        name={name}
                        rules={[{ required: true, message: 'Nhập yêu cầu!' }, { min: 3, message: 'Tối thiểu 3 ký tự!' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          placeholder="VD: Biết HTML/CSS cơ bản"
                          onChange={() => {
                            setTimeout(() => {
                              const reqs = form.getFieldValue('requirements') || [];
                              setRequirementsPreview(reqs.filter((r: string) => r && r.length >= 3));
                            }, 0);
                          }}
                        />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => {
                        remove(name);
                        setTimeout(() => {
                          const reqs = form.getFieldValue('requirements') || [];
                          setRequirementsPreview(reqs.filter((r: string) => r && r.length >= 3));
                        }, 0);
                      }} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>Thêm yêu cầu</Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            {requirementsPreview.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {requirementsPreview.map((req) => (
                  <Tag color="blue" key={req} style={{ marginBottom: 4 }}>{req}</Tag>
                ))}
              </div>
            )}
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

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
      >
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
                loading={loading}
                htmlType="submit"
              >
                Tạo khóa học
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
