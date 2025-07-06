import React, { useEffect, useState } from "react";
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
  Spin,
  Alert,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, updateCourse } from "../../../services/courseService";

const { TextArea } = Input;

const levels = [
  { label: "Cơ bản", value: "beginner" },
  { label: "Trung bình", value: "intermediate" },
  { label: "Nâng cao", value: "advanced" },
];

const languages = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "English", value: "en" },
];

const statuses = [
  { label: "Nháp", value: "draft" },
  { label: "Công khai", value: "published" },
];

const discountTypes = [
  { label: "Giảm theo số tiền (VNĐ)", value: "amount" },
  { label: "Giảm theo phần trăm (%)", value: "percentage" },
];

const EditCourse: React.FC = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<"amount" | "percentage">("amount");

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getCourseById(id);
        setCourse(data);
        
        // Set discount type based on existing data
        if (data.discount_percentage) {
          setDiscountType("percentage");
        } else if (data.discount_amount) {
          setDiscountType("amount");
        }
        
        // Format data for form
        const formData = {
          ...data,
          discount: data.discount_percentage || data.discount_amount || 0,
          requirements: data.requirements || [],
          sections: data.sections || [],
        };
        
        form.setFieldsValue(formData);
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải thông tin khóa học");
        message.error(err.message || "Lỗi khi tải thông tin khóa học");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [form, id]);

  const handleFinish = async (values: any) => {
    setSaving(true);
    
    try {
      // Format data for API
      const courseData = {
        ...values,
        discount_amount: discountType === "amount" ? values.discount : 0,
        discount_percentage: discountType === "percentage" ? values.discount : 0,
      };
      
      // Remove the generic discount field
      delete courseData.discount;
      
      await updateCourse(id!, courseData);
      message.success("Cập nhật khóa học thành công!");
      navigate("/instructor/courses");
    } catch (err: any) {
      message.error(err.message || "Lỗi khi cập nhật khóa học");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscountTypeChange = (value: "amount" | "percentage") => {
    setDiscountType(value);
    // Reset discount value when changing type
    form.setFieldsValue({ discount: 0 });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto mt-6">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card 
      title="Chỉnh sửa Khóa Học" 
      className="max-w-4xl mx-auto mt-6"
      extra={
        <Button 
          type="primary" 
          icon={<SaveOutlined />}
          loading={saving}
          onClick={() => form.submit()}
        >
          Lưu thay đổi
        </Button>
      }
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleFinish}
        disabled={saving}
      >
        <Form.Item
          label="Tiêu đề khóa học"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input placeholder="Nhập tiêu đề khóa học" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Mô tả chi tiết về khóa học"
          />
        </Form.Item>

        <Form.Item
          label="Danh mục"
          name="category_id"
          rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
        >
          <Select placeholder="Chọn danh mục">
            <Select.Option value={1}>Frontend</Select.Option>
            <Select.Option value={2}>Backend</Select.Option>
            <Select.Option value={3}>UI/UX</Select.Option>
            <Select.Option value={4}>Mobile</Select.Option>
            <Select.Option value={5}>DevOps</Select.Option>
            <Select.Option value={6}>Database</Select.Option>
            <Select.Option value={7}>AI/ML</Select.Option>
            <Select.Option value={8}>Other</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Ảnh đại diện" name="thumbnail">
          <Upload
            listType="picture"
            maxCount={1}
            beforeUpload={() => false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Trình độ"
          name="level"
          rules={[{ required: true, message: "Chọn trình độ!" }]}
        >
          <Select placeholder="Chọn trình độ">
            {levels.map(level => (
              <Select.Option key={level.value} value={level.value}>
                {level.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Ngôn ngữ"
          name="language"
          rules={[{ required: true, message: "Chọn ngôn ngữ!" }]}
        >
          <Select placeholder="Chọn ngôn ngữ">
            {languages.map(lang => (
              <Select.Option key={lang.value} value={lang.value}>
                {lang.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Giá gốc (VNĐ)"
          name="price"
          rules={[{ required: true, message: "Nhập giá!" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            placeholder="Nhập giá khóa học"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item label="Loại giảm giá">
          <Select
            value={discountType}
            onChange={handleDiscountTypeChange}
            placeholder="Chọn loại giảm giá"
          >
            {discountTypes.map(type => (
              <Select.Option key={type.value} value={type.value}>
                {type.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item 
          label={discountType === "amount" ? "Giảm giá (VNĐ)" : "Giảm giá (%)"}
          name="discount"
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            max={discountType === "percentage" ? 100 : undefined}
            placeholder={discountType === "amount" ? "Nhập số tiền giảm" : "Nhập phần trăm giảm"}
            formatter={(value) => 
              discountType === "amount" 
                ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : `${value}%`
            }
            parser={(value) => value!.replace(/[^\d]/g, '')}
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Chọn trạng thái!" }]}
        >
          <Select placeholder="Chọn trạng thái">
            {statuses.map(status => (
              <Select.Option key={status.value} value={status.value}>
                {status.label}
              </Select.Option>
            ))}
          </Select>
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
                    <Input 
                      placeholder="VD: Có kiến thức cơ bản về JavaScript" 
                      style={{ width: 400 }}
                    />
                  </Form.Item>
                  <MinusCircleOutlined 
                    onClick={() => remove(name)} 
                    style={{ color: '#ff4d4f' }}
                  />
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
                    <Button 
                      danger 
                      type="link" 
                      onClick={() => removeSection(name)}
                      disabled={saving}
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
                                disabled={saving}
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
                              rules={[{ required: true, message: "Chọn trạng thái!" }]}
                            >
                              <Select
                                placeholder="Chọn trạng thái xem trước"
                                options={[
                                  { label: "Có", value: true },
                                  { label: "Không", value: false },
                                ]}
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
                            disabled={saving}
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
                  disabled={saving}
                >
                  Thêm chương
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saving}
              icon={<SaveOutlined />}
            >
              Cập nhật khóa học
            </Button>
            <Button onClick={() => navigate("/instructor/courses")}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditCourse;
