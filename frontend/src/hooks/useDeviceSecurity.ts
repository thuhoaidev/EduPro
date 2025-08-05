import { useState, useEffect, useCallback } from 'react';
import deviceSecurityService from '../services/deviceSecurityService';
import { message } from 'antd';

interface UseDeviceSecurityProps {
  courseId?: number;
  autoCheck?: boolean;
}

interface DeviceSecurityState {
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  showRegistrationModal: boolean;
  showViolationAlert: boolean;
  violationMessage: string;
}

export const useDeviceSecurity = ({
  courseId,
  autoCheck = true
}: UseDeviceSecurityProps = {}) => {
  const [state, setState] = useState<DeviceSecurityState>({
    isRegistered: false,
    isLoading: false,
    error: null,
    showRegistrationModal: false,
    showViolationAlert: false,
    violationMessage: ''
  });

  const checkDeviceStatus = useCallback(async (targetCourseId?: number) => {
    const checkCourseId = targetCourseId || courseId;
    console.log('🔍 Checking device status for course:', checkCourseId);

    if (!checkCourseId) {
      console.log('⚠️ No courseId provided');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🚀 Calling deviceSecurityService.checkDeviceStatus...');
      const response = await deviceSecurityService.checkDeviceStatus(checkCourseId);
      console.log('✅ Device status response:', response);

      if (!response.data.isRegistered) {
        // Tự động đăng ký thiết bị thay vì hiện modal
        await registerDevice(checkCourseId);
      } else {
        setState(prev => ({
          ...prev,
          isRegistered: true,
          isLoading: false
        }));
      }

      return response.data.isRegistered;
    } catch (error: any) {
      console.error('Check device status error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Không thể kiểm tra trạng thái thiết bị',
        isLoading: false
      }));
      return false;
    }
  }, [courseId]);

  const registerDevice = useCallback(async (targetCourseId?: number) => {
    const registerCourseId = targetCourseId || courseId;
    console.log('📝 Registering device for course:', registerCourseId);

    if (!registerCourseId) {
      console.log('⚠️ No courseId for registration');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🚀 Calling deviceSecurityService.registerDevice...');
      const result = await deviceSecurityService.registerDevice(registerCourseId);
      console.log('✅ Device registration result:', result);

      setState(prev => ({
        ...prev,
        isRegistered: true,
        showRegistrationModal: false,
        isLoading: false
      }));

      message.success('Đăng ký thiết bị thành công!');
      return true;
    } catch (error: any) {
      console.error('Register device error:', error);

      if (error.message.includes('Device sharing detected')) {
        setState(prev => ({
          ...prev,
          showViolationAlert: true,
          violationMessage: error.message,
          showRegistrationModal: false,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: error.message || 'Đăng ký thiết bị thất bại',
          isLoading: false
        }));
        message.error('Đăng ký thiết bị thất bại');
      }
      return false;
    }
  }, [courseId]);

  const closeRegistrationModal = useCallback(() => {
    setState(prev => ({ ...prev, showRegistrationModal: false }));
  }, []);

  const closeViolationAlert = useCallback(() => {
    setState(prev => ({
      ...prev,
      showViolationAlert: false,
      violationMessage: ''
    }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      isRegistered: false,
      isLoading: false,
      error: null,
      showRegistrationModal: false,
      showViolationAlert: false,
      violationMessage: ''
    });
  }, []);

  // Auto check device status when courseId changes
  useEffect(() => {
    console.log('🔄 useEffect triggered:', {
      autoCheck,
      courseId,
      courseIdType: typeof courseId,
      courseIdValue: courseId
    });

    // Force check nếu có courseId (bỏ qua autoCheck)
    if (courseId) {
      console.log('🚀 Force checking device status for courseId:', courseId);
      checkDeviceStatus(courseId);
    } else {
      console.log('⚠️ No courseId provided:', { autoCheck, courseId });
    }
  }, [courseId, checkDeviceStatus]);

  return {
    ...state,
    checkDeviceStatus,
    registerDevice,
    closeRegistrationModal,
    closeViolationAlert,
    resetState
  };
};

export default useDeviceSecurity;
