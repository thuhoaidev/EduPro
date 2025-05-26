import { Button, Checkbox, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import useLogin from "../../../hooks/useLogin";

export function LoginPage() {
      const [messageApi, contextHolder] = message.useMessage();
      const navigate = useNavigate();
      const { mutate } = useLogin({ resource: "login" });

      const onFinish = (formData: any) =>
            mutate(formData, {
                  onSuccess: () => {
                        messageApi.success("Đăng nhập thành công");
                        setTimeout(() => {
                              navigate("/");
                        }, 1000);
                  },
                  onError: (error: any) => {
                        messageApi.error(error?.response?.data || "Đăng nhập thất bại.");
                  },
            });

      return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                  <div className="w-full max-w-lg p-8 bg-white shadow-md rounded-md">
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
                                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
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
            </div>
      );
}

export default LoginPage;
