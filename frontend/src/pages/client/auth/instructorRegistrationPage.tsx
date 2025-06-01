import React, { useState } from "react";
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
import dayjs from "dayjs";
import { config } from "../../../api/axios";

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
      startDate: string | null;
      endDate: string | null;
      description?: string;
}

interface FormValues {
      fullName: string;
      email: string;
      bio: string;
      expertise: string;
      education: Education[];
      experience: Experience[];
}

export default function InstructorRegistrationPage() {
      const [loading, setLoading] = useState(false);
      const [form] = Form.useForm();

      const onFinish = async (values: FormValues) => {
            // Format dates to ISO string
            const formattedValues = {
                  ...values,
                  education: values.education.map((edu) => ({
                        ...edu,
                        year: edu.year,
                  })),
                  experience: values.experience.map((exp) => ({
                        ...exp,
                        startDate: exp.startDate ? dayjs(exp.startDate).toISOString() : null,
                        endDate: exp.endDate ? dayjs(exp.endDate).toISOString() : null,
                  })),
            };

            try {
                  setLoading(true);
                  const res = await config.post("/auth/instructor/register", formattedValues);
                  if (res.data.success) {
                        message.success(res.data.message);
                        form.resetFields();
                  } else {
                        message.error("Đăng ký thất bại: " + res.data.message);
                  }
            } catch (error) {
                  message.error("Có lỗi xảy ra khi đăng ký");
                  console.error(error);
            } finally {
                  setLoading(false);
            }
      };

      return (
            <Card style={{ maxWidth: 800, margin: "auto", marginTop: 40, padding: 20 }}>
                  {/* <Title level={2} style={{ textAlign: "center" }}> */}
                  <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-green-400 mb-8">
                        Đăng ký làm giảng viên
                  </h2>
                  {/* </Title> */}

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
                              label="Họ và tên"
                              name="fullName"
                              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                        >
                              <Input placeholder="Nguyễn Văn A" />
                        </Form.Item>

                        <Form.Item
                              label="Email"
                              name="email"
                              rules={[
                                    { required: true, message: "Vui lòng nhập email" },
                                    { type: "email", message: "Email không hợp lệ" },
                              ]}
                        >
                              <Input placeholder="email@example.com" />
                        </Form.Item>

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
                                                            <Select placeholder="Chọn bằng cấp">
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
                                                            <DatePicker placeholder="Ngày kết thúc" />
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
                                    size="large"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full !bg-gradient-to-r !from-cyan-500 !to-green-400 !text-white !font-semibold hover:opacity-90 border-none"
                              >
                                    Đăng Ký
                              </Button>
                        </Form.Item>
                  </Form>
            </Card>
      );
}
