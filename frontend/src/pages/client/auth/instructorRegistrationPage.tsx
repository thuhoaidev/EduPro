import {
      Form,
      Input,
      InputNumber,
      Button,
      Upload,
      Card,
      Space,
      Typography,
      Divider,
      message,
      Row,
      Col,
} from 'antd';
import {
      PlusOutlined,
      UploadOutlined,
      DeleteOutlined,
      FileDoneOutlined,
      FileAddOutlined,
      BookOutlined,
      ProfileOutlined,
      PaperClipOutlined,
      FileTextOutlined,
      ArrowLeftOutlined,
} from '@ant-design/icons';
import React, { useState } from 'react';
import { config } from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
const { Title } = Typography;

const InstructorRegistrationPage = () => {
      const [form] = Form.useForm();
      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();

      const onFinish = async (values: any) => {
            console.log("🔍 Dữ liệu form trước khi gửi:", values);

            try {
                  setLoading(true);
                  const formData = new FormData();

                  // Kinh nghiệm
                  formData.append('experience_years', values.experience_years);

                  // Chuyên môn
                  const specializationList = typeof values.specializations === 'string'
                        ? values.specializations.split(',').map((s: string) => s.trim())
                        : values.specializations;
                  specializationList.forEach((spec: string, idx: number) => {
                        formData.append(`specializations[${idx}]`, spec);
                  });

                  // Kinh nghiệm giảng dạy
                  formData.append('teaching_experience.years', values.teaching_experience.years);
                  formData.append('teaching_experience.description', values.teaching_experience.description);

                  // Bằng cấp (metadata + file)
                  values.certificates?.forEach((c: any, index: number) => {
                        formData.append(`certificates[${index}][name]`, c.name);
                        formData.append(`certificates[${index}][major]`, c.major);
                        formData.append(`certificates[${index}][issuer]`, c.issuer);
                        formData.append(`certificates[${index}][year]`, c.year);
                        formData.append(`certificate_files`, c.file.file.originFileObj); // Giữ nguyên name này để match multer.fields
                  });

                  // CV (tùy chọn)
                  if (values.cv_file?.fileList?.[0]) {
                        formData.append('cv_file', values.cv_file.fileList[0].originFileObj);
                  }

                  // Video demo (tùy chọn)
                  if (values.demo_video?.fileList?.[0]) {
                        formData.append('demo_video', values.demo_video.fileList[0].originFileObj);
                  }

                  // Tài liệu khác (metadata + file)
                  values.other_documents?.forEach((doc: any, index: number) => {
                        formData.append(`other_documents[${index}][name]`, doc.name);
                        formData.append(`other_documents[${index}][description]`, doc.description || '');
                        formData.append(`other_documents`, doc.file.file.originFileObj);
                  });

                  // Gửi request
                  const response = await config.post('/users/instructor-profile/submit', formData);
                  const result = response.data;

                  if (result.success) {
                        message.success(result.message);
                        form.resetFields();
                        navigate('/');
                  } else {
                        message.error(result.message);
                  }
            } catch (err: any) {
                  console.error('❌ Error submitting form:', err);
                  message.error('Đã xảy ra lỗi khi gửi hồ sơ');
            } finally {
                  setLoading(false);
            }
      };


      return (
            <div className="max-w-5xl mx-auto px-4 py-10">
                  <Card className="rounded-xl shadow-md border border-gray-100">
                        <Title level={3} className="text-center">
                              <FileDoneOutlined className="text-blue-500 mr-2" />
                              Đăng ký trở thành Giảng viên
                        </Title>

                        <Form layout="vertical" form={form} onFinish={onFinish} scrollToFirstError>
                              {/* EXPERIENCE */}
                              <Divider orientation="left">
                                    <ProfileOutlined className="mr-2 text-blue-500" />
                                    Kinh nghiệm
                              </Divider>
                              <Row gutter={16}>
                                    <Col span={12}>
                                          <Form.Item
                                                name="experience_years"
                                                label="Số năm kinh nghiệm"
                                                rules={[{ required: true, message: 'Vui lòng nhập số năm kinh nghiệm' }]}
                                          >
                                                <InputNumber min={0} className="w-full" placeholder="VD: 5" />
                                          </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                          <Form.Item
                                                name="specializations"
                                                label="Chuyên môn"
                                                rules={[{ required: true, message: 'Vui lòng nhập chuyên môn' }]}
                                          >
                                                <Input placeholder="VD: Toán, Lập trình, Kỹ năng mềm..." />
                                          </Form.Item>
                                    </Col>
                              </Row>

                              {/* TEACHING */}
                              <Divider orientation="left">
                                    <BookOutlined className="mr-2 text-green-500" />
                                    Kinh nghiệm giảng dạy
                              </Divider>
                              <Row gutter={16}>
                                    <Col span={8}>
                                          <Form.Item
                                                label="Số năm giảng dạy"
                                                name={['teaching_experience', 'years']}
                                                rules={[{ required: true, message: 'Vui lòng nhập số năm' }]}
                                          >
                                                <InputNumber min={0} className="w-full" />
                                          </Form.Item>
                                    </Col>
                                    <Col span={16}>
                                          <Form.Item
                                                label="Mô tả chi tiết"
                                                name={['teaching_experience', 'description']}
                                                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                                          >
                                                <Input.TextArea rows={3} />
                                          </Form.Item>
                                    </Col>
                              </Row>

                              {/* CERTIFICATES */}
                              <Divider orientation="left">
                                    <FileTextOutlined className="mr-2 text-purple-500" />
                                    Bằng cấp / Chứng chỉ
                              </Divider>
                              <Form.List name="certificates" rules={[{ required: true }]}>
                                    {(fields, { add, remove }) => (
                                          <div className="space-y-4">
                                                {fields.map(({ key, name }) => (
                                                      <Card
                                                            key={key}
                                                            type="inner"
                                                            title={`Bằng cấp #${key + 1}`}
                                                            className="shadow-sm rounded-lg border border-gray-100"
                                                            extra={
                                                                  <Button
                                                                        type="text"
                                                                        icon={<DeleteOutlined />}
                                                                        danger
                                                                        onClick={() => remove(name)}
                                                                  >
                                                                        Xóa
                                                                  </Button>
                                                            }
                                                      >
                                                            <Row gutter={16}>
                                                                  <Col span={12}>
                                                                        <Form.Item name={[name, 'name']} label="Tên bằng cấp" rules={[{ required: true }]}>
                                                                              <Input />
                                                                        </Form.Item>
                                                                  </Col>
                                                                  <Col span={12}>
                                                                        <Form.Item name={[name, 'major']} label="Chuyên ngành" rules={[{ required: true }]}>
                                                                              <Input />
                                                                        </Form.Item>
                                                                  </Col>
                                                                  <Col span={12}>
                                                                        <Form.Item name={[name, 'issuer']} label="Nơi cấp" rules={[{ required: true }]}>
                                                                              <Input />
                                                                        </Form.Item>
                                                                  </Col>
                                                                  <Col span={6}>
                                                                        <Form.Item name={[name, 'year']} label="Năm cấp" rules={[{ required: true }]}>
                                                                              <InputNumber min={1900} max={2100} className="w-full" />
                                                                        </Form.Item>
                                                                  </Col>
                                                                  <Col span={6}>
                                                                        <Form.Item name={[name, 'file']} label="Tệp scan" rules={[{ required: true }]}>
                                                                              <Upload beforeUpload={() => false} maxCount={1}>
                                                                                    <Button icon={<UploadOutlined />}>Tải lên</Button>
                                                                              </Upload>
                                                                        </Form.Item>
                                                                  </Col>
                                                            </Row>
                                                      </Card>
                                                ))}
                                                <Button icon={<PlusOutlined />} onClick={() => add()} block>
                                                      Thêm bằng cấp
                                                </Button>
                                          </div>
                                    )}
                              </Form.List>

                              {/* OPTIONAL FILES */}
                              <Divider orientation="left">
                                    <FileAddOutlined className="mr-2 text-orange-500" />
                                    Tệp tùy chọn
                              </Divider>
                              <Row gutter={16}>
                                    <Col span={12}>
                                          <Form.Item name="cv_file" label="CV (PDF)">
                                                <Upload beforeUpload={() => false} maxCount={1}>
                                                      <Button icon={<UploadOutlined />}>Tải CV lên</Button>
                                                </Upload>
                                          </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                          <Form.Item name="demo_video" label="Video demo giảng dạy">
                                                <Upload beforeUpload={() => false} maxCount={1}>
                                                      <Button icon={<UploadOutlined />}>Tải video lên</Button>
                                                </Upload>
                                          </Form.Item>
                                    </Col>
                              </Row>

                              {/* OTHER DOCUMENTS */}
                              <Divider orientation="left">
                                    <PaperClipOutlined className="mr-2 text-red-500" />
                                    Tài liệu khác
                              </Divider>
                              <Form.List name="other_documents">
                                    {(fields, { add, remove }) => (
                                          <div className="space-y-4">
                                                {fields.map(({ key, name }) => (
                                                      <Card
                                                            key={key}
                                                            type="inner"
                                                            title={`Tài liệu #${key + 1}`}
                                                            className="shadow-sm rounded-lg"
                                                            extra={
                                                                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)}>
                                                                        Xóa
                                                                  </Button>
                                                            }
                                                      >
                                                            <Form.Item name={[name, 'name']} label="Tên tài liệu" rules={[{ required: true }]}>
                                                                  <Input />
                                                            </Form.Item>
                                                            <Form.Item name={[name, 'description']} label="Mô tả">
                                                                  <Input.TextArea rows={2} />
                                                            </Form.Item>
                                                            <Form.Item name={[name, 'file']} label="Tệp đính kèm" rules={[{ required: true }]}>
                                                                  <Upload beforeUpload={() => false} maxCount={1}>
                                                                        <Button icon={<UploadOutlined />}>Tải lên</Button>
                                                                  </Upload>
                                                            </Form.Item>
                                                      </Card>
                                                ))}
                                                <Button icon={<PlusOutlined />} onClick={() => add()} block>
                                                      Thêm tài liệu
                                                </Button>
                                          </div>
                                    )}
                              </Form.List>

                              {/* Submit */}
                              <Divider />
                              <Form.Item>
                                    <Row gutter={16} justify="space-between">
                                          <Col>
                                                <Button
                                                      icon={<ArrowLeftOutlined />}
                                                      onClick={() => navigate(-1)} // 🔙 quay lại trang trước
                                                >
                                                      Quay lại
                                                </Button>
                                          </Col>
                                          <Col>
                                                <Button type="primary" htmlType="submit" loading={loading} size="large">
                                                      <FileDoneOutlined className="mr-2" />
                                                      Nộp hồ sơ giảng viên
                                                </Button>
                                          </Col>
                                    </Row>
                              </Form.Item>
                        </Form>
                  </Card>
            </div>
      );
};

export default InstructorRegistrationPage;
