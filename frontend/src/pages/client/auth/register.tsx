import {
  Button,
  Form,
  Input,
  message,
  Modal,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import useRegister from "../../../hooks/Auths/useRegister";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import bgrImage from "../../../assets/images/bgr-login-register.jpg"
export function RegisterPage() {
      const [messageApi, contextHolder] = message.useMessage();
      const navigate = useNavigate();
      const { mutate } = useRegister({ resource: "register" });
      const [captchaToken, setCaptchaToken] = useState<string | null>(null);
      const [loading, setLoading] = useState(false);

      const onFinish = (formData: any) => {
            console.log('Form submit data:', formData);
            if (!captchaToken) {
                  messageApi.error("Vui lòng xác nhận bạn không phải robot!");
                  return;
            }

            const newObject = {
                  nickname: formData.nickname,
                  email: formData.email,
                  password: formData.password,
                  fullName: formData.fullName,
                  captchaToken,
            };

            setLoading(true);

            mutate(newObject, {
                  onSuccess: () => {
                        Modal.success({
                              title: "Tạo tài khoản thành công!",
                              content: (
                                    <div>
                                          <p>Tài khoản của bạn đã được tạo thành công!</p>
                                          <p>Vui lòng đăng nhập để tiếp tục.</p>
                                    </div>
                              ),
                              okText: "Đã hiểu",
                              onOk: () => {
                                    navigate("/");
                              }
                        });
                        navigate("/");
                  },
                  onError: (error: any) => {
                        const errorMessage = error?.response?.data?.message || "Đã xảy ra lỗi.";
                        messageApi.error(errorMessage);
                  },
                  onSettled: () => {
                        setLoading(false);
                  },
            });



      };

      return (
            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                  <div className="flex bg-white shadow-md rounded-md overflow-hidden w-full max-w-5xl min-h-[600px]">
                        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                              <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-green-400 mb-8">
                                    Đăng Ký
                              </h2>

                              <Form layout="vertical" onFinish={onFinish}>
                                    <Form.Item
                                          name="fullName"
                                          rules={[
                                                {
                                                  required: true,
                                                  message: 'Vui lòng nhập họ và tên!',
                                                },
                                                {
                                                  min: 2,
                                                  message: 'Họ và tên phải có ít nhất 2 ký tự!',
                                                },
                                          ]}
                                    >
                                          <Input
                                                placeholder="Họ và tên"
                                                size="large"
                                          />
                                    </Form.Item>

                                    <Form.Item
                                          name="nickname"
                                          rules={[
                                                { required: true, message: "Tên đăng nhập là bắt buộc" },
                                                { pattern: /^[a-zA-Z0-9]+$/, message: "Tên đăng nhập chỉ được chứa chữ cái và số" },
                                          ]}
                                    >
                                          <Input
                                                size="large"
                                                placeholder="Tên đăng nhập (chữ và số)"
                                                className="bg-gray-50 py-3"
                                                autoComplete="username"
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
                                                className="bg-gray-50 py-3"
                                                autoComplete="email"
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
                                                className="bg-gray-50 py-3"
                                                autoComplete="new-password"
                                          />
                                    </Form.Item>

                                    <Form.Item>
                                          <ReCAPTCHA
                                                sitekey="6LffdUYrAAAAALJWWmP223n903IMwvy7KFj3exxT"
                                                onChange={(token: any) => setCaptchaToken(token)}
                                          />
                                    </Form.Item>

                                    <Form.Item>
                                          <Button
                                                type="primary"
                                                size="large"
                                                htmlType="submit"
                                                loading={loading}
                                                className="w-full !bg-gradient-to-r !from-cyan-500 !to-green-400 !text-white !font-semibold hover:opacity-90 border-none"
                                          >
                                                Đăng Ký
                                          </Button>
                                    </Form.Item>

                                    <div className="text-center text-base mt-2">
                                          <Link to="/login" className="text-blue-500 hover:underline">
                                                Bạn đã có tài khoản?
                                          </Link>
                                    </div>
                              </Form>

                              {contextHolder}
                        </div>

                        <div className="hidden md:flex items-center justify-center w-1/2 p-4">
                              <img
                                    src={bgrImage}
                                    alt="Register Illustration"
                                    className="max-h-[90%] max-w-full object-contain"
                              />
                        </div>
                  </div>
            </div>

      );
}

export default RegisterPage;
