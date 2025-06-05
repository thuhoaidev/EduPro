import { Button, Checkbox, Form, Input, message, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";
import useLogin from "../../../hooks/Auths/useLogin";
import bgrImage from "../../../assets/images/bgr-login-register.jpg"
import { useState } from "react";
import { config } from "../../../api/axios";

export function LoginPage() {
      const [messageApi, contextHolder] = message.useMessage();
      const navigate = useNavigate();
      const { mutate } = useLogin({ resource: "login" });
      const [showVerificationModal, setShowVerificationModal] = useState(false);
      const [verificationEmail, setVerificationEmail] = useState("");
      const [resendingVerification, setResendingVerification] = useState(false);

      const handleResendVerification = async () => {
            try {
                  setResendingVerification(true);
                  await config.post('/auth/resend-verification', { email: verificationEmail });
                  messageApi.success("Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.");
                  setShowVerificationModal(false);
            } catch (error: any) {
                  messageApi.error(error?.response?.data?.message || "Lỗi gửi lại email xác thực");
            } finally {
                  setResendingVerification(false);
            }
      };

      const onFinish = (formData: any) =>
            mutate(formData, {
                  onSuccess: (data: any) => {
                        console.log("Login thành công, response:", data);
                        localStorage.setItem("user", JSON.stringify(data.user));
                        if (data?.token) {
                              localStorage.setItem("token", data.token);
                              messageApi.success("Đăng nhập thành công");
                              setTimeout(() => {
                                    navigate("/");
                              }, 1000);
                        } else {
                              messageApi.error("Không nhận được token. Vui lòng thử lại.");
                        }
                  },

                  onError: (error: any) => {
                        const errorData = error?.response?.data;
                        if (errorData?.data?.canResendVerification) {
                              setVerificationEmail(errorData.data.email);
                              setShowVerificationModal(true);
                        } else {
                              messageApi.error(errorData?.message || "Đăng nhập thất bại.");
                        }
                  },
            });

      return (
           
            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                  <div className="flex bg-white shadow-md rounded-md overflow-hidden w-full max-w-5xl min-h-[500px]">
                        <div className="hidden md:flex items-center justify-center w-1/2 p-4">
                              <img
                                    src={bgrImage}
                                    alt="Login Illustration"
                                    className="max-h-[90%] max-w-full object-contain"
                              />
                        </div>

                        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                              <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-green-400 mb-8">
                                    Đăng Nhập
                              </h2>

                              <Form layout="vertical" onFinish={onFinish}>
                                    <Form.Item
                                          name="email"
                                          rules={[
                                                { required: true, message: "Vui lòng nhập email!" },
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
                                                { required: true, message: "Vui lòng nhập mật khẩu!" },
                                                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                                          ]}
                                    >
                                          <Input.Password
                                                size="large"
                                                placeholder="Mật khẩu"
                                                className="bg-gray-50 py-3"
                                                autoComplete="current-password"
                                          />
                                    </Form.Item>

                                    <div className="flex justify-between items-center mb-4">
                                          <Form.Item name="remember" valuePropName="checked" noStyle>
                                                <Checkbox>Lưu cho lần đăng nhập sau</Checkbox>
                                          </Form.Item>
                                          <Link to="/forgot-password" className="text-purple-600 text-sm">
                                                Quên mật khẩu?
                                          </Link>
                                    </div>

                                    <Form.Item>
                                          <Button
                                                type="primary"
                                                size="large"
                                                htmlType="submit"
                                                className="w-full !bg-gradient-to-r !from-cyan-500 !to-green-400 !text-white !font-semibold hover:opacity-90 border-none"
                                          >
                                                Đăng Nhập
                                          </Button>
                                    </Form.Item>

                                    <div className="text-center text-base mt-2">
                                          <Link to="/register" className="text-blue-500 hover:underline">
                                                Bạn chưa có tài khoản?
                                          </Link>
                                    </div>
                              </Form>

                              {contextHolder}
                        </div>

                        {contextHolder}
                        <Modal
                              title="Xác thực email"
                              open={showVerificationModal}
                              onCancel={() => setShowVerificationModal(false)}
                              footer={[
                                    <Button key="cancel" onClick={() => setShowVerificationModal(false)}>
                                          Đóng
                                    </Button>,
                                    <Button
                                          key="resend"
                                          type="primary"
                                          loading={resendingVerification}
                                          onClick={handleResendVerification}
                                          className="!bg-gradient-to-r !from-cyan-500 !to-green-400 !text-white !font-semibold hover:opacity-90 border-none"
                                    >
                                          Gửi lại email xác thực
                                    </Button>,
                              ]}
                        >
                              <p>Vui lòng xác thực email của bạn trước khi đăng nhập.</p>
                              <p>Email: {verificationEmail}</p>
                              <p>Bạn có thể nhấn nút bên dưới để gửi lại email xác thực.</p>
                        </Modal>
                  </div>
            </div>

      );
}

export default LoginPage;
