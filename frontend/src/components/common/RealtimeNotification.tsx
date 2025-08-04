import React, { useEffect, useState } from 'react';
import { notification, Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import socket from '../../services/socket';

interface RealtimeNotificationProps {
  userId?: string;
}

const RealtimeNotification: React.FC<RealtimeNotificationProps> = ({ userId }) => {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Kết nối socket nếu chưa kết nối
    if (!socket.connected) {
      socket.connect();
    }

    // Join room cho user nếu có userId
    if (userId) {
      socket.emit('join', userId);
    }

    // Listen cho email verification events
    socket.on('email-verified', (data) => {
      console.log('Realtime email verified:', data);
      
      if (data.isInstructor) {
        notification.success({
          message: 'Email giảng viên đã được xác minh!',
          description: `Chào mừng ${data.fullname}! Email của bạn đã được xác minh thành công. Hồ sơ sẽ được admin xét duyệt trong 3-5 ngày.`,
          duration: 8,
          placement: 'topRight',
        });
      } else {
        notification.success({
          message: 'Email đã được xác minh!',
          description: `Chào mừng ${data.fullname}! Email của bạn đã được xác minh thành công.`,
          duration: 6,
          placement: 'topRight',
        });
      }
      
      setNotificationCount(prev => prev + 1);
    });

    // Listen cho instructor approval events
    socket.on('instructor-approved', (data) => {
      console.log('Realtime instructor approved:', data);
      
      if (data.status === 'approved') {
        notification.success({
          message: 'Hồ sơ giảng viên đã được duyệt!',
          description: `Chúc mừng ${data.fullname}! Hồ sơ giảng viên của bạn đã được admin duyệt. Bạn có thể đăng nhập và bắt đầu tạo khóa học.`,
          duration: 10,
          placement: 'topRight',
        });
      } else {
        notification.error({
          message: 'Hồ sơ giảng viên bị từ chối',
          description: `Xin lỗi ${data.fullname}, hồ sơ giảng viên của bạn đã bị từ chối. Lý do: ${data.rejection_reason || 'Không có lý do cụ thể'}`,
          duration: 10,
          placement: 'topRight',
        });
      }
      
      setNotificationCount(prev => prev + 1);
    });

    // Listen cho new notifications
    socket.on('new-notification', (data) => {
      console.log('New notification received:', data);
      
      notification.info({
        message: data.title,
        description: data.content,
        duration: 6,
        placement: 'topRight',
      });
      
      setNotificationCount(prev => prev + 1);
    });

    // Cleanup listeners
    return () => {
      socket.off('email-verified');
      socket.off('instructor-approved');
      socket.off('new-notification');
    };
  }, [userId]);

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
      <Badge count={notificationCount} size="small">
        <div style={{ 
          padding: '8px 12px', 
          background: 'rgba(6, 182, 212, 0.1)', 
          borderRadius: '8px',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#06b6d4',
          fontWeight: 500
        }}>
          <BellOutlined />
          <span>Realtime</span>
        </div>
      </Badge>
    </div>
  );
};

export default RealtimeNotification;