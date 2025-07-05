import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Select, Card } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

interface QuizQuestionFormProps {
  name: number;
  onRemove: () => void;
}

const QuizQuestionForm: React.FC<QuizQuestionFormProps> = ({ name, onRemove }) => {
  const [options, setOptions] = useState<string[]>([]);
  const [form] = Form.useForm();

  // Lấy form instance từ context
  const parentForm = Form.useFormInstance();

  // Theo dõi thay đổi của options
  useEffect(() => {
    const currentOptions = parentForm.getFieldValue(['quiz', 'questions', name, 'options']) || [];
    setOptions(currentOptions);
  }, [parentForm, name]);

  // Cập nhật options khi có thay đổi
  const updateOptions = () => {
    const currentOptions = parentForm.getFieldValue(['quiz', 'questions', name, 'options']) || [];
    setOptions(currentOptions);
  };

  return (
    <Card 
      size="small" 
      title={`Câu hỏi ${name + 1}`} 
      extra={<Button danger size="small" onClick={onRemove}>Xóa</Button>} 
      style={{ marginBottom: 16, background: '#fafafa' }}
    >
      <Form.Item 
        name={[name, "question"]} 
        rules={[{ required: true, message: "Vui lòng nhập nội dung câu hỏi!" }]}
      > 
        <Input.TextArea rows={2} placeholder="Nội dung câu hỏi" /> 
      </Form.Item>
      
      <Form.List name={[name, "options"]}>
        {(optionFields, { add: addOption, remove: removeOption }) => (
          <>
            {optionFields.map(({ key: optionKey, name: optionName }) => (
              <Space key={optionKey} align="baseline" style={{ display: "flex", marginBottom: 8 }}>
                <Form.Item 
                  name={optionName} 
                  rules={[{ required: true, message: "Vui lòng nhập nội dung đáp án!" }]} 
                  style={{flex: 1}}
                > 
                  <Input 
                    placeholder={`Đáp án ${String.fromCharCode(65 + optionKey)}`}
                    onChange={() => {
                      setTimeout(updateOptions, 100);
                    }}
                  /> 
                </Form.Item>
                <Button 
                  type="text" 
                  danger 
                  icon={<MinusCircleOutlined />} 
                  onClick={() => {
                    removeOption(optionName);
                    setTimeout(updateOptions, 100);
                  }} 
                  disabled={optionFields.length <= 2}
                />
              </Space>
            ))}
            <Form.Item> 
              <Button 
                type="dashed" 
                onClick={() => {
                  addOption();
                  setTimeout(updateOptions, 100);
                }} 
                block 
                icon={<PlusOutlined />}
                disabled={optionFields.length >= 4}
              >
                Thêm đáp án (Tối đa 4 đáp án)
              </Button> 
            </Form.Item>
          </>
        )}
      </Form.List>
      
      <Form.Item 
        label="Đáp án đúng" 
        name={[name, "correctIndex"]} 
        rules={[{ required: true, message: "Vui lòng chọn đáp án đúng!" }]}
      > 
        <Select 
          placeholder="Chọn đáp án đúng"
          disabled={options.length < 2}
        >
          {options.map((option: string, index: number) => (
            <Select.Option key={index} value={index}>
              {option}
            </Select.Option>
          ))}
        </Select> 
      </Form.Item>
    </Card>
  );
};

export default QuizQuestionForm; 