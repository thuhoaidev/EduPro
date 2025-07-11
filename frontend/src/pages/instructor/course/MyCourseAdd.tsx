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
  Row,
  Col,
  Space,
  message,
} from "antd";
import { PlusOutlined, MinusCircleOutlined, BookOutlined } from "@ant-design/icons";
import { courseService } from '../../../services/apiService';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../../services/categoryService';
import type { Category } from '../../../interfaces/Category.interface';

const { TextArea } = Input;

const levels = [
  { label: "Người mới bắt đầu", value: "beginner" },
  { label: "Trung cấp", value: "intermediate" },
  { label: "Nâng cao", value: "advanced" },
];

const languages = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "Tiếng Anh", value: "en" },
];



interface CourseFormData {
  title: string;
  description: string;
  category: string;
  level: string;
  language: string;
  price: number;
  discountType?: 'amount' | 'percentage';
  discountAmount?: number;
  discountPercentage?: number;
  requirements: string[];
  sections: Array<{
    title: string;
  }>;
  thumbnail?: Array<{
    originFileObj: File;
    uid: string;
    name: string;
    status: string;
    url?: string;
  }>;
}

const MyCourseAdd: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [coursePrice, setCoursePrice] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
        message.error('Không thể tải danh mục khóa học');
      }
    };
    fetchCategories();
  }, []);

  const handleFinish = async (values: CourseFormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Thông tin cơ bản
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('category', values.category);
      formData.append('level', values.level);
      formData.append('language', values.language);
      formData.append('price', values.price.toString());

      
      // Giảm giá (nếu có)
      if (values.discountType === 'amount' && values.discountAmount && values.discountAmount > 0) {
        formData.append('discount', values.discountAmount.toString());
      } else if (values.discountType === 'percentage' && values.discountPercentage && values.discountPercentage > 0) {
        formData.append('discount', values.discountPercentage.toString());
      }
      
      // Thumbnail (ảnh đại diện)
      if (values.thumbnail && values.thumbnail.length > 0) {
        formData.append('avatar', values.thumbnail[0].originFileObj);
      }
      
      // Requirements (yêu cầu trước khóa học)
      if (Array.isArray(values.requirements)) {
        values.requirements.forEach((req: string) => {
          if (req.trim()) {
            formData.append('requirements', req.trim());
          }
        });
      }
      
      // Sections (chương học)
      if (Array.isArray(values.sections)) {
        values.sections.forEach((section: { title: string }) => {
          if (section.title.trim()) {
            formData.append('sections', JSON.stringify({ title: section.title.trim() }));
          }
        });
      }
      
      // Debug: Log form data
      console.log('Form Data being sent:');
      for (const pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      await courseService.createCourse(formData);
      message.success("Tạo khóa học thành công! Đang chuyển hướng...");
      form.resetFields();
      setTimeout(() => navigate('/instructor/courses'), 1000);
    } catch (error: unknown) {
      console.error('Lỗi khi tạo khóa học:', error);
      let errorMessage = 'Có lỗi xảy ra khi tạo khóa học!';
      if (typeof error === 'object' && error) {
        // Nếu là lỗi từ axios hoặc fetch
        const errMsg = 'message' in error && typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : '';
        let errData = '';
        if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
          errData = (error.response as { data?: unknown }).data as string;
        } else if ('errors' in error && typeof error.errors === 'string') {
          errData = error.errors;
        }
        if (
          (errMsg && errMsg.includes('duplicate key') && errMsg.includes('slug')) ||
          (typeof errData === 'string' && errData.includes('duplicate key') && errData.includes('slug'))
        ) {
          errorMessage = 'Tiêu đề khóa học đã tồn tại, vui lòng chọn tiêu đề khác!';
        } else if (typeof errData === 'string' && errData) {
          errorMessage = errData;
        }
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleFinish} 
        onFinishFailed={(errorInfo) => { 
          console.log('Failed:', errorInfo); 
          message.error('Vui lòng kiểm tra và điền đầy đủ tất cả các trường bắt buộc!'); 
        }}
        initialValues={{
          language: 'vi',
          discountType: 'amount',
          discountAmount: 0,
          discountPercentage: 0,
          requirements: [''],
          sections: [{ title: '' }],
        }}
      >
        <Divider orientation="left">Thông tin cơ bản khóa học</Divider>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card>
              <Form.Item 
                label="Tiêu đề khóa học" 
                name="title" 
                rules={[
                  { required: true, message: "Vui lòng nhập tiêu đề khóa học!" },
                  { min: 3, message: "Tiêu đề phải có ít nhất 3 ký tự!" },
                  { max: 200, message: "Tiêu đề không được vượt quá 200 ký tự!" }
                ]}
              > 
                <Input placeholder="Ví dụ: Lập trình React từ A-Z" size="large" /> 
              </Form.Item>
              
              <Form.Item 
                label="Mô tả khóa học" 
                name="description" 
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả khóa học!" }, 
                  { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" }
                ]}
              > 
                <TextArea rows={4} placeholder="Mô tả chi tiết về khóa học, nội dung sẽ học, lợi ích..." /> 
              </Form.Item>
              
              <Form.Item 
                label="Danh mục khóa học" 
                name="category" 
                rules={[{ required: true, message: "Vui lòng chọn danh mục khóa học!" }]}
              > 
                <Select 
                  options={categories.map(c => ({ label: c.name, value: c._id }))} 
                  placeholder="Chọn danh mục phù hợp" 
                  size="large" 
                /> 
              </Form.Item>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card>
              <Form.Item 
                label="Ảnh đại diện khóa học" 
                name="thumbnail" 
                valuePropName="fileList" 
                getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
                rules={[{ required: true, message: "Vui lòng tải ảnh đại diện khóa học!" }]}
              >
                <Upload 
                  listType="picture-card" 
                  maxCount={1} 
                  beforeUpload={() => false}
                  accept="image/*"
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                  </div>
                </Upload>
              </Form.Item>
              
              <Form.Item 
                label="Trình độ phù hợp" 
                name="level" 
                rules={[{ required: true, message: "Vui lòng chọn trình độ phù hợp!" }]}
              > 
                <Select 
                  options={levels} 
                  placeholder="Chọn trình độ phù hợp"
                  size="large" 
                /> 
              </Form.Item>
              
              <Form.Item 
                label="Ngôn ngữ giảng dạy" 
                name="language" 
                rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ giảng dạy!" }]}
              > 
                <Select 
                  options={languages} 
                  placeholder="Chọn ngôn ngữ giảng dạy"
                  size="large" 
                /> 
              </Form.Item>
              
              <Form.Item 
                label="Giá khóa học (VNĐ)" 
                name="price" 
                rules={[
                  { required: true, message: "Vui lòng nhập giá khóa học!" },
                  { type: 'number', min: 0, message: 'Giá khóa học không được âm!' }
                ]}
              > 
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  size="large"
                  placeholder="Ví dụ: 990000"
                  formatter={(value: string | number | undefined) =>
                    typeof value === "number"
                      ? value.toLocaleString("vi-VN") + "đ"
                      : value
                      ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ"
                      : ""
                  }
                  parser={(value: string | undefined) =>
                    value ? value.replace(/đ|,|\s/g, "") : ""
                  }
                  onChange={(value) => setCoursePrice(Number(value) || 0)}
                /> 
              </Form.Item>
              
              <Form.Item 
                label="Loại giảm giá" 
                name="discountType" 
                rules={[{ required: true, message: "Vui lòng chọn loại giảm giá!" }]}
              > 
                <Select 
                  options={[
                    { label: "Giảm theo số tiền", value: "amount" },
                    { label: "Giảm theo phần trăm", value: "percentage" }
                  ]} 
                  placeholder="Chọn loại giảm giá"
                  size="large" 
                /> 
              </Form.Item>
              
              <Form.Item 
                noStyle 
                shouldUpdate={(prevValues, currentValues) => prevValues.discountType !== currentValues.discountType}
              >
                {({ getFieldValue }) => {
                  const discountType = getFieldValue('discountType');
                  
                  if (discountType === 'amount') {
                    return (
                      <Form.Item 
                        label="Số tiền giảm (VNĐ)" 
                        name="discountAmount" 
                        rules={[
                          { type: 'number', min: 0, message: 'Số tiền giảm không được âm' },
                          { 
                            validator: (_, value) => {
                              if (value && value >= coursePrice) {
                                return Promise.reject(new Error('Số tiền giảm không được lớn hơn hoặc bằng giá khóa học'));
                              }
                              return Promise.resolve();
                            }
                          }
                        ]}
                      > 
                        <InputNumber 
                          style={{ width: "100%" }} 
                          min={0} 
                          max={coursePrice - 1} 
                          size="large" 
                          placeholder="Ví dụ: 100000" 
                          formatter={(value: string | number | undefined) =>
                            typeof value === "number"
                              ? value.toLocaleString("vi-VN") + "đ"
                              : value
                              ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ"
                              : ""
                          }
                          parser={(value: string | undefined) =>
                            value ? value.replace(/đ|,|\s/g, "") : ""
                          }
                        /> 
                      </Form.Item>
                    );
                  }
                  
                  if (discountType === 'percentage') {
                    return (
                      <Form.Item 
                        label="Phần trăm giảm (%)" 
                        name="discountPercentage" 
                        rules={[
                          { type: 'number', min: 0, max: 99, message: 'Phần trăm giảm phải từ 0-99%' }
                        ]}
                      > 
                        <InputNumber 
                          style={{ width: "100%" }} 
                          min={0} 
                          max={99} 
                          size="large" 
                          placeholder="Ví dụ: 30" 
                          addonAfter="%" 
                        /> 
                      </Form.Item>
                    );
                  }
                  
                  return null;
                }}
              </Form.Item>
              

            </Card>
          </Col>
        </Row>
        
        <Divider orientation="left">Yêu cầu & Chương trình học</Divider>
        <Card>
          <Divider orientation="left"> 
            <Space><BookOutlined /> <span>Yêu cầu kiến thức trước khi học</span></Space> 
          </Divider>
          <Form.List name="requirements">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item 
                      name={name} 
                      rules={[
                        { required: true, message: "Vui lòng nhập nội dung yêu cầu" },
                        { min: 3, message: "Yêu cầu phải có ít nhất 3 ký tự" }
                      ]} 
                      style={{ flex: 1 }} 
                      noStyle
                    >
                      <Input 
                        placeholder="Ví dụ: Có kiến thức cơ bản về JavaScript" 
                        size="large" 
                      />
                    </Form.Item>
                    <Button 
                      type="text" 
                      danger 
                      icon={<MinusCircleOutlined />} 
                      onClick={() => remove(name)} 
                    />
                  </Space>
                ))}
                <Form.Item> 
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Thêm yêu cầu
                  </Button> 
                </Form.Item>
              </>
            )}
          </Form.List>
          
          <Divider orientation="left"> 
            <Space><BookOutlined /> <span>Chương trình học</span></Space> 
          </Divider>
          <Form.List name="sections">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item 
                      name={[name, 'title']} 
                      rules={[
                        { required: true, message: "Vui lòng nhập tiêu đề chương" },
                        { min: 3, message: "Tiêu đề chương phải có ít nhất 3 ký tự" }
                      ]} 
                      style={{ flex: 1 }} 
                      noStyle
                    >
                      <Input 
                        placeholder={`Chương ${key + 1}: Ví dụ: Giới thiệu và cài đặt môi trường`} 
                        size="large" 
                      />
                    </Form.Item>
                    <Button 
                      type="text" 
                      danger 
                      icon={<MinusCircleOutlined />} 
                      onClick={() => remove(name)} 
                    />
                  </Space>
                ))}
                <Form.Item> 
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Thêm chương
                  </Button> 
                </Form.Item>
              </>
            )}
          </Form.List>
          
          <Divider orientation="left"> 
            <Space><BookOutlined /> <span>Thông tin bổ sung</span></Space> 
          </Divider>
          <div style={{ padding: '16px', backgroundColor: '#f6f8fa', borderRadius: '6px' }}>
            <p style={{ margin: 0, color: '#586069' }}>
              • Các chương sẽ được tạo cùng với khóa học. Bạn có thể thêm bài học cho từng chương sau.<br/>
              • Khóa học sẽ được tạo với trạng thái <strong>"Nháp"</strong> mặc định.<br/>
              • Bạn có thể "Xem trước" khóa học sau khi đã hoàn thiện nội dung khóa học.
            </p>
          </div>
        </Card>
        
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            size="large"
          >
            Tạo khóa học
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default MyCourseAdd; 