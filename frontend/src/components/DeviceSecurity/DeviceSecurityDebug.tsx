import React, { useState } from 'react';
import { Button, Card, Typography, Space, Alert, Input, message } from 'antd';
import deviceSecurityService from '../../services/deviceSecurityService';

const { Title, Text, Paragraph } = Typography;

const DeviceSecurityDebug: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [courseId, setCourseId] = useState('1');

  const addResult = (test: string, result: any, success: boolean) => {
    setResults(prev => [...prev, { test, result, success, timestamp: new Date() }]);
  };

  const testDeviceStatus = async () => {
    setLoading(true);
    try {
      const response = await deviceSecurityService.checkDeviceStatus(parseInt(courseId));
      addResult('Check Device Status', response, true);
      message.success('Device status check successful');
    } catch (error: any) {
      addResult('Check Device Status', error.response?.data || error.message, false);
      message.error('Device status check failed');
    } finally {
      setLoading(false);
    }
  };

  const testDeviceRegistration = async () => {
    setLoading(true);
    try {
      const response = await deviceSecurityService.registerDevice(parseInt(courseId));
      addResult('Register Device', response, true);
      message.success('Device registration successful');
    } catch (error: any) {
      addResult('Register Device', error.response?.data || error.message, false);
      message.error('Device registration failed');
    } finally {
      setLoading(false);
    }
  };

  const testGetMyDevices = async () => {
    setLoading(true);
    try {
      const response = await deviceSecurityService.getUserDevices();
      addResult('Get My Devices', response, true);
      message.success('Get devices successful');
    } catch (error: any) {
      addResult('Get My Devices', error.response?.data || error.message, false);
      message.error('Get devices failed');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>🔍 Device Security Debug Tool</Title>
      
      <Alert
        message="Debug Tool"
        description="Use this tool to test device security functionality. Make sure you are logged in."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="Test Controls" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Course ID:</Text>
            <Input
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Enter course ID"
              style={{ width: 200, marginLeft: 8 }}
            />
          </div>
          
          <Space wrap>
            <Button 
              type="primary" 
              onClick={testDeviceStatus}
              loading={loading}
            >
              1. Check Device Status
            </Button>
            
            <Button 
              onClick={testDeviceRegistration}
              loading={loading}
            >
              2. Register Device
            </Button>
            
            <Button 
              onClick={testGetMyDevices}
              loading={loading}
            >
              3. Get My Devices
            </Button>
            
            <Button 
              danger
              onClick={clearResults}
            >
              Clear Results
            </Button>
          </Space>
        </Space>
      </Card>

      <Card title="Test Results">
        {results.length === 0 ? (
          <Text type="secondary">No test results yet. Run some tests above.</Text>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {results.map((result, index) => (
              <Card
                key={index}
                size="small"
                title={
                  <Space>
                    {result.success ? '✅' : '❌'}
                    <Text strong>{result.test}</Text>
                    <Text type="secondary">
                      {result.timestamp.toLocaleTimeString()}
                    </Text>
                  </Space>
                }
                style={{ 
                  border: result.success ? '1px solid #52c41a' : '1px solid #ff4d4f',
                  backgroundColor: result.success ? '#f6ffed' : '#fff2f0'
                }}
              >
                <pre style={{ 
                  fontSize: '12px', 
                  margin: 0, 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </Card>
            ))}
          </Space>
        )}
      </Card>

      <Card title="Instructions" style={{ marginTop: 24 }}>
        <Paragraph>
          <Title level={4}>How to test:</Title>
          <ol>
            <li><strong>Check Device Status:</strong> See if your device is registered for the course</li>
            <li><strong>Register Device:</strong> Register your current device for the course</li>
            <li><strong>Get My Devices:</strong> View all devices registered to your account</li>
          </ol>
        </Paragraph>
        
        <Paragraph>
          <Title level={4}>Expected behavior:</Title>
          <ul>
            <li>First time: Device status should return <code>isRegistered: false</code></li>
            <li>After registration: Device status should return <code>isRegistered: true</code></li>
            <li>Different browser/device: Should show violation warning</li>
          </ul>
        </Paragraph>
      </Card>
    </div>
  );
};

export default DeviceSecurityDebug;
