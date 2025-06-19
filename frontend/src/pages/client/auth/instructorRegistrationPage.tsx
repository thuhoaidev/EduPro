import React, { useState, useEffect } from "react";
import {
      Form,
      Input,
      Button,
      DatePicker,
      Space,
      Card,
      Typography,
      message,
      Select,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { config } from "../../../api/axios";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { TextArea } = Input;

interface Education {
      degree: string;
      field: string;
      institution: string;
      year: number | null;
      description?: string;
}

interface Experience {
      position: string;
      company: string;
      startDate: Dayjs | null;
      endDate: Dayjs | null;
      description?: string;
}

interface FormValues {
      bio: string;
      expertise: string;
      gender: "Nam" | "Nữ" | "Khác";
      education: Education[];
      experience: Experience[];
}

export default function InstructorRegistrationPage() {
      const [loading, setLoading] = useState(false);
      const [form] = Form.useForm();
      const [alreadyRegistered, setAlreadyRegistered] = useState(false);
      const navigate = useNavigate();

      const onFinish = async (values: FormValues) => {
            console.log("value", values)
            if (alreadyRegistered) {
                  message.warning("Bạn đã đăng ký làm giảng viên.");
                  return;
            }
            // Định dạng dữ liệu gửi lên backend
            const formattedValues = {
                  bio: values.bio,
                  expertise: values.expertise,
                  gender: values.gender,
                  education: values.education
                        .filter((edu) => edu && typeof edu === "object")
                        .map((edu) => ({
                              ...edu,
                              year: Number(edu.year),
                        })),
                  experience: values.experience
                        .filter((exp) => exp && typeof exp === "object")
                        .map((exp) => ({
                              ...exp,
                              startDate: exp.startDate ? dayjs(exp.startDate).toISOString() : null,
                              endDate: exp.endDate ? dayjs(exp.endDate).toISOString() : null,
                        })),
            };
            console.log("Formatted values:", formattedValues);

            try {
                  setLoading(true);
                  const res = await config.post("/auth/register/instructor", formattedValues);
                  console.log("Phản hồi từ server:", res.data);

                  if (res.data.success) {
                        message.success("Đăng ký thành công! Vui lòng đợi admin duyệt.");
                        form.resetFields();
                        setAlreadyRegistered(true);
                  } else {
                        message.error("Đăng ký thất bại: " + res.data.message);
                  }
            } catch (error: any) {
                  console.log("API error:", error.response?.data);
                  message.error(error.response?.data?.message || "Có lỗi xảy ra khi đăng ký.");
                  // setTimeout(() => {
                  //       navigate("/");
                  // }, 2000);
            } finally {
                  setLoading(false);
            }
      };

      // Hàm kiểm tra xem người dùng đã đăng ký làm giảng viên chưa
      const checkAlreadyRegistered = async () => {
            try {
                  const res = await config.get("/auth/me/instructor");
                  console.log("API check instructor status:", res.data);
                  const hasRegistered = res.data?.has_registered_instructor;
                  console.log("has_registered_instructor:", hasRegistered);

                  // Sử dụng has_registered_instructor để kiểm tra
                  if (res.data?.has_registered_instructor) {
                        setAlreadyRegistered(true);
                  }
            } catch (err) {
                  console.error("Lỗi khi kiểm tra trạng thái giảng viên:", err);
            }
      };

      useEffect(() => {
            checkAlreadyRegistered();
      }, []);

      // Tự động chuyển hướng về trang chủ sau 2 giây nếu đã đăng ký
      // useEffect(() => {
      //       if (alreadyRegistered) {
      //             const timer = setTimeout(() => {
      //                   navigate("/");
      //             }, 2000);
      //             return () => clearTimeout(timer);
      //       }
      // }, [alreadyRegistered, navigate]);

      return (
            <Card style={{ maxWidth: 800, margin: "auto", marginTop: 40, padding: 20 }}>
                  {!alreadyRegistered && (
                        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-green-400 mb-8">
                              Đăng ký làm giảng viên
                        </h2>
                  )}

                  {alreadyRegistered ? (
                        <div
                              className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-green-400 mb-8"
                              style={{
                                    marginBottom: 16,
                                    color: "red",
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    minHeight: 600,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                              }}
                        >
                              Bạn đã đăng ký làm giảng viên rồi. Đang chuyển về trang chủ...
                        </div>
                  ) : (
                        <Form
                              form={form}
                              layout="vertical"
                              onFinish={onFinish}
                              initialValues={{
                                    education: [{}],
                                    experience: [{}],
                              }}
                        >
                              <Form.Item
                                    label="Tiểu sử"
                                    name="bio"
                                    rules={[{ required: true, message: "Vui lòng nhập tiểu sử" }]}
                              >
                                    <TextArea rows={3} placeholder="Giảng viên có kinh nghiệm..." />
                              </Form.Item>

                              <Form.Item
                                    label="Chuyên môn"
                                    name="expertise"
                                    rules={[{ required: true, message: "Vui lòng nhập chuyên môn" }]}
                              >
                                    <TextArea rows={2} placeholder="Lập trình Web, Mobile, AI..." />
                              </Form.Item>

                              <Form.Item
                                    label="Giới tính"
                                    name="gender"
                                    rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                              >
                                    <Select placeholder="Chọn giới tính">
                                          <Select.Option value="Nam">Nam</Select.Option>
                                          <Select.Option value="Nữ">Nữ</Select.Option>
                                          <Select.Option value="Khác">Khác</Select.Option>
                                    </Select>
                              </Form.Item>

                              {/* Education */}
                              <Form.List name="education">
                                    {(fields, { add, remove }) => (
                                          <>
                                                <Title level={4}>Bằng cấp</Title>
                                                {fields.map(({ key, name, ...restField }) => (
                                                      <Space
                                                            key={key}
                                                            align="start"
                                                            style={{ display: "flex", marginBottom: 8 }}
                                                      >
                                                            <Form.Item
                                                                  {...restField}
                                                                  name={[name, "degree"]}
                                                                  rules={[{ required: true, message: "Chọn bằng cấp" }]}
                                                            >
                                                                  <Select placeholder="Chọn bằng cấp" style={{ width: 130 }}>
                                                                        <Select.Option value="Cử nhân">Cử nhân</Select.Option>
                                                                        <Select.Option value="Thạc sĩ">Thạc sĩ</Select.Option>
                                                                        <Select.Option value="Tiến sĩ">Tiến sĩ</Select.Option>
                                                                        <Select.Option value="Khác">Khác</Select.Option>
                                                                  </Select>
                                                            </Form.Item>

                                                            <Form.Item
                                                                  {...restField}
                                                                  name={[name, "field"]}
                                                                  rules={[{ required: true, message: "Nhập chuyên ngành" }]}
                                                            >
                                                                  <Input placeholder="Công nghệ thông tin" />
                                                            </Form.Item>

                                                            <Form.Item
                                                                  {...restField}
                                                                  name={[name, "institution"]}
                                                                  rules={[{ required: true, message: "Nhập tên trường" }]}
                                                            >
                                                                  <Input placeholder="Đại học XYZ" />
                                                            </Form.Item>

                                                            <Form.Item
                                                                  {...restField}
                                                                  name={[name, "year"]}
                                                                  rules={[{ required: true, message: "Nhập năm tốt nghiệp" }]}
                                                            >
                                                                  <Input
                                                                        type="number"
                                                                        min={1900}
                                                                        max={new Date().getFullYear()}
                                                                        placeholder="2020"
                                                                        style={{ width: 90 }}
                                                                  />
                                                            </Form.Item>

                                                            <Form.Item {...restField} name={[name, "description"]}>
                                                                  <Input placeholder="Mô tả thêm" />
                                                            </Form.Item>

                                                            <MinusCircleOutlined
                                                                  onClick={() => remove(name)}
                                                                  style={{ color: "red", marginTop: 8 }}
                                                            />
                                                      </Space>
                                                ))}

                                                <Form.Item>
                                                      <Button
                                                            type="dashed"
                                                            onClick={() => add()}
                                                            block
                                                            icon={<PlusOutlined />}
                                                      >
                                                            Thêm bằng cấp
                                                      </Button>
                                                </Form.Item>
                                          </>
                                    )}
                              </Form.List>

                              {/* Experience */}
                              <Form.List name="experience">
                                    {(fields, { add, remove }) => (
                                          <>
                                                <Title level={4}>Kinh nghiệm làm việc</Title>
                                                {fields.map(({ key, name, ...restField }) => (
                                                      <Space
                                                            key={key}
                                                            align="start"
                                                            style={{ display: "flex", marginBottom: 8 }}
                                                      >
                                                            <Form.Item
                                                                  {...restField}
                                                                  name={[name, "position"]}
                                                                  rules={[{ required: true, message: "Nhập vị trí công việc" }]}
                                                            >
                                                                  <Input placeholder="Giảng viên" />
                                                            </Form.Item>

                                                            <Form.Item
                                                                  {...restField}
                                                                  name={[name, "company"]}
                                                                  rules={[{ required: true, message: "Nhập công ty / trường" }]}
                                                            >
                                                                  <Input placeholder="Trường ABC" />
                                                            </Form.Item>

                                                            <Form.Item
                                                                  {...restField}
                                                                  name={[name, "startDate"]}
                                                                  rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
                                                            >
                                                                  <DatePicker placeholder="Ngày bắt đầu" />
                                                            </Form.Item>

                                                            <Form.Item {...restField} name={[name, "endDate"]}>
                                                                  <DatePicker placeholder="Ngày kết thúc (nếu có)" />
                                                            </Form.Item>

                                                            <Form.Item {...restField} name={[name, "description"]}>
                                                                  <Input placeholder="Mô tả thêm" />
                                                            </Form.Item>

                                                            <MinusCircleOutlined
                                                                  onClick={() => remove(name)}
                                                                  style={{ color: "red", marginTop: 8 }}
                                                            />
                                                      </Space>
                                                ))}

                                                <Form.Item>
                                                      <Button
                                                            type="dashed"
                                                            onClick={() => add()}
                                                            block
                                                            icon={<PlusOutlined />}
                                                      >
                                                            Thêm kinh nghiệm
                                                      </Button>
                                                </Form.Item>
                                          </>
                                    )}
                              </Form.List>

                              <Form.Item>
                                    <Button
                                          type="primary"
                                          htmlType="submit"
                                          loading={loading}
                                          disabled={alreadyRegistered}
                                          block
                                          size="large"
                                    >
                                          Đăng ký
                                    </Button>
                              </Form.Item>
                        </Form>
                  )}
            </Card>
      );
}
