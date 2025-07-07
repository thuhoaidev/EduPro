import React, { useState } from 'react';
import { DatePicker, Form, Button } from 'antd';
import dayjs from 'dayjs';

const DateTest: React.FC = () => {
  const [form] = Form.useForm();
  const [testDate, setTestDate] = useState<any>(null);

  const handleDateChange = (date: any, dateString: string) => {
    console.log('=== DateTest Component ===');
    console.log('Date changed:', date);
    console.log('Date string:', dateString);
    console.log('Type:', typeof date);
    console.log('Is dayjs:', dayjs.isDayjs(date));
    console.log('Is valid:', date?.isValid?.());
    console.log('Format YYYY-MM-DD:', date?.format?.('YYYY-MM-DD'));
    
    setTestDate(date);
  };

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    console.log('=== Form Submit ===');
    console.log('Form values:', values);
    console.log('dateOfBirth from form:', values.dateOfBirth);
    console.log('dateOfBirth type:', typeof values.dateOfBirth);
    console.log('dateOfBirth isDayjs:', dayjs.isDayjs(values.dateOfBirth));
    
    if (values.dateOfBirth) {
      console.log('Formatted date:', values.dateOfBirth.format('YYYY-MM-DD'));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>DatePicker Test Component</h2>
      
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          name="dateOfBirth"
          label="Test Date"
          rules={[
            { required: true, message: 'Please select a date!' },
            {
              validator: (_, value) => {
                console.log('=== Validator ===');
                console.log('Value:', value);
                console.log('Type:', typeof value);
                console.log('Is dayjs:', dayjs.isDayjs(value));
                
                if (!value) {
                  return Promise.reject(new Error('Please select a date!'));
                }
                
                if (!dayjs.isDayjs(value)) {
                  return Promise.reject(new Error('Invalid date format!'));
                }
                
                return Promise.resolve();
              }
            }
          ]}
        >
          <DatePicker
            placeholder="Select date"
            format="DD/MM/YYYY"
            onChange={handleDateChange}
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Test Submit
          </Button>
        </Form.Item>
      </Form>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <h3>Current Test Date:</h3>
        <pre>{JSON.stringify(testDate, null, 2)}</pre>
      </div>
    </div>
  );
};

export default DateTest; 