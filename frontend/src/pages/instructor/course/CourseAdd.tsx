import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Card,
  Divider,
  Space,
  message,
  Steps,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Step } = Steps;

const options = {
  levels: [
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
  ],
  languages: [
    { label: "Tiếng Việt", value: "vi" },
    { label: "English", value: "en" },
  ],
  statuses: [
    { label: "Nháp", value: "draft" },
    { label: "Công khai", value: "published" },
  ],
  categories: [
    { label: "Frontend", value: 1 },
    { label: "Backend", value: 2 },
    { label: "UI/UX", value: 3 },
  ],
};

const CreateCourse: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  const onFinish = (values: any) => {
    console.log("Course Data:", values);
    message.success("Tạo khóa học thành công!");
  };

  const next = () => setCurrentStep((prev) => prev + 1);
  const prev = () => setCurrentStep((prev) => prev - 1);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card title="Tạo khóa học mới" className="w-full max-w-5xl shadow-md">
        <Steps current={currentStep} className="mb-6">
          <Step title="Thông tin cơ bản" />
          <Step title="Chương trình học" />
        </Steps>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          {currentStep === 0 && (
            <>
              <Form.Item
                label="Tiêu đề khóa học"
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
              >
                <Input placeholder="VD: React căn bản" size="large" />
              </Form.Item>
              <Form.Item
                label="Slug"
                name="slug"
                rules={[{ required: true, message: "Vui lòng nhập slug!" }]}
              >
                <Input placeholder="VD: react-can-ban" size="large" />
              </Form.Item>
              <Form.Item
                label="Mô tả"
                name="description"
                rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
              >
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item
                label="Danh mục"
                name="category_id"
                rules={[{ required: true, message: "Chọn danh mục!" }]}
              >
                <Select options={options.categories} placeholder="Chọn danh mục" size="large" />
              </Form.Item>
              <Form.Item label="Ảnh đại diện" name="thumbnail">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                  style={{ width: 200 }}
                >
                  <div style={{ width: 150, height: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <PlusOutlined style={{ fontSize: 24 }} />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
              <Form.Item
                label="Giá gốc"
                name="price"
                rules={[{ required: true, message: "Nhập giá!" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} size="large" />
              </Form.Item>
              <Form.Item label="Giảm giá" name="discount">
                <InputNumber min={0} style={{ width: "100%" }} size="large" />
              </Form.Item>
              <Form.Item
                label="Ngôn ngữ"
                name="language"
                rules={[{ required: true, message: "Chọn ngôn ngữ!" }]}
              >
                <Select options={options.languages} size="large" />
              </Form.Item>
              <Form.Item
                label="Trình độ"
                name="level"
                rules={[{ required: true, message: "Chọn trình độ!" }]}
              >
                <Select options={options.levels} size="large" />
              </Form.Item>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: "Chọn trạng thái!" }]}
              >
                <Select options={options.statuses} size="large" />
              </Form.Item>
              <Divider orientation="left">Yêu cầu trước khóa học</Divider>
              <Form.List name="requirements">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name }) => (
                      <Space key={key} className="w-full mb-2" align="baseline">
                        <Form.Item
                          name={name}
                          className="w-full"
                          rules={[{ required: true, message: "Không được bỏ trống" }]}
                        >
                          <Input placeholder="VD: Biết HTML" />
                        </Form.Item>
                        <Button icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button onClick={() => add()} icon={<PlusOutlined />} block>
                        Thêm yêu cầu
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Divider orientation="left">Chương trình học</Divider>
              <Form.List name="sections">
                {(sectionFields, { add: addSection, remove: removeSection }) => (
                  <>
                    {sectionFields.map(({ key, name }) => (
                      <Card
                        key={key}
                        title={`Chương ${key + 1}`}
                        className="mb-4"
                        extra={
                          <Button danger onClick={() => removeSection(name)} icon={<MinusCircleOutlined />} />
                        }
                      >
                        <Form.Item
                          name={[name, "title"]}
                          label="Tiêu đề chương"
                          rules={[{ required: true, message: "Vui lòng nhập tiêu đề chương!" }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          name={[name, "description"]}
                          label="Mô tả chương"
                          rules={[{ required: true, message: "Vui lòng nhập mô tả chương!" }]}
                        >
                          <TextArea rows={3} />
                        </Form.Item>
                        <Form.List name={[name, "lessons"]}>
                          {(lessonFields, { add: addLesson, remove: removeLesson }) => (
                            <>
                              {lessonFields.map(({ key: lKey, name: lName }) => (
                                <Card
                                  key={lKey}
                                  size="small"
                                  className="mb-4"
                                  title={`Bài học ${lKey + 1}`}
                                  extra={
                                    <Button danger onClick={() => removeLesson(lName)} icon={<MinusCircleOutlined />} />
                                  }
                                >
                                  <Form.Item
                                    name={[lName, "title"]}
                                    label="Tiêu đề bài học"
                                    rules={[{ required: true, message: "Nhập tiêu đề bài học!" }]}
                                  >
                                    <Input />
                                  </Form.Item>
                                  <Form.Item
                                    name={[lName, "video"]}
                                    label="Video bài học"
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                                  >
                                    <Upload beforeUpload={() => false} maxCount={1}>
                                      <Button icon={<UploadOutlined />}>Tải video lên</Button>
                                    </Upload>
                                  </Form.Item>
                                  <Form.Item name={[lName, "is_preview"]} label="Xem trước?">
                                    <Select
                                      options={[
                                        { label: "Có", value: true },
                                        { label: "Không", value: false },
                                      ]}
                                    />
                                  </Form.Item>
                                  <Form.Item label="Quiz">
                                    <Form.List name={[lName, "quiz", "questions"]}>
                                      {(questionFields, { add: addQuestion, remove: removeQuestion }) => (
                                        <>
                                          {questionFields.map(({ key: qKey, name: qName }) => (
                                            <Card
                                              key={qKey}
                                              title={`Câu hỏi ${qKey + 1}`}
                                              className="mb-4"
                                              extra={
                                                <Button danger onClick={() => removeQuestion(qName)} icon={<MinusCircleOutlined />} />
                                              }
                                            >
                                              <Form.Item
                                                name={[qName, "question"]}
                                                label="Nội dung câu hỏi"
                                                rules={[{ required: true, message: "Vui lòng nhập nội dung câu hỏi!" }]}
                                              >
                                                <Input />
                                              </Form.Item>
                                              <Form.List name={[qName, "options"]}>
                                                {(optionFields, { add: addOption, remove: removeOption }) => (
                                                  <>
                                                    {optionFields.map(({ key: oKey, name: oName }) => (
                                                      <Space key={oKey} className="w-full mb-2" align="baseline">
                                                        <Form.Item
                                                          name={oName}
                                                          className="w-full"
                                                          rules={[{ required: true, message: "Không được để trống đáp án!" }]}
                                                        >
                                                          <Input placeholder={`Đáp án ${oKey + 1}`} />
                                                        </Form.Item>
                                                        <Button
                                                          icon={<MinusCircleOutlined />}
                                                          onClick={() => removeOption(oName)}
                                                        />
                                                      </Space>
                                                    ))}
                                                    <Form.Item>
                                                      <Button onClick={() => addOption()} icon={<PlusOutlined />} block>
                                                        Thêm đáp án
                                                      </Button>
                                                    </Form.Item>
                                                  </>
                                                )}
                                              </Form.List>
                                              <Form.Item
                                                name={[qName, "answer"]}
                                                label="Chỉ số đáp án đúng (0, 1, ...)"
                                                rules={[{ required: true, message: "Nhập chỉ số đáp án đúng!" }]}
                                              >
                                                <InputNumber min={0} />
                                              </Form.Item>
                                            </Card>
                                          ))}
                                          <Form.Item>
                                            <Button onClick={() => addQuestion()} icon={<PlusOutlined />} block>
                                              Thêm câu hỏi
                                            </Button>
                                          </Form.Item>
                                        </>
                                      )}
                                    </Form.List>
                                  </Form.Item>
                                </Card>
                              ))}
                              <Form.Item>
                                <Button onClick={() => addLesson()} block icon={<PlusOutlined />}>
                                  Thêm bài học
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button onClick={() => addSection()} block icon={<PlusOutlined />}>
                        Thêm chương
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          )}

          <Form.Item className="text-center mt-6">
            <div className="flex justify-center gap-4 flex-wrap">
              {currentStep > 0 && (
                <Button className="mr-4" onClick={prev}>
                  Quay lại
                </Button>
              )}
              {currentStep < 1 && (
                <Button type="primary" onClick={next}>
                  Tiếp theo
                </Button>
              )}
              {currentStep === 1 && (
                <Button type="primary" htmlType="submit">
                  Tạo khóa học
                </Button>
              )}
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCourse;