import { config } from "../../../api/axios";
import { Button, Form, Input, notification } from "antd";
import { useState } from "react";

const ForgotPassword = () => {
      const [loading, setLoading] = useState(false);

      const handleSubmit = async (values: { email: string }) => {
            setLoading(true);
            try {
                  await config.post("/auth/forgot-password", { email: values.email });
                  notification.success({
                        message: "Gửi thành công",
                        description: "Kiểm tra email của bạn để biết liên kết đặt lại mật khẩu.",
                        placement: "topRight",
                  });
            } catch (err) {
                  notification.error({
                        message: "Thất bại",
                        description: "Email chưa được đăng ký tài khoản.",
                        placement: "topRight",
                  });
                  console.error(err);
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                  <div className="w-full max-w-lg p-8 bg-white shadow-md rounded-md">
                        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-green-400 mb-8">
                              Quên mật khẩu
                        </h2>
                        <Form layout="vertical" onFinish={handleSubmit}>
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
                                          type="email"
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
                                          Gửi liên kết đặt lại
                                    </Button>

                              </Form.Item>
                        </Form>
                  </div>
            </div>
      );
};

export default ForgotPassword;
