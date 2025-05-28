import { Form, Radio, Select, Button, Space, Input, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Option } = Select;

const CourseSettingsTab = () => {
  const [form] = Form.useForm();
  const [learningOutcomes, setLearningOutcomes] = useState(['']);

  const handleAddOutcome = () => {
    setLearningOutcomes([...learningOutcomes, '']);
  };

  const handleOutcomeChange = (index: any, value: any) => {
    const updated = [...learningOutcomes];
    updated[index] = value;
    setLearningOutcomes(updated);
  };

  return (
    <Form form={form} layout="vertical" className="p-6 bg-white rounded-xl shadow">
      {/* Loại khóa học */}
      <Form.Item label="Chọn loại khóa học" name="type" initialValue="free">
        <Radio.Group>
          <Radio value="free">Khóa học miễn phí</Radio>
          <Radio value="paid">Khóa học tính phí</Radio>
        </Radio.Group>
      </Form.Item>

      {/* Chứng chỉ */}
      <Form.Item label="Chứng chỉ" name="certificate" initialValue="no">
        <Radio.Group>
          <Radio value="yes">Khóa học này cung cấp chứng chỉ</Radio>
          <Radio value="no">Khóa học này không cung cấp chứng chỉ</Radio>
        </Radio.Group>
      </Form.Item>

      {/* Công khai */}
      <div className="p-4 rounded-xl bg-gray-100">
        <Form.Item label="Cài đặt công khai" name="visibility" initialValue="private">
          <Radio.Group>
            <Radio value="public">Công khai khóa học</Radio>
            <Radio value="private">Riêng tư khóa học</Radio>
          </Radio.Group>
        </Form.Item>
      </div>

      {/* Danh mục */}
      <Form.Item label="Chọn các danh mục" name="categories">
        <Select mode="multiple" placeholder="Chọn danh mục">
          <Option value="lap-trinh">Lập trình</Option>
          <Option value="thiet-ke">Thiết kế</Option>
          <Option value="marketing">Marketing</Option>
        </Select>
      </Form.Item>

      {/* Cấp độ */}
      <Form.Item label="Chọn cấp độ" name="level" initialValue="easy">
        <Select>
          <Option value="easy">Dễ</Option>
          <Option value="medium">Trung bình</Option>
          <Option value="hard">Khó</Option>
        </Select>
      </Form.Item>

      {/* Kết quả học tập */}
      <Form.Item label="Kết quả học tập">
        {learningOutcomes.map((outcome, index) => (
          <Input.TextArea
            key={index}
            value={outcome}
            placeholder={`Kết quả ${index + 1}`}
            onChange={(e) => handleOutcomeChange(index, e.target.value)}
            className="mb-3"
            autoSize
          />
        ))}

        <Button
          type="dashed"
          onClick={handleAddOutcome}
          icon={<PlusOutlined />}
          block
        >
          Thêm kết quả học tập
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CourseSettingsTab;
