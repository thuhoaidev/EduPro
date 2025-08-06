import React, { useState, useEffect } from "react";
import {
      Form,
      Input,
      Select,
      InputNumber,
      Button,
      Upload,
      Card,
      Divider,
      Row,
      Col,
      Space,
      message,
      Steps,
      Collapse,
      Typography,
      Tag,
      List,
      Avatar,
      Progress,
      Modal,
      Descriptions,
      Badge,
      Radio,
      Checkbox,
} from "antd";
import {
      PlusOutlined,
      MinusCircleOutlined,
      BookOutlined,
      VideoCameraOutlined,
      FileTextOutlined,
      PlayCircleOutlined,
      EditOutlined,
      EyeOutlined,
      CheckCircleOutlined,
      ArrowLeftOutlined,
      ArrowRightOutlined,
      SaveOutlined,
      UploadOutlined,
      QuestionCircleOutlined,
      ClockCircleOutlined,
      UserOutlined,
      DollarOutlined,
      TagOutlined,
      InfoCircleOutlined,
      FileImageOutlined,
      SoundOutlined,
      CheckOutlined,
      CloseOutlined,
      DeleteOutlined,
} from "@ant-design/icons";
import { courseService } from '../../../services/apiService';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../../services/categoryService';
import type { Category } from '../../../interfaces/Category.interface';

const { TextArea } = Input;
const { Step } = Steps;
const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

const levels = [
      { label: "Người mới bắt đầu", value: "beginner" },
      { label: "Trung cấp", value: "intermediate" },
      { label: "Nâng cao", value: "advanced" },
];

const languages = [
      { label: "Tiếng Việt", value: "vi" },
      { label: "Tiếng Anh", value: "en" },
];

interface QuizQuestion {
      question: string;
      options: string[];
      correctIndex: number;
}

interface QuizData {
      questions: QuizQuestion[];
}

interface CourseFormData {
      title: string;
      description: string;
      category: string;
      level: string;
      language: string;
      price: number;
      discountType?: 'amount' | 'percentage';
      discountAmount?: number;
      discountPercentage?: number;
      requirements: string[];
      sections: Array<{
            title: string;
            lessons: Array<{
                  title: string;
                  video?: {
                        file: File;
                        duration?: number;
                  };
                  quiz?: QuizData;
            }>;
      }>;
      thumbnail?: Array<{
            originFileObj: File;
            uid: string;
            name: string;
            status: string;
            url?: string;
      }>;
}

interface StepData {
      basicInfo: Partial<CourseFormData>;
      courseDetails: Partial<CourseFormData>;
      preview: Partial<CourseFormData>;
}

