import { config } from "../../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form, Input, notification } from "antd";
import { useState } from "react";
import bgrImage from "../../../assets/images/bgr-login-register.jpg"

const ResetPassword = () => {
      const { token } = useParams();
      const navigate = useNavigate();
      const [loading, setLoading] = useState(false);

      const handleSubmit = async (values: { password: string }) => {
            setLoading(true);
            try {
                  await config.post(`/auth/reset-password/${token}`, {
                        password: values.password,
                  });
                  notification.success({
                        message: "Thay đổi mật khẩu thành công",
                        description: "Mật khẩu đã được đặt lại. Bạn sẽ được chuyển hướng.",
                        placement: "topRight",
                  });
                  setTimeout(() => {
                        navigate('/login');
                  }, 1000);
            } catch (error: any) {
                  notification.error({
                        message: "Lỗi",
                        description:
                              error.response?.data?.message || "Có lỗi xảy ra khi đặt lại mật khẩu.",
                  });
                  console.error(error);
            } finally {
                  setLoading(false);
            }
      };


      return (
            // <div className="min-h-screen flex items-center justify-center bg-white">
            //       <div className="w-full max-w-lg p-8 bg-white shadow-md rounded-md">
            //             <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-green-400 mb-8">
            //                   Đặt lại mật khẩu
            //             </h2>
            //             <Form layout="vertical" onFinish={handleSubmit}>
            //                   <Form.Item
            //                         name="password"
            //                         rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }, { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },]}
            //                   >
            //                         <Input.Password
            //                               size="large"
            //                               placeholder="Mật khẩu mới"
            //                               className="bg-gray-50 py-3"
            //                               autoComplete="new-password"
            //                         />
            //                   </Form.Item>

            //                   <Form.Item
            //                         name="confirm"
            //                         dependencies={["password"]}
            //                         hasFeedback
            //                         rules={[
            //                               {
            //                                     required: true,
            //                                     message: "Vui lòng xác nhận lại mật khẩu!",
            //                               },
            //                               ({ getFieldValue }) => ({
            //                                     validator(_, value) {
            //                                           if (!value || getFieldValue("password") === value) {
            //                                                 return Promise.resolve();
            //                                           }
            //                                           return Promise.reject(
            //                                                 new Error("Mật khẩu không khớp!")
            //                                           );
            //                                     },
            //                               }),
            //                         ]}
            //                   >
            //                         <Input.Password
            //                               size="large"
            //                               placeholder="Nhập lại mật khẩu"
            //                               className="bg-gray-50 py-3"
            //                               autoComplete="new-password"
            //                         />
            //                   </Form.Item>

            //                   <Form.Item>
            //                         <Button
            //                               type="primary"
            //                               size="large"
            //                               htmlType="submit"
            //                               loading={loading}
            //                               className="w-full !bg-gradient-to-r !from-cyan-500 !to-green-400 !text-white !font-semibold hover:opacity-90 border-none"
            //                         >
            //                               Đặt lại mật khẩu
            //                         </Button>

            //                   </Form.Item>
            //             </Form>
            //       </div>
            // </div>
            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                  <div className="flex bg-white shadow-md rounded-md overflow-hidden w-full max-w-5xl min-h-[500px]">

                        {/* LEFT: Image */}
                        <div className="hidden md:flex items-center justify-center w-1/2 bg-gray-50 p-4">
                              <img
                                    src={bgrImage}
                                    alt="Reset Password Illustration"
                                    className="max-h-[90%] max-w-full object-contain"
                              />
                        </div>

                        {/* RIGHT: Reset Password Form */}
                        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                              <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-green-400 mb-8">
                                    Đặt lại mật khẩu
                              </h2>

                              <Form layout="vertical" onFinish={handleSubmit}>
                                    <Form.Item
                                          name="password"
                                          rules={[
                                                { required: true, message: "Vui lòng nhập mật khẩu!" },
                                                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                                          ]}
                                    >
                                          <Input.Password
                                                size="large"
                                                placeholder="Mật khẩu mới"
                                                className="bg-gray-50 py-3"
                                                autoComplete="new-password"
                                          />
                                    </Form.Item>

                                    <Form.Item
                                          name="confirm"
                                          dependencies={["password"]}
                                          hasFeedback
                                          rules={[
                                                {
                                                      required: true,
                                                      message: "Vui lòng xác nhận lại mật khẩu!",
                                                },
                                                ({ getFieldValue }) => ({
                                                      validator(_, value) {
                                                            if (!value || getFieldValue("password") === value) {
                                                                  return Promise.resolve();
                                                            }
                                                            return Promise.reject(new Error("Mật khẩu không khớp!"));
                                                      },
                                                }),
                                          ]}
                                    >
                                          <Input.Password
                                                size="large"
                                                placeholder="Nhập lại mật khẩu"
                                                className="bg-gray-50 py-3"
                                                autoComplete="new-password"
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
                                                Đặt lại mật khẩu
                                          </Button>
                                    </Form.Item>
                              </Form>
                        </div>
                  </div>
            </div>

      );
};

export default ResetPassword;