import React, { useEffect } from 'react';
import { useDeviceSecurity } from '../../hooks/useDeviceSecurity';
import DeviceRegistrationModal from './DeviceRegistrationModal';
import DeviceViolationAlert from './DeviceViolationAlert';

interface CourseAccessWrapperProps {
  courseId: number;
  courseName: string;
  children: React.ReactNode;
  requireDeviceCheck?: boolean;
}

const CourseAccessWrapper: React.FC<CourseAccessWrapperProps> = ({
  courseId,
  courseName,
  children,
  requireDeviceCheck = true
}) => {
  console.log('🔒 CourseAccessWrapper:', {
    courseId,
    courseName,
    requireDeviceCheck
  });

  const {
    isRegistered,
    isLoading,
    showRegistrationModal,
    showViolationAlert,
    violationMessage,
    registerDevice,
    closeRegistrationModal,
    closeViolationAlert,
    checkDeviceStatus
  } = useDeviceSecurity({ 
    courseId, 
    autoCheck: requireDeviceCheck 
  });

  console.log('🔒 Device Security State:', {
    isRegistered,
    isLoading,
    showRegistrationModal,
    showViolationAlert,
    violationMessage
  });

  // Backup useEffect để đảm bảo device check chạy
  useEffect(() => {
    console.log('🔄 CourseAccessWrapper useEffect:', { courseId, requireDeviceCheck });
    if (requireDeviceCheck && courseId && checkDeviceStatus) {
      console.log('🚀 Backup device check triggered');
      setTimeout(() => {
        checkDeviceStatus(courseId);
      }, 100); // Delay nhỏ để đảm bảo hook đã khởi tạo
    }
  }, [courseId, requireDeviceCheck, checkDeviceStatus]);

  const handleRegistrationSuccess = () => {
    closeRegistrationModal();
  };

  // Nếu không yêu cầu kiểm tra thiết bị, render children trực tiếp
  if (!requireDeviceCheck) {
    return <>{children}</>;
  }

  // Nếu đang loading, có thể hiển thị loading spinner
  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Render children - nội dung course */}
      {children}
      
      {/* Chỉ hiện alert vi phạm khi có vi phạm */}
      {showViolationAlert && (
        <DeviceViolationAlert
          message={violationMessage}
          onClose={closeViolationAlert}
        />
      )}
    </>
  );
};

export default CourseAccessWrapper;