const MyCourseAdd: React.FC = () => {
      const [form] = Form.useForm();
      const navigate = useNavigate();
      const [currentStep, setCurrentStep] = useState(0);
      const [loading, setLoading] = useState(false);
      const [categories, setCategories] = useState<Category[]>([]);
      const [stepData, setStepData] = useState<StepData>({
            basicInfo: {},
            courseDetails: {},
            preview: {},
      });
      const [quizStorage, setQuizStorage] = useState<Record<string, QuizData>>({});
      const [quizModalVisible, setQuizModalVisible] = useState(false);
      const [currentQuizSection, setCurrentQuizSection] = useState(0);
      const [currentQuizLesson, setCurrentQuizLesson] = useState(0);
      const [quizForm] = Form.useForm();

      // Khởi tạo giá trị mặc định cho form
      useEffect(() => {
            // Đảm bảo form đã được khởi tạo
            if (form) {
                  console.log('Initializing form with default values');
                  form.setFieldsValue({
                        requirements: [''],
                        sections: [
                              {
                                    title: '',
                                    lessons: [
                                          { title: '', video: [], quiz: undefined }
                                    ]
                              }
                        ]
                  });
            }
      }, [form]);

      // Fetch categories
      useEffect(() => {
            const fetchCategories = async () => {
                  try {
                        const response = await getAllCategories();
                        setCategories(response.data);
                  } catch (error) {
                        console.error('Lỗi khi tải danh mục:', error);
                        message.error('Không thể tải danh mục khóa học');
                  }
            };

            fetchCategories();
      }, []);

      // Quiz storage functions
      const getQuizKey = (sectionIndex: number, lessonIndex: number) => {
            return `quiz_${sectionIndex}_${lessonIndex}`;
      };

      const getQuizFromStorage = (sectionIndex: number, lessonIndex: number): QuizData | undefined => {
            const key = getQuizKey(sectionIndex, lessonIndex);
            return quizStorage[key];
      };

      const handleStepChange = (step: number) => {
            // Lưu dữ liệu hiện tại trước khi chuyển step
            const currentStepValues = form.getFieldsValue();
            const updatedStepData = {
                  ...stepData,
                  [currentStep === 0 ? 'basicInfo' : currentStep === 1 ? 'courseDetails' : 'preview']: currentStepValues
            };
            setStepData(updatedStepData);

            // Set new step
            setCurrentStep(step);

            // Load data for the new step
            form.setFieldsValue({
                  ...(step === 0 ? updatedStepData.basicInfo : step === 1 ? updatedStepData.courseDetails : updatedStepData.preview)
            });
      };

      // Quiz modal functions
      const openQuizModal = (sectionIndex: number, lessonIndex: number) => {
            setCurrentQuizSection(sectionIndex);
            setCurrentQuizLesson(lessonIndex);

            const existingQuiz = getQuizFromStorage(sectionIndex, lessonIndex);
            if (existingQuiz) {
                  quizForm.setFieldsValue(existingQuiz);
            } else {
                  quizForm.resetFields();
            }

            setQuizModalVisible(true);
      };

      const handleQuizSave = () => {
            quizForm.validateFields().then((values) => {
                  const key = getQuizKey(currentQuizSection, currentQuizLesson);
                  setQuizStorage(prev => ({
                        ...prev,
                        [key]: values
                  }));
                  setQuizModalVisible(false);
                  message.success('Đã lưu quiz thành công!');
            }).catch((errorInfo) => {
                  console.log('Quiz validation failed:', errorInfo);
            });
      };

      const addQuizQuestion = () => {
            const currentQuestions = quizForm.getFieldValue('questions') || [];
            quizForm.setFieldValue('questions', [
                  ...currentQuestions,
                  { question: '', options: ['', ''], correctIndex: 0 }
            ]);
      };

      const removeQuizQuestion = (questionIndex: number) => {
            const currentQuestions = quizForm.getFieldValue('questions') || [];
            const newQuestions = currentQuestions.filter((_: any, index: number) => index !== questionIndex);
            quizForm.setFieldValue('questions', newQuestions);
      };

      const addQuizOption = (questionIndex: number) => {
            const currentQuestions = quizForm.getFieldValue('questions') || [];
            const updatedQuestions = [...currentQuestions];
            updatedQuestions[questionIndex].options.push('');
            quizForm.setFieldValue('questions', updatedQuestions);
      };

      const removeQuizOption = (questionIndex: number, optionIndex: number) => {
            const currentQuestions = quizForm.getFieldValue('questions') || [];
            const updatedQuestions = [...currentQuestions];
            updatedQuestions[questionIndex].options.splice(optionIndex, 1);
            quizForm.setFieldValue('questions', updatedQuestions);
      };

      const handleFinish = async () => { // Removed 'values: CourseFormData' parameter
            // The 'values' parameter here only contains fields from the *currently mounted* step (Step 3).
            // Since Step 3 has no input fields, 'values' will likely be empty.
            // We need to aggregate data from all steps stored in 'stepData'.
            try {
                  setLoading(true);

                  // Aggregate all form data from stepData
                  const finalStepData = stepData;
                  const finalValues = {
                        ...finalStepData.basicInfo,
                        ...finalStepData.courseDetails,
                        // No need to spread finalStepData.preview as it contains no input fields
                  } as CourseFormData;

                  console.log('Final values before submit (aggregated):', finalValues);

                  // Validate required fields
                  if (
                        !finalValues.title ||
                        !finalValues.description ||
                        finalValues.category == null || finalValues.category === '' ||
                        finalValues.level == null || finalValues.level === '' ||
                        finalValues.language == null || finalValues.language === '' ||
                        finalValues.price === undefined || finalValues.price === null
                  ) {
                        message.error('Vui lòng điền đầy đủ thông tin bắt buộc ở các bước!');
                        setLoading(false); // Important to set loading to false on validation error
                        return;
                  }

                  // Validate sections and lessons
                  if (!finalValues.sections || !Array.isArray(finalValues.sections) || finalValues.sections.length === 0) {
                        message.error('Vui lòng tạo ít nhất một chương học!');
                        setLoading(false); // Important to set loading to false on validation error
                        return;
                  }

                  // Kiểm tra từng section có lessons không
                  for (let i = 0; i < finalValues.sections.length; i++) {
                        const section = finalValues.sections[i];
                        if (!section.title || !section.title.trim()) {
                              message.error(`Vui lòng nhập tiêu đề cho chương ${i + 1} ở bước "Chi tiết khóa học"!`);
                              setLoading(false); // Important to set loading to false on validation error
                              return;
                        }

                        if (!section.lessons || !Array.isArray(section.lessons) || section.lessons.length === 0) {
                              message.error(`Vui lòng tạo ít nhất một bài học cho chương "${section.title}" ở bước "Chi tiết khóa học"!`);
                              setLoading(false); // Important to set loading to false on validation error
                              return;
                        }

                        // Kiểm tra từng lesson có title không
                        for (let j = 0; j < section.lessons.length; j++) {
                              const lesson = finalValues.sections[i].lessons[j];
                              if (!lesson.title || !lesson.title.trim()) {
                                    message.error(`Vui lòng nhập tiêu đề cho bài học ${j + 1} trong chương "${section.title}" ở bước "Chi tiết khóa học"!`);
                                    setLoading(false); // Important to set loading to false on validation error
                                    return;
                              }
                        }
                  }

                  const formData = new FormData();

                  // Thông tin cơ bản
                  formData.append('title', finalValues.title || '');
                  formData.append('description', finalValues.description || '');
                  formData.append('category', finalValues.category || '');
                  formData.append('level', finalValues.level || '');
                  formData.append('language', finalValues.language || '');
                  formData.append('price', (finalValues.price || 0).toString());

                  // Giảm giá (nếu có)
                  if (finalValues.discountType === 'amount' && finalValues.discountAmount && finalValues.discountAmount > 0) {
                        formData.append('discount', finalValues.discountAmount.toString());
                  } else if (finalValues.discountType === 'percentage' && finalValues.discountPercentage && finalValues.discountPercentage > 0) {
                        formData.append('discount', finalValues.discountPercentage.toString());
                  }

                  // Thumbnail (ảnh đại diện)
                  if (finalValues.thumbnail && finalValues.thumbnail.length > 0) {
                        formData.append('avatar', finalValues.thumbnail[0].originFileObj);
                  }

                  // Requirements (yêu cầu trước khóa học)
                  if (Array.isArray(finalValues.requirements)) {
                        finalValues.requirements.forEach((req: string) => {
                              if (req && req.trim()) {
                                    formData.append('requirements', req.trim());
                              }
                        });
                  }

                  // Sections (chương học) với quiz data
                  if (Array.isArray(finalValues.sections)) {
                        finalValues.sections.forEach((section: any, sectionIndex: number) => {
                              if (section && section.title && section.title.trim()) {
                                    const sectionData: any = { title: section.title.trim() };

                                    // Thêm lessons với quiz data
                                    if (section.lessons && Array.isArray(section.lessons)) {
                                          sectionData.lessons = section.lessons.map((lesson: any, lessonIndex: number) => {
                                                const lessonData: any = { title: lesson.title || '' };

                                                // Thêm video data nếu có
                                                if (lesson.video && lesson.video.length > 0 && lesson.video[0].originFileObj) {
                                                      lessonData.video = {
                                                            file: lesson.video[0].originFileObj,
                                                            duration: 0
                                                      };
                                                      const videoFile = lesson.video[0].originFileObj;
                                                      const videoFileName = `video_${sectionIndex}_${lessonIndex}_${videoFile.name}`;
                                                      formData.append('video_files', videoFile, videoFileName);
                                                }

                                                // Thêm quiz data từ storage
                                                const quiz = getQuizFromStorage(sectionIndex, lessonIndex);
                                                if (quiz && quiz.questions && quiz.questions.length > 0) {
                                                      lessonData.quiz = quiz;
                                                }

                                                return lessonData;
                                          });
                                    }

                                    formData.append('sections', JSON.stringify(sectionData));
                              }
                        });
                  }

                  await courseService.createCourse(formData);
                  message.success("Tạo khóa học thành công! Đang chuyển hướng...");
                  form.resetFields();
                  setTimeout(() => navigate('/instructor/courses'), 1000);
            } catch (error: unknown) {
                  console.error('Lỗi khi tạo khóa học:', error);
                  message.error('Có lỗi xảy ra khi tạo khóa học!');
            } finally {
                  setLoading(false);
            }
      };

      const renderStep1 = () => (
            <div style={{ padding: 24 }}>
                  <Title level={3} style={{
                        marginBottom: 32,
                        display: 'flex',
                        alignItems: 'center',
                        color: '#1a1a1a'
                  }}>
                        <InfoCircleOutlined style={{
                              marginRight: 12,
                              color: '#667eea',
                              fontSize: '24px'
                        }} />
                        Thông tin cơ bản khóa học
                  </Title>

                  <Row gutter={[32, 32]}>
                        <Col xs={24} lg={16}>
                              <Card
                                    style={{
                                          borderRadius: '12px',
                                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                          border: '1px solid #f0f0f0'
                                    }}
                              >
                                    <Form.Item
                                          label={
                                                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                      Tiêu đề khóa học
                                                </span>
                                          }
                                          name="title"
                                          rules={[
                                                { required: true, message: "Vui lòng nhập tiêu đề khóa học!" },
                                                { min: 3, message: "Tiêu đề phải có ít nhất 3 ký tự!" },
                                                { max: 200, message: "Tiêu đề không được vượt quá 200 ký tự!" }
                                          ]}
                                    >
                                          <Input
                                                placeholder="Ví dụ: Lập trình React từ A-Z"
                                                size="large"
                                                style={{ borderRadius: '8px' }}
                                          />
                                    </Form.Item>

                                    <Form.Item
                                          label={
                                                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                      Mô tả khóa học
                                                </span>
                                          }
                                          name="description"
                                          rules={[
                                                { required: true, message: "Vui lòng nhập mô tả khóa học!" },
                                                { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" }
                                          ]}
                                    >
                                          <TextArea
                                                rows={4}
                                                placeholder="Mô tả chi tiết về khóa học, nội dung sẽ học, lợi ích..."
                                                style={{ borderRadius: '8px' }}
                                          />
                                    </Form.Item>

                                    <Form.Item
                                          label={
                                                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                      Danh mục khóa học
                                                </span>
                                          }
                                          name="category"
                                          rules={[{ required: true, message: "Vui lòng chọn danh mục khóa học!" }]}
                                    >
                                          <Select
                                                placeholder="Chọn danh mục"
                                                size="large"
                                                showSearch
                                                filterOption={(input, option) =>
                                                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                }
                                                options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
                                                style={{ borderRadius: '8px' }}
                                          />
                                    </Form.Item>

                                    <Row gutter={16}>
                                          <Col span={12}>
                                                <Form.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Cấp độ
                                                            </span>
                                                      }
                                                      name="level"
                                                      rules={[{ required: true, message: "Vui lòng chọn cấp độ!" }]}
                                                >
                                                      <Select
                                                            placeholder="Chọn cấp độ"
                                                            size="large"
                                                            options={levels}
                                                            style={{ borderRadius: '8px' }}
                                                      />
                                                </Form.Item>
                                          </Col>
                                          <Col span={12}>
                                                <Form.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Ngôn ngữ
                                                            </span>
                                                      }
                                                      name="language"
                                                      rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ!" }]}
                                                >
                                                      <Select
                                                            placeholder="Chọn ngôn ngữ"
                                                            size="large"
                                                            options={languages}
                                                            style={{ borderRadius: '8px' }}
                                                      />
                                                </Form.Item>
                                          </Col>
                                    </Row>

                                    <Form.Item
                                          label={
                                                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                      Giá khóa học (VNĐ)
                                                </span>
                                          }
                                          name="price"
                                          rules={[
                                                { required: true, message: "Vui lòng nhập giá khóa học!" },
                                                { type: 'number', min: 0, message: "Giá phải lớn hơn hoặc bằng 0!" }
                                          ]}
                                    >
                                          <InputNumber
                                                placeholder="0"
                                                size="large"
                                                style={{
                                                      width: '100%',
                                                      borderRadius: '8px'
                                                }}
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                          />
                                    </Form.Item>

                                    <Form.Item
                                          label={
                                                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                      Giảm giá
                                                </span>
                                          }
                                          style={{ marginBottom: 8 }}
                                    >
                                          <Row gutter={16}>
                                                <Col span={8}>
                                                      <Form.Item name="discountType" noStyle>
                                                            <Select
                                                                  placeholder="Loại giảm giá"
                                                                  options={[
                                                                        { label: 'Số tiền', value: 'amount' },
                                                                        { label: 'Phần trăm', value: 'percentage' }
                                                                  ]}
                                                                  style={{ borderRadius: '8px' }}
                                                            />
                                                      </Form.Item>
                                                </Col>
                                                <Col span={16}>
                                                      <Form.Item
                                                            noStyle
                                                            shouldUpdate={(prevValues, currentValues) => {
                                                                  return prevValues?.discountType !== currentValues?.discountType;
                                                            }}
                                                      >
                                                            {({ getFieldValue }) => {
                                                                  const discountType = getFieldValue('discountType');
                                                                  return discountType === 'percentage' ? (
                                                                        <Form.Item name="discountPercentage" noStyle>
                                                                              <InputNumber
                                                                                    placeholder="Phần trăm giảm"
                                                                                    style={{
                                                                                          width: '100%',
                                                                                          borderRadius: '8px'
                                                                                    }}
                                                                                    formatter={value => `${value}%`}
                                                                                    parser={value => value!.replace(/[^\d]/g, '')}
                                                                              />
                                                                        </Form.Item>
                                                                  ) : (
                                                                        <Form.Item name="discountAmount" noStyle>
                                                                              <InputNumber
                                                                                    placeholder="Số tiền giảm"
                                                                                    style={{
                                                                                          width: '100%',
                                                                                          borderRadius: '8px'
                                                                                    }}
                                                                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                                                              />
                                                                        </Form.Item>
                                                                  );
                                                            }}
                                                      </Form.Item>
                                                </Col>
                                          </Row>
                                    </Form.Item>
                              </Card>
                        </Col>

                        <Col xs={24} lg={8}>
                              <Card
                                    style={{
                                          borderRadius: '12px',
                                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                          border: '1px solid #f0f0f0',
                                          height: 'fit-content'
                                    }}
                              >
                                    <Form.Item
                                          label={
                                                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                      Ảnh đại diện khóa học
                                                </span>
                                          }
                                          name="thumbnail"
                                          valuePropName="fileList"
                                          getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
                                    >
                                          <Upload
                                                listType="picture-card"
                                                maxCount={1}
                                                beforeUpload={() => false}
                                                accept="image/*"
                                                style={{ borderRadius: '8px' }}
                                          >
                                                <div style={{
                                                      display: 'flex',
                                                      flexDirection: 'column',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      height: '100%'
                                                }}>
                                                      <PlusOutlined style={{ fontSize: '24px', color: '#667eea' }} />
                                                      <div style={{ marginTop: 8, color: '#666' }}>Tải ảnh lên</div>
                                                </div>
                                          </Upload>
                                    </Form.Item>
                              </Card>
                        </Col>
                  </Row>
            </div>
      );

      const renderStep2 = () => (
            <div style={{ padding: 24 }}>
                  <Title level={3} style={{
                        marginBottom: 32,
                        display: 'flex',
                        alignItems: 'center',
                        color: '#1a1a1a'
                  }}>
                        <BookOutlined style={{
                              marginRight: 12,
                              color: '#667eea',
                              fontSize: '24px'
                        }} />
                        Chi tiết khóa học
                  </Title>

                  <Card
                        style={{
                              borderRadius: '12px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                              border: '1px solid #f0f0f0'
                        }}
                  >
                        {/* Yêu cầu đầu vào */}
                        <Divider orientation="left" style={{ margin: '24px 0' }}>
                              <Space>
                                    <BookOutlined style={{ color: '#667eea', fontSize: '18px' }} />
                                    <span style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '16px' }}>
                                          Yêu cầu kiến thức trước khi học
                                    </span>
                              </Space>
                        </Divider>
                        <Form.List name="requirements">
                              {(fields, { add, remove }) => (
                                    <>
                                          {fields.map(({ key, name }, idx) => (
                                                <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 12 }}>
                                                      <Form.Item
                                                            name={name}
                                                            rules={[
                                                                  { required: true, message: "Vui lòng nhập nội dung yêu cầu" },
                                                                  { min: 3, message: "Yêu cầu phải có ít nhất 3 ký tự" }
                                                            ]}
                                                            style={{ flex: 1 }}
                                                            noStyle
                                                      >
                                                            <Input
                                                                  placeholder="Ví dụ: Có kiến thức cơ bản về JavaScript"
                                                                  size="large"
                                                                  style={{ borderRadius: '8px' }}
                                                            />
                                                      </Form.Item>
                                                      <Button
                                                            type="text"
                                                            danger
                                                            icon={<MinusCircleOutlined />}
                                                            onClick={() => remove(name)}
                                                            style={{ borderRadius: '8px' }}
                                                            disabled={fields.length === 1}
                                                      />
                                                </Space>
                                          ))}
                                          <Form.Item>
                                                <Button
                                                      type="dashed"
                                                      onClick={() => add()}
                                                      block
                                                      icon={<PlusOutlined />}
                                                      style={{
                                                            borderRadius: '8px',
                                                            height: '48px',
                                                            borderStyle: 'dashed',
                                                            borderColor: '#667eea',
                                                            color: '#667eea'
                                                      }}
                                                >
                                                      Thêm yêu cầu
                                                </Button>
                                          </Form.Item>
                                    </>
                              )}
                        </Form.List>

                        {/* Chương trình học */}
                        <Divider orientation="left" style={{ margin: '32px 0' }}>
                              <Space>
                                    <BookOutlined style={{ color: '#667eea', fontSize: '18px' }} />
                                    <span style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '16px' }}>
                                          Chương trình học
                                    </span>
                              </Space>
                        </Divider>
                        <Form.List name="sections">
                              {(fields, { add, remove }) => {
                                    console.log('Form.List sections - fields:', fields);
                                    return (
                                          <>
                                                {fields.map(({ key, name }, sectionIndex) => (
                                                      <Collapse
                                                            key={key}
                                                            style={{
                                                                  marginBottom: 16,
                                                                  borderRadius: '8px',
                                                                  border: '1px solid #f0f0f0'
                                                            }}
                                                            expandIconPosition="end"
                                                            defaultActiveKey={[key]}
                                                      >
                                                            <Panel
                                                                  header={
                                                                        <Space>
                                                                              <BookOutlined style={{ color: '#667eea' }} />
                                                                              <span style={{ fontWeight: 600 }}>Chương {sectionIndex + 1}</span>
                                                                              <Form.Item
                                                                                    name={[name, 'title']}
                                                                                    rules={[
                                                                                          { required: true, message: "Vui lòng nhập tiêu đề chương" },
                                                                                          { min: 3, message: "Tiêu đề chương phải có ít nhất 3 ký tự" }
                                                                                    ]}
                                                                                    noStyle
                                                                              >
                                                                                    <Input
                                                                                          placeholder="Tiêu đề chương"
                                                                                          style={{
                                                                                                width: 300,
                                                                                                borderRadius: '8px'
                                                                                          }}
                                                                                          onClick={(e) => e.stopPropagation()}
                                                                                    />
                                                                              </Form.Item>
                                                                        </Space>
                                                                  }
                                                                  key={key}
                                                                  extra={
                                                                        <Space>
                                                                              <Button
                                                                                    type="text"
                                                                                    danger
                                                                                    icon={<MinusCircleOutlined />}
                                                                                    onClick={(e) => {
                                                                                          e.stopPropagation();
                                                                                          remove(name);
                                                                                    }}
                                                                                    style={{ borderRadius: '8px' }}
                                                                                    disabled={fields.length === 1}
                                                                              />
                                                                        </Space>
                                                                  }
                                                            >
                                                                  <Form.List name={[name, 'lessons']}>
                                                                        {(lessonFields, { add: addLesson, remove: removeLesson }) => (
                                                                              <>
                                                                                    {lessonFields.map(({ key: lessonKey, name: lessonName }, lessonIndex) => (
                                                                                          <Card
                                                                                                key={lessonKey}
                                                                                                size="small"
                                                                                                style={{
                                                                                                      marginBottom: 12,
                                                                                                      borderRadius: '8px',
                                                                                                      border: '1px solid #f0f0f0',
                                                                                                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                                                                                }}
                                                                                                title={
                                                                                                      <Space>
                                                                                                            <VideoCameraOutlined style={{ color: '#667eea' }} />
                                                                                                            <span style={{ fontWeight: 600 }}>Bài học {lessonIndex + 1}</span>
                                                                                                            <Form.Item
                                                                                                                  name={[lessonName, 'title']}
                                                                                                                  rules={[
                                                                                                                        { required: true, message: "Vui lòng nhập tiêu đề bài học" },
                                                                                                                        { min: 3, message: "Tiêu đề bài học phải có ít nhất 3 ký tự" }
                                                                                                                  ]}
                                                                                                                  noStyle
                                                                                                            >
                                                                                                                  <Input
                                                                                                                        placeholder="Tiêu đề bài học"
                                                                                                                        style={{
                                                                                                                              width: 250,
                                                                                                                              borderRadius: '8px'
                                                                                                                        }}
                                                                                                                  />
                                                                                                            </Form.Item>
                                                                                                      </Space>
                                                                                                }
                                                                                                extra={
                                                                                                      <Button
                                                                                                            type="text"
                                                                                                            danger
                                                                                                            icon={<MinusCircleOutlined />}
                                                                                                            onClick={() => removeLesson(lessonName)}
                                                                                                            style={{ borderRadius: '8px' }}
                                                                                                            disabled={lessonFields.length === 1}
                                                                                                      />
                                                                                                }
                                                                                          >
                                                                                                <Row gutter={[16, 16]}>
                                                                                                      <Col span={12}>
                                                                                                            <Form.Item
                                                                                                                  label={<span style={{ fontWeight: 600, color: '#1a1a1a' }}>Video bài học</span>}
                                                                                                                  name={[lessonName, 'video']}
                                                                                                                  valuePropName="fileList"
                                                                                                                  getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
                                                                                                            >
                                                                                                                  <Upload
                                                                                                                        maxCount={1}
                                                                                                                        beforeUpload={() => false}
                                                                                                                        accept="video/*"
                                                                                                                  >
                                                                                                                        <Button
                                                                                                                              icon={<UploadOutlined />}
                                                                                                                              style={{
                                                                                                                                    borderRadius: '8px',
                                                                                                                                    borderColor: '#667eea',
                                                                                                                                    color: '#667eea'
                                                                                                                              }}
                                                                                                                        >
                                                                                                                              Tải video lên
                                                                                                                        </Button>
                                                                                                                  </Upload>
                                                                                                            </Form.Item>
                                                                                                      </Col>
                                                                                                      <Col span={12}>
                                                                                                            <Form.Item
                                                                                                                  label={<span style={{ fontWeight: 600, color: '#1a1a1a' }}>Quiz cuối bài</span>}
                                                                                                                  name={[lessonName, 'quiz']}
                                                                                                            >
                                                                                                                  <Space>
                                                                                                                        <Button
                                                                                                                              type="dashed"
                                                                                                                              icon={<QuestionCircleOutlined />}
                                                                                                                              onClick={() => openQuizModal(sectionIndex, lessonIndex)}
                                                                                                                              style={{
                                                                                                                                    borderRadius: '8px',
                                                                                                                                    borderColor: '#667eea',
                                                                                                                                    color: '#667eea'
                                                                                                                              }}
                                                                                                                        >
                                                                                                                              {(() => {
                                                                                                                                    const quiz = getQuizFromStorage(sectionIndex, lessonIndex);
                                                                                                                                    if (quiz && quiz.questions && quiz.questions.length > 0) {
                                                                                                                                          return `Quiz (${quiz.questions.length} câu hỏi)`;
                                                                                                                                    }
                                                                                                                                    return 'Tạo quiz';
                                                                                                                              })()}
                                                                                                                        </Button>
                                                                                                                        {(() => {
                                                                                                                              const quiz = getQuizFromStorage(sectionIndex, lessonIndex);
                                                                                                                              if (quiz && quiz.questions && quiz.questions.length > 0) {
                                                                                                                                    return (
                                                                                                                                          <Button
                                                                                                                                                type="text"
                                                                                                                                                danger
                                                                                                                                                icon={<DeleteOutlined />}
                                                                                                                                                onClick={() => {
                                                                                                                                                      const quizKey = getQuizKey(sectionIndex, lessonIndex);
                                                                                                                                                      setQuizStorage(prev => {
                                                                                                                                                            const newStorage = { ...prev };
                                                                                                                                                            delete newStorage[quizKey];
                                                                                                                                                            return newStorage;
                                                                                                                                                      });
                                                                                                                                                      message.success('Đã xóa quiz');
                                                                                                                                                }}
                                                                                                                                                style={{ borderRadius: '8px' }}
                                                                                                                                          />
                                                                                                                                    );
                                                                                                                              }
                                                                                                                              return null;
                                                                                                                        })()}
                                                                                                                  </Space>
                                                                                                            </Form.Item>
                                                                                                      </Col>
                                                                                                </Row>
                                                                                          </Card>
                                                                                    ))}
                                                                                    <Form.Item>
                                                                                          <Button
                                                                                                type="dashed"
                                                                                                onClick={() => addLesson()}
                                                                                                block
                                                                                                icon={<PlusOutlined />}
                                                                                                style={{
                                                                                                      borderRadius: '8px',
                                                                                                      height: '48px',
                                                                                                      borderStyle: 'dashed',
                                                                                                      borderColor: '#667eea',
                                                                                                      color: '#667eea'
                                                                                                }}
                                                                                          >
                                                                                                Thêm bài học
                                                                                          </Button>
                                                                                    </Form.Item>
                                                                              </>
                                                                        )}
                                                                  </Form.List>
                                                            </Panel>
                                                      </Collapse>
                                                ))}
                                                <Form.Item>
                                                      <Button
                                                            type="dashed"
                                                            onClick={() => {
                                                                  console.log('Adding new section');
                                                                  add();
                                                            }}
                                                            block
                                                            icon={<PlusOutlined />}
                                                            style={{
                                                                  borderRadius: '8px',
                                                                  height: '48px',
                                                                  borderStyle: 'dashed',
                                                                  borderColor: '#667eea',
                                                                  color: '#667eea'
                                                            }}
                                                      >
                                                            Thêm chương
                                                      </Button>
                                                </Form.Item>
                                          </>
                                    );
                              }}
                        </Form.List>

                        {/* Thông tin bổ sung */}
                        <Divider orientation="left" style={{ margin: '32px 0' }}>
                              <Space>
                                    <BookOutlined style={{ color: '#667eea', fontSize: '18px' }} />
                                    <span style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '16px' }}>
                                          Thông tin bổ sung
                                    </span>
                              </Space>
                        </Divider>
                        <div style={{
                              padding: '20px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '8px',
                              border: '1px solid #e9ecef'
                        }}>
                              <p style={{ margin: 0, color: '#666', lineHeight: '1.6' }}>
                                    • Các chương và bài học sẽ được tạo cùng với khóa học.<br />
                                    • Bạn có thể tải video và tạo quiz cho từng bài học.<br />
                                    • Khóa học sẽ được tạo với trạng thái <strong>"Nháp"</strong> mặc định.<br />
                                    • Bạn có thể "Xem trước" khóa học sau khi đã hoàn thiện nội dung.<br />
                                    • <strong>Lưu ý:</strong> Số thứ tự bài học sẽ được đánh lại tự động (1, 2, 3...) dựa trên các bài học có tiêu đề.
                              </p>
                        </div>
                  </Card>
            </div>
      );

      const renderStep3 = () => {
            // Lấy dữ liệu từ form hiện tại và stepData
            const currentFormValues = form.getFieldsValue();
            const displayValues = {
                  ...stepData.basicInfo,
                  ...stepData.courseDetails,
                  ...currentFormValues
            };

            // Đảm bảo sections được lấy từ stepData nếu có
            if (!displayValues.sections && stepData.courseDetails?.sections) {
                  displayValues.sections = stepData.courseDetails.sections;
            }

            // Tính toán giá sau giảm
            const calculateFinalPrice = () => {
                  const originalPrice = displayValues.price || 0;
                  const discountType = displayValues.discountType;

                  if (discountType === 'amount' && displayValues.discountAmount) {
                        return Math.max(0, originalPrice - displayValues.discountAmount);
                  } else if (discountType === 'percentage' && displayValues.discountPercentage) {
                        const discountAmount = (originalPrice * displayValues.discountPercentage) / 100;
                        return Math.max(0, originalPrice - discountAmount);
                  }

                  return originalPrice;
            };

            const finalPrice = calculateFinalPrice();

            console.log('Step 3 display values:', displayValues);

            return (
                  <div style={{ padding: 24 }}>
                        <Title level={3} style={{
                              marginBottom: 32,
                              display: 'flex',
                              alignItems: 'center',
                              color: '#1a1a1a'
                        }}>
                              <EyeOutlined style={{
                                    marginRight: 12,
                                    color: '#667eea',
                                    fontSize: '24px'
                              }} />
                              Xem trước và xác nhận
                        </Title>

                        <Row gutter={[32, 32]}>
                              <Col xs={24} lg={16}>
                                    <Card
                                          style={{
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                border: '1px solid #f0f0f0'
                                          }}
                                    >
                                          <Descriptions
                                                title={
                                                      <span style={{
                                                            fontWeight: 600,
                                                            color: '#1a1a1a',
                                                            fontSize: '18px'
                                                      }}>
                                                            Thông tin cơ bản
                                                      </span>
                                                }
                                                bordered
                                                column={1}
                                                size="middle"
                                          >
                                                <Descriptions.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Tiêu đề
                                                            </span>
                                                      }
                                                      span={3}
                                                >
                                                      <span style={{ color: displayValues.title ? '#1a1a1a' : '#999' }}>
                                                            {displayValues.title || 'Chưa nhập'}
                                                      </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Mô tả
                                                            </span>
                                                      }
                                                      span={3}
                                                >
                                                      <span style={{ color: displayValues.description ? '#1a1a1a' : '#999' }}>
                                                            {displayValues.description || 'Chưa nhập'}
                                                      </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Danh mục
                                                            </span>
                                                      }
                                                >
                                                      <span style={{ color: displayValues.category ? '#1a1a1a' : '#999' }}>
                                                            {categories.find(cat => cat._id === displayValues.category)?.name || 'Chưa chọn'}
                                                      </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Cấp độ
                                                            </span>
                                                      }
                                                >
                                                      <span style={{ color: displayValues.level ? '#1a1a1a' : '#999' }}>
                                                            {levels.find(level => level.value === displayValues.level)?.label || 'Chưa chọn'}
                                                      </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Ngôn ngữ
                                                            </span>
                                                      }
                                                >
                                                      <span style={{ color: displayValues.language ? '#1a1a1a' : '#999' }}>
                                                            {languages.find(lang => lang.value === displayValues.language)?.label || 'Chưa chọn'}
                                                      </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Giá gốc
                                                            </span>
                                                      }
                                                >
                                                      <span style={{
                                                            color: displayValues.price ? '#1a1a1a' : '#999',
                                                            fontWeight: displayValues.price ? 600 : 400
                                                      }}>
                                                            {displayValues.price ? `${displayValues.price.toLocaleString()} VNĐ` : 'Chưa nhập'}
                                                      </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Giảm giá
                                                            </span>
                                                      }
                                                >
                                                      <span style={{ color: '#1a1a1a' }}>
                                                            {(() => {
                                                                  const discountType = displayValues.discountType;
                                                                  if (discountType === 'amount' && displayValues.discountAmount) {
                                                                        return `${displayValues.discountAmount.toLocaleString()} VNĐ`;
                                                                  } else if (discountType === 'percentage' && displayValues.discountPercentage) {
                                                                        return `${displayValues.discountPercentage}%`;
                                                                  }
                                                                  return 'Không có';
                                                            })()}
                                                      </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Giá sau giảm
                                                            </span>
                                                      }
                                                >
                                                      <span style={{
                                                            color: finalPrice ? '#52c41a' : '#999',
                                                            fontWeight: finalPrice ? 600 : 400
                                                      }}>
                                                            {finalPrice ? `${finalPrice.toLocaleString()} VNĐ` : 'Chưa nhập'}
                                                      </span>
                                                </Descriptions.Item>
                                          </Descriptions>

                                          {displayValues.requirements && displayValues.requirements.length > 0 && (
                                                <>
                                                      <Divider style={{ margin: '32px 0' }} />
                                                      <Descriptions
                                                            title={
                                                                  <span style={{
                                                                        fontWeight: 600,
                                                                        color: '#1a1a1a',
                                                                        fontSize: '18px'
                                                                  }}>
                                                                        Yêu cầu trước khi học
                                                                  </span>
                                                            }
                                                            bordered
                                                            column={1}
                                                            size="middle"
                                                      >
                                                            {displayValues.requirements.map((req: string, index: number) => (
                                                                  <Descriptions.Item
                                                                        key={index}
                                                                        label={
                                                                              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                                    Yêu cầu {index + 1}
                                                                              </span>
                                                                        }
                                                                        span={3}
                                                                  >
                                                                        <span style={{ color: '#1a1a1a' }}>{req}</span>
                                                                  </Descriptions.Item>
                                                            ))}
                                                      </Descriptions>
                                                </>
                                          )}

                                          {displayValues.sections && displayValues.sections.length > 0 && (
                                                <>
                                                      <Divider style={{ margin: '32px 0' }} />
                                                      <Descriptions
                                                            title={
                                                                  <span style={{
                                                                        fontWeight: 600,
                                                                        color: '#1a1a1a',
                                                                        fontSize: '18px'
                                                                  }}>
                                                                        Chương trình học
                                                                  </span>
                                                            }
                                                            bordered
                                                            column={1}
                                                            size="middle"
                                                      >
                                                            {displayValues.sections
                                                                  .filter((section: any) => section && section.title && section.title.trim())
                                                                  .map((section: any, sectionIndex: number) => (
                                                                        <Descriptions.Item
                                                                              key={sectionIndex}
                                                                              label={
                                                                                    <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                                          Chương {sectionIndex + 1}
                                                                                    </span>
                                                                              }
                                                                              span={3}
                                                                        >
                                                                              <div>
                                                                                    <Text strong style={{ color: '#1a1a1a', fontSize: '16px' }}>
                                                                                          {section.title}
                                                                                    </Text>
                                                                                    {section.lessons && Array.isArray(section.lessons) && (
                                                                                          <List
                                                                                                size="small"
                                                                                                style={{ marginTop: 12 }}
                                                                                                dataSource={section.lessons.filter((lesson: any) => lesson && lesson.title && lesson.title.trim())}
                                                                                                renderItem={(lesson: any, lessonIndex: number) => (
                                                                                                      <List.Item style={{ padding: '8px 0' }}>
                                                                                                            <Space>
                                                                                                                  <Text style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                                                                        Bài {lessonIndex + 1}:
                                                                                                                  </Text>
                                                                                                                  <Text style={{ color: '#1a1a1a' }}>
                                                                                                                        {lesson.title}
                                                                                                                  </Text>
                                                                                                                  {lesson.video && lesson.video.length > 0 && (
                                                                                                                        <Tag color="blue" icon={<VideoCameraOutlined />}>
                                                                                                                              Có video
                                                                                                                        </Tag>
                                                                                                                  )}
                                                                                                                  {getQuizFromStorage(sectionIndex, lessonIndex) && (
                                                                                                                        <Tag color="green" icon={<QuestionCircleOutlined />}>
                                                                                                                              Có quiz
                                                                                                                        </Tag>
                                                                                                                  )}
                                                                                                            </Space>
                                                                                                      </List.Item>
                                                                                                )}
                                                                                          />
                                                                                    )}
                                                                              </div>
                                                                        </Descriptions.Item>
                                                                  ))}
                                                      </Descriptions>
                                                </>
                                          )}
                                    </Card>
                              </Col>

                              <Col xs={24} lg={8}>
                                    <Card
                                          style={{
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                border: '1px solid #f0f0f0',
                                                height: 'fit-content'
                                          }}
                                    >
                                          <div style={{ textAlign: 'center', marginBottom: 32 }}>
                                                {displayValues.thumbnail && displayValues.thumbnail.length > 0 ? (
                                                      <div style={{ marginBottom: 16 }}>
                                                            <img
                                                                  src={URL.createObjectURL(displayValues.thumbnail[0].originFileObj)}
                                                                  alt="Thumbnail khóa học"
                                                                  style={{
                                                                        width: '120px',
                                                                        height: '120px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '12px',
                                                                        border: '2px solid #f0f0f0'
                                                                  }}
                                                            />
                                                      </div>
                                                ) : (
                                                      <Avatar
                                                            size={120}
                                                            icon={<BookOutlined />}
                                                            style={{
                                                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                  fontSize: '48px'
                                                            }}
                                                      />
                                                )}
                                                <Title level={4} style={{ marginTop: 16, color: '#1a1a1a' }}>
                                                      {displayValues.title || 'Khóa học mới'}
                                                </Title>
                                          </div>

                                          <Descriptions column={1} size="small">
                                                <Descriptions.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Trạng thái
                                                            </span>
                                                      }
                                                >
                                                      <Badge status="processing" text="Nháp" />
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Số chương
                                                            </span>
                                                      }
                                                >
                                                      <span style={{ color: '#1a1a1a' }}>
                                                            {displayValues.sections ? displayValues.sections.filter((s: any) => s && s.title && s.title.trim()).length : 0}
                                                      </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Tổng bài học
                                                            </span>
                                                      }
                                                >
                                                      <span style={{ color: '#1a1a1a' }}>
                                                            {displayValues.sections ? displayValues.sections.reduce((total: number, section: any) => {
                                                                  if (section && section.lessons && Array.isArray(section.lessons)) {
                                                                        return total + section.lessons.filter((l: any) => l && l.title && l.title.trim()).length;
                                                                  }
                                                                  return total;
                                                            }, 0) : 0}
                                                      </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                      label={
                                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                  Giá khóa học
                                                            </span>
                                                      }
                                                >
                                                      <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                                                            {finalPrice ? `${finalPrice.toLocaleString()} VNĐ` : 'Chưa nhập'}
                                                      </Text>
                                                </Descriptions.Item>
                                          </Descriptions>

                                          <Divider style={{ margin: '24px 0' }} />

                                          <div style={{ textAlign: 'center' }}>
                                                <Button
                                                      type="primary"
                                                      size="large"
                                                      icon={<SaveOutlined />}
                                                      loading={loading}
                                                      onClick={() => form.submit()}
                                                      style={{
                                                            width: '100%',
                                                            height: '48px',
                                                            borderRadius: '8px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            border: 'none',
                                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                                                      }}
                                                >
                                                      Tạo khóa học
                                                </Button>
                                          </div>
                                    </Card>
                              </Col>
                        </Row>
                  </div>
            );
      };

      const steps = [
            {
                  title: 'Thông tin cơ bản',
                  content: renderStep1(),
            },
            {
                  title: 'Chi tiết khóa học',
                  content: renderStep2(),
            },
            {
                  title: 'Xem trước và xác nhận',
                  content: renderStep3(),
            },
      ];

      return (
            <div style={{
                  padding: '32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  minHeight: '100vh'
            }}>
                  <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                  }}>
                        {/* Header */}
                        <div style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              padding: '24px 32px',
                              color: 'white',
                              textAlign: 'center'
                        }}>
                              <Title level={2} style={{ color: 'white', margin: 0 }}>
                                    <BookOutlined style={{ marginRight: 12 }} />
                                    Tạo Khóa Học Mới
                              </Title>
                              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                                    Thiết kế khóa học chuyên nghiệp với 3 bước đơn giản
                              </Text>
                        </div>

                        <Form
                              form={form}
                              layout="vertical"
                              onFinish={handleFinish}
                        >
                              {/* Steps */}
                              <div style={{ padding: '32px 32px 0' }}>
                                    <Steps
                                          current={currentStep}
                                          onChange={handleStepChange}
                                          progressDot
                                          style={{ marginBottom: '32px' }}
                                    >
                                          {steps.map((item) => (
                                                <Step
                                                      key={item.title}
                                                      title={item.title}
                                                      description={item.title === 'Thông tin cơ bản' ? 'Thông tin khóa học' :
                                                            item.title === 'Chi tiết khóa học' ? 'Nội dung và cấu trúc' :
                                                                  'Kiểm tra và xác nhận'}
                                                />
                                          ))}
                                    </Steps>
                              </div>

                              {/* Content */}
                              <div style={{ padding: '0 32px 32px' }}>
                                    {steps[currentStep].content}
                              </div>

                              {/* Navigation */}
                              <div style={{
                                    padding: '24px 32px',
                                    background: '#f8f9fa',
                                    borderTop: '1px solid #e9ecef',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                              }}>
                                    <div>
                                          {currentStep > 0 && (
                                                <Button
                                                      size="large"
                                                      icon={<ArrowLeftOutlined />}
                                                      onClick={() => handleStepChange(currentStep - 1)}
                                                      style={{
                                                            borderRadius: '8px',
                                                            height: '48px',
                                                            padding: '0 24px'
                                                      }}
                                                >
                                                      Quay lại
                                                </Button>
                                          )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                          {currentStep < steps.length - 1 && (
                                                <Button
                                                      type="primary"
                                                      size="large"
                                                      onClick={() => handleStepChange(currentStep + 1)}
                                                      style={{
                                                            borderRadius: '8px',
                                                            height: '48px',
                                                            padding: '0 32px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            border: 'none',
                                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                                                      }}
                                                >
                                                      Tiếp theo
                                                      <ArrowRightOutlined style={{ marginLeft: 8 }} />
                                                </Button>
                                          )}
                                          {currentStep === steps.length - 1 && (
                                                <Button
                                                      type="primary"
                                                      size="large"
                                                      icon={<SaveOutlined />}
                                                      loading={loading}
                                                      htmlType="submit"
                                                      style={{
                                                            borderRadius: '8px',
                                                            height: '48px',
                                                            padding: '0 32px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            border: 'none',
                                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                                                      }}
                                                >
                                                      Tạo khóa học
                                                </Button>
                                          )}
                                    </div>
                              </div>
                        </Form>
                  </div>

                  {/* Quiz Modal */}
                  <Modal
                        title="Tạo quiz cho bài học"
                        open={quizModalVisible}
                        onOk={handleQuizSave}
                        onCancel={() => setQuizModalVisible(false)}
                        width={800}
                        okText="Lưu quiz"
                        cancelText="Hủy"
                  >
                        <Form
                              form={quizForm}
                              layout="vertical"
                              initialValues={{ questions: [] }}
                        >
                              <Form.List name="questions">
                                    {(fields, { add, remove }) => (
                                          <>
                                                {fields.map(({ key, name }) => (
                                                      <Card
                                                            key={key}
                                                            size="small"
                                                            style={{ marginBottom: 16 }}
                                                            title={`Câu hỏi ${name + 1}`}
                                                            extra={
                                                                  <Button
                                                                        type="text"
                                                                        danger
                                                                        icon={<DeleteOutlined />}
                                                                        onClick={() => remove(name)}
                                                                  />
                                                            }
                                                      >
                                                            <Form.Item
                                                                  label="Câu hỏi"
                                                                  name={[name, 'question']}
                                                                  rules={[{ required: true, message: 'Vui lòng nhập câu hỏi!' }]}
                                                            >
                                                                  <TextArea rows={2} placeholder="Nhập câu hỏi..." />
                                                            </Form.Item>

                                                            <Form.Item label="Các đáp án">
                                                                  <Form.List name={[name, 'options']}>
                                                                        {(optionFields, { add: addOption, remove: removeOption }) => (
                                                                              <>
                                                                                    {optionFields.map(({ key: optionKey, name: optionName }) => (
                                                                                          <Space key={optionKey} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                                                                                                <Form.Item
                                                                                                      name={optionName}
                                                                                                      rules={[{ required: true, message: 'Vui lòng nhập đáp án!' }]}
                                                                                                      style={{ flex: 1 }}
                                                                                                      noStyle
                                                                                                >
                                                                                                      <Input placeholder={`Đáp án ${optionName + 1}`} />
                                                                                                </Form.Item>
                                                                                                {optionFields.length > 2 && (
                                                                                                      <Button
                                                                                                            type="text"
                                                                                                            danger
                                                                                                            icon={<DeleteOutlined />}
                                                                                                            onClick={() => removeOption(optionName)}
                                                                                                      />
                                                                                                )}
                                                                                          </Space>
                                                                                    ))}
                                                                                    <Button
                                                                                          type="dashed"
                                                                                          onClick={() => addOption()}
                                                                                          icon={<PlusOutlined />}
                                                                                    >
                                                                                          Thêm đáp án
                                                                                    </Button>
                                                                              </>
                                                                        )}
                                                                  </Form.List>
                                                            </Form.Item>

                                                            <Form.Item
                                                                  label={
                                                                        <Space>
                                                                              <Text>Đáp án đúng:</Text>
                                                                              <Text type="success" style={{ fontSize: '12px' }}>
                                                                                    (Chọn một đáp án đúng)
                                                                              </Text>
                                                                        </Space>
                                                                  }
                                                                  name={[name, 'correctIndex']}
                                                                  rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng!' }]}
                                                                  validateTrigger={['onChange', 'onBlur']}
                                                            >
                                                                  <Form.Item
                                                                        noStyle
                                                                        shouldUpdate={(prevValues, currentValues) => {
                                                                              const prevOptions = prevValues?.questions?.[name]?.options;
                                                                              const currentOptions = currentValues?.questions?.[name]?.options;
                                                                              return JSON.stringify(prevOptions) !== JSON.stringify(currentOptions);
                                                                        }}
                                                                  >
                                                                        {({ getFieldValue, setFieldValue }) => {
                                                                              const options = getFieldValue(['questions', name, 'options']) || [];
                                                                              const correctIndex = getFieldValue(['questions', name, 'correctIndex']);

                                                                              return (
                                                                                    <div>
                                                                                          {options.length === 0 ? (
                                                                                                <Text type="secondary">Vui lòng thêm ít nhất 2 đáp án trước</Text>
                                                                                          ) : (
                                                                                                <Radio.Group
                                                                                                      value={correctIndex}
                                                                                                      onChange={(e) => {
                                                                                                            setFieldValue(['questions', name, 'correctIndex'], e.target.value);
                                                                                                      }}
                                                                                                      style={{ width: '100%' }}
                                                                                                >
                                                                                                      {options.map((option: string, index: number) => (
                                                                                                            <Radio key={index} value={index} style={{ display: 'block', marginBottom: 8 }}>
                                                                                                                  <Space>
                                                                                                                        <Text style={{ wordBreak: 'break-word' }}>{option || `Đáp án ${index + 1}`}</Text>
                                                                                                                        {correctIndex === index && (
                                                                                                                              <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                                                                                                        )}
                                                                                                                  </Space>
                                                                                                            </Radio>
                                                                                                      ))}
                                                                                                </Radio.Group>
                                                                                          )}
                                                                                    </div>
                                                                              );
                                                                        }}
                                                                  </Form.Item>
                                                            </Form.Item>
                                                      </Card>
                                                ))}
                                                <Form.Item>
                                                      <Button
                                                            type="dashed"
                                                            onClick={() => add()}
                                                            block
                                                            icon={<PlusOutlined />}
                                                      >
                                                            Thêm câu hỏi
                                                      </Button>
                                                </Form.Item>
                                          </>
                                    )}
                              </Form.List>
                        </Form>
                  </Modal>
            </div>
      );
};

export default MyCourseAdd; 