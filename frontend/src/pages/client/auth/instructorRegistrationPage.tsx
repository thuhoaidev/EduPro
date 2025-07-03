import React, { useState, useEffect } from "react";
import { Button, Form, Input, Select, Upload, DatePicker, message } from "antd";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  UserAddOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  StarOutlined,
  BookOutlined
} from "@ant-design/icons";
import AuthNotification from "../../../components/common/AuthNotification";
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface InstructorRegistrationForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  dateOfBirth: dayjs.Dayjs;
  address: string;
  degree: string;
  institution: string;
  graduationYear: number | string;
  major: string;
  specializations: string[];
  teachingExperience: number | string;
  experienceDescription: string;
  avatar: any[];
  cv: any[];
  certificates: any[];
  demoVideo: any[];
  bio: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

interface InstructorRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      fullname: string;
      email: string;
      status: string;
      email_verified: boolean;
      approval_status: string;
    };
    instructorInfo: any;
  };
}

export function InstructorRegistrationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [form] = Form.useForm();
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
  }>({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Fallback method để gọi API trực tiếp
  const callInstructorAPI = async (formData: FormData): Promise<InstructorRegistrationResponse> => {
    try {
      console.log('🔄 Using fallback API call method...');
      const response = await fetch('http://localhost:5000/api/auth/instructor-register', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Fallback API call successful:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Fallback API call failed:', error);
      throw error;
    }
  };

  const onFinish = async (values: InstructorRegistrationForm) => {
    setLoading(true);
    try {
      console.log('Form values before validation:', values);
      
      // Validate form trước khi xử lý
      await form.validateFields();
      
      console.log('Form validation passed');
      
      // Tạo FormData để gửi file
      const formData = new FormData();

      // Thêm thông tin cá nhân
      formData.append('fullName', values.fullName || form.getFieldValue('fullName') || '');
      formData.append('email', values.email || form.getFieldValue('email') || '');
      formData.append('phone', values.phone || form.getFieldValue('phone') || '');
      formData.append('password', values.password || form.getFieldValue('password') || '');
      formData.append('gender', values.gender || form.getFieldValue('gender') || '');

      // Xử lý dateOfBirth an toàn
      try {
        const dateValue = form.getFieldValue('dateOfBirth') || values.dateOfBirth;
        if (!dateValue) throw new Error('Vui lòng chọn ngày sinh!');
        let dateToFormat = dateValue;
        if (typeof dateValue === 'string') dateToFormat = dayjs(dateValue);
        if (dateValue instanceof Date) dateToFormat = dayjs(dateValue);
        if (!dayjs.isDayjs(dateToFormat)) throw new Error('Ngày sinh không hợp lệ!');
        const formattedDate = dateToFormat.format('YYYY-MM-DD');
        formData.append('dateOfBirth', formattedDate);
      } catch (error: any) {
        console.error('Date formatting error:', error);
        throw new Error(error.message || 'Vui lòng chọn ngày sinh hợp lệ!');
      }
      formData.append('address', values.address || form.getFieldValue('address') || '');

      // Thêm thông tin học vấn
      const degreeValue = values.degree || form.getFieldValue('degree') || '';
      const institutionValue = values.institution || form.getFieldValue('institution') || '';
      const graduationYearValue = values.graduationYear || form.getFieldValue('graduationYear') || '';
      const majorValue = values.major || form.getFieldValue('major') || '';
      formData.append('degree', degreeValue.toString().trim());
      formData.append('institution', institutionValue.toString().trim());
      formData.append('graduationYear', graduationYearValue.toString());
      formData.append('major', majorValue.toString().trim());

      // Thêm thông tin chuyên môn
      const specializationsValue = values.specializations || form.getFieldValue('specializations') || [];
      if (Array.isArray(specializationsValue)) {
        specializationsValue.forEach((spec, idx) => {
          if (typeof spec === 'string' && spec.trim()) {
            formData.append(`specializations[${idx}]`, spec.trim());
          }
        });
      } else if (typeof specializationsValue === 'string' && specializationsValue.trim()) {
        formData.append('specializations[0]', specializationsValue.trim());
      }
      formData.append('teachingExperience', (values.teachingExperience || form.getFieldValue('teachingExperience') || '').toString());
      formData.append('experienceDescription', (values.experienceDescription || form.getFieldValue('experienceDescription') || '').toString().trim());

      // Thêm thông tin bổ sung
      formData.append('bio', values.bio || form.getFieldValue('bio') || '');
      if (values.linkedin || form.getFieldValue('linkedin')) formData.append('linkedin', values.linkedin || form.getFieldValue('linkedin'));
      if (values.github || form.getFieldValue('github')) formData.append('github', values.github || form.getFieldValue('github'));
      if (values.website || form.getFieldValue('website')) formData.append('website', values.website || form.getFieldValue('website'));

      // Thêm files
      if (values.avatar && values.avatar.length > 0) {
        formData.append('avatar', values.avatar[0].originFileObj);
      }
      if (values.cv && values.cv.length > 0) {
        formData.append('cv', values.cv[0].originFileObj);
      }
      if (values.certificates && values.certificates.length > 0) {
        values.certificates.forEach(cert => {
          formData.append('certificates', cert.originFileObj);
        });
      }
      if (values.demoVideo && values.demoVideo.length > 0) {
        formData.append('demoVideo', values.demoVideo[0].originFileObj);
      }

      // Log lại FormData để kiểm tra
      for (const pair of formData.entries()) {
        console.log(pair[0]+ ': ', pair[1]);
      }
      
      console.log('🚀 Bắt đầu gọi API instructor registration...');
      
      // Gọi API trực tiếp
      const result: InstructorRegistrationResponse = await callInstructorAPI(formData);
      
      console.log('✅ API call thành công:', result);
      
      // Kiểm tra response structure
      if (result.success) {
        setNotification({
          isVisible: true,
          type: 'success',
          title: 'Đăng ký thành công!',
          message: `Hồ sơ giảng viên của bạn đã được gửi thành công. Vui lòng kiểm tra email ${result.data.user.email} để xác minh tài khoản.`
        });
        
        // Hiển thị thông tin chi tiết về quy trình
        setTimeout(() => {
          message.info('📧 Vui lòng kiểm tra email và xác minh tài khoản trước khi đăng nhập!');
        }, 1000);
        
        setTimeout(() => {
          message.info('⏳ Sau khi xác minh email, hồ sơ của bạn sẽ được admin xét duyệt trong 3-5 ngày làm việc.');
        }, 2000);
      
        setTimeout(() => {
          navigate("/");
        }, 4000);
      } else {
        throw new Error(result.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } catch (error: any) {
      console.error('Lỗi đăng ký:', error);
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Lỗi đăng ký!',
        message: error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    }).catch((errorInfo) => {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStep1 = () => (
    <>
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Thông tin cá nhân
      </h3>
      
      <Form.Item
        name="fullName"
        rules={[
          { required: true, message: 'Vui lòng nhập họ và tên!' },
          { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
        ]}
      >
        <Input
          size="large"
          placeholder="Họ và tên đầy đủ"
          prefix={<UserOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
        />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Email là bắt buộc" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
      >
        <Input
          size="large"
          placeholder="Email"
          prefix={<MailOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
        />
      </Form.Item>

      <Form.Item
        name="phone"
        rules={[
          { required: true, message: "Số điện thoại là bắt buộc" },
          { pattern: /^[0-9+\-\s()]+$/, message: "Số điện thoại không hợp lệ" },
        ]}
      >
        <Input
          size="large"
          placeholder="Số điện thoại"
          prefix={<PhoneOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
        />
      </Form.Item>

      <Form.Item
        name="gender"
        rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
      >
        <Select
          size="large"
          placeholder="Chọn giới tính"
          className="h-12 rounded-lg"
        >
          <Option value="Nam">Nam</Option>
          <Option value="Nữ">Nữ</Option>
          <Option value="Khác">Khác</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="dateOfBirth"
        rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
      >
        <DatePicker
          size="large"
          placeholder="Ngày sinh"
          className="w-full h-12 rounded-lg"
          format="DD/MM/YYYY"
        />
      </Form.Item>

      <Form.Item
        name="address"
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
      >
        <Input
          size="large"
          placeholder="Địa chỉ"
          prefix={<EnvironmentOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: "Mật khẩu là bắt buộc" },
          { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
        ]}
      >
        <Input.Password
          size="large"
          placeholder="Mật khẩu"
          prefix={<LockOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
            },
          }),
        ]}
      >
        <Input.Password
          size="large"
          placeholder="Xác nhận mật khẩu"
          prefix={<LockOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
        />
      </Form.Item>
    </>
  );

  const renderStep2 = () => (
    <>
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Thông tin học vấn & Chuyên môn
      </h3>
      
      <Form.Item
        name="degree"
        rules={[{ required: true, message: "Vui lòng nhập bằng cấp!" }]}
      >
        <Input
          size="large"
          placeholder="Bằng cấp cao nhất (VD: Cử nhân, Thạc sĩ, Tiến sĩ)"
          prefix={<FileTextOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
        />
      </Form.Item>

      <Form.Item
        name="institution"
        rules={[{ required: true, message: "Vui lòng nhập trường đại học!" }]}
      >
        <Input
          size="large"
          placeholder="Trường đại học/Cơ sở đào tạo"
          prefix={<BookOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
        />
      </Form.Item>

      <Form.Item
        name="major"
        rules={[{ required: true, message: "Vui lòng nhập chuyên ngành!" }]}
      >
        <Input
          size="large"
          placeholder="Chuyên ngành"
          prefix={<BookOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
        />
      </Form.Item>

      <Form.Item
        name="graduationYear"
        rules={[{ required: true, message: "Vui lòng nhập năm tốt nghiệp!" }]}
      >
        <Input
          size="large"
          placeholder="Năm tốt nghiệp"
          prefix={<CalendarOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
          type="number"
        />
      </Form.Item>

      <Form.Item
        name="specializations"
        rules={[{ required: true, message: "Vui lòng nhập lĩnh vực chuyên môn!" }]}
      >
        <Select
          mode="tags"
          size="large"
          placeholder="Lĩnh vực chuyên môn (VD: JavaScript, React, Node.js)"
          className="h-12 rounded-lg"
        />
      </Form.Item>

      <Form.Item
        name="teachingExperience"
        rules={[{ required: true, message: "Vui lòng nhập số năm kinh nghiệm!" }]}
      >
        <Input
          size="large"
          placeholder="Số năm kinh nghiệm giảng dạy"
          prefix={<StarOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
          type="number"
        />
      </Form.Item>

      <Form.Item
        name="experienceDescription"
        rules={[{ required: true, message: "Vui lòng mô tả kinh nghiệm!" }]}
      >
        <TextArea
          rows={4}
          placeholder="Mô tả chi tiết kinh nghiệm giảng dạy, dự án đã thực hiện, thành tựu đạt được..."
          className="rounded-lg"
        />
      </Form.Item>
    </>
  );

  const renderStep3 = () => (
    <>
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Hồ sơ & Tài liệu
      </h3>
      
      <Form.Item
        name="avatar"
        rules={[{ required: true, message: "Vui lòng tải lên ảnh đại diện!" }]}
        valuePropName="fileList"
        getValueFromEvent={(e) => {
          if (Array.isArray(e)) {
            return e;
          }
          return e?.fileList;
        }}
      >
        <Upload
          beforeUpload={() => false}
          maxCount={1}
          accept="image/*"
          listType="picture-card"
        >
          <div className="flex flex-col items-center">
            <UserAddOutlined className="text-2xl mb-2" />
            <div>Tải ảnh đại diện</div>
          </div>
        </Upload>
      </Form.Item>

      <Form.Item
        name="cv"
        rules={[{ required: true, message: "Vui lòng tải lên CV!" }]}
        valuePropName="fileList"
        getValueFromEvent={(e) => {
          if (Array.isArray(e)) {
            return e;
          }
          return e?.fileList;
        }}
      >
        <Upload
          beforeUpload={() => false}
          maxCount={1}
          accept=".pdf,.doc,.docx"
        >
          <Button 
            icon={<UploadOutlined />} 
            size="large"
            className="w-full h-12 rounded-lg"
          >
            Tải lên CV (PDF, DOC)
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item
        name="certificates"
        rules={[{ required: true, message: "Vui lòng tải lên ít nhất 1 chứng chỉ!" }]}
        valuePropName="fileList"
        getValueFromEvent={(e) => {
          if (Array.isArray(e)) {
            return e;
          }
          return e?.fileList;
        }}
      >
        <Upload
          beforeUpload={() => false}
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        >
          <Button 
            icon={<SafetyCertificateOutlined />} 
            size="large"
            className="w-full h-12 rounded-lg"
          >
            Tải lên chứng chỉ (PDF, DOC, JPG)
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item
        name="demoVideo"
        valuePropName="fileList"
        getValueFromEvent={(e) => {
          if (Array.isArray(e)) {
            return e;
          }
          return e?.fileList;
        }}
      >
        <Upload
          beforeUpload={() => false}
          maxCount={1}
          accept="video/*"
        >
          <Button 
            icon={<VideoCameraOutlined />} 
            size="large"
            className="w-full h-12 rounded-lg"
          >
            Tải lên video demo giảng dạy (Tùy chọn)
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item
        name="bio"
        rules={[{ required: true, message: "Vui lòng nhập mô tả bản thân!" }]}
      >
        <TextArea
          rows={4}
          placeholder="Giới thiệu về bản thân, phương pháp giảng dạy, mục tiêu..."
          className="rounded-lg"
        />
      </Form.Item>

      <Form.Item name="linkedin">
        <Input
          size="large"
          placeholder="LinkedIn URL (Tùy chọn)"
          prefix={<GlobalOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
        />
      </Form.Item>

      <Form.Item name="github">
        <Input
          size="large"
          placeholder="GitHub URL (Tùy chọn)"
          prefix={<GlobalOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
        />
      </Form.Item>

      <Form.Item name="website">
        <Input
          size="large"
          placeholder="Website cá nhân (Tùy chọn)"
          prefix={<GlobalOutlined className="text-gray-400" />}
          className="h-12 rounded-lg"
        />
      </Form.Item>
    </>
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)", transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8 relative">
      {/* Back to Home Button */}
      <motion.div
        className="absolute top-6 left-6 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 hover:text-cyan-600"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div
            className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
            whileHover={{ rotate: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeftOutlined className="text-xs" />
          </motion.div>
          <span className="font-medium text-sm">Trang chủ</span>
          <motion.div
            className="w-2 h-2 rounded-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          />
        </motion.button>
      </motion.div>
      {/* Main Card */}
      <motion.div 
        className="flex bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden w-full max-w-4xl min-h-[600px] border border-white/20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side - Form */}
        <div className="w-full p-8 lg:p-12 flex flex-col justify-center relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>
          <motion.div
            variants={itemVariants}
            className="relative z-10"
          >
            <motion.h2
              className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600"
              variants={itemVariants}
            >
              Đăng ký Giảng viên
            </motion.h2>
            <motion.p
              className="text-center text-gray-600 mb-8"
              variants={itemVariants}
            >
              Chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng học viên. Hãy điền đầy đủ thông tin để chúng tôi có thể xét duyệt hồ sơ của bạn.
            </motion.p>
            {/* Progress Steps */}
            <motion.div className="mb-8" variants={itemVariants}>
              <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep >= step 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-1 mx-2 ${
                        currentStep > step ? 'bg-cyan-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Bước {currentStep} của 3: {
                    currentStep === 1 ? 'Thông tin cá nhân' :
                    currentStep === 2 ? 'Học vấn & Chuyên môn' :
                    'Hồ sơ & Tài liệu'
                  }
                </p>
              </div>
            </motion.div>
            {/* Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="space-y-6"
            >
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </motion.div>
              {/* Navigation Buttons */}
              <motion.div 
                className="flex justify-between items-center pt-6 border-t border-gray-200"
                variants={itemVariants}
              >
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {currentStep > 1 && (
                    <Button
                      type="default"
                      size="large"
                      onClick={prevStep}
                      icon={<ArrowLeftOutlined />}
                      className="h-12 px-8 rounded-lg border-gray-300 hover:border-cyan-400 hover:text-cyan-600 transition-all duration-300"
                    >
                      Quay lại
                    </Button>
                  )}
                </motion.div>
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {currentStep < 3 ? (
                    <Button
                      type="primary"
                      size="large"
                      onClick={nextStep}
                      className="h-12 px-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Tiếp theo
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={loading}
                      className="h-12 px-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {loading ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
                    </Button>
                  )}
                </motion.div>
              </motion.div>
            </Form>
          </motion.div>
        </div>
        {/* (Có thể bổ sung thêm phần phải cho hình ảnh/giới thiệu nếu muốn) */}
      </motion.div>
      {/* Notification */}
      <AuthNotification
        isVisible={notification.isVisible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
    </div>
  );
}

export default InstructorRegistrationPage; 