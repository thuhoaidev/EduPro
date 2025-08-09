import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Upload,
  message,
  Card,
  Space,
  Divider,
  Spin,
  Alert,
  Row,
  Col,
  Tag,
  Typography,
  Descriptions,
  List,
  Collapse,
  Switch,
  Tooltip,
  Modal,
  Popconfirm,
  Radio,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
  QuestionCircleOutlined,
  DragOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  BookOutlined,
  DollarOutlined,
  SettingOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, updateCourse, updateSection, createSection, deleteSection, createLesson, updateLesson, deleteLesson, createVideo, updateVideo, deleteVideo, createQuiz, updateQuiz } from "../../../services/courseService";
import { getAllCategories } from "../../../services/categoryService";
import type { Category } from "../../../interfaces/Category.interface";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const levels = [
  { label: "Cơ bản", value: "beginner" },
  { label: "Trung bình", value: "intermediate" },
  { label: "Nâng cao", value: "advanced" },
];

const languages = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "Tiếng Anh", value: "en" },
  { label: "Tiếng Trung", value: "zh" },
  { label: "Tiếng Nhật", value: "ja" },
  { label: "Tiếng Hàn", value: "ko" },
];

const statuses = [
  { label: "Nháp", value: "draft" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đã duyệt", value: "approved" },
  { label: "Từ chối", value: "rejected" },
];

const displayStatuses = [
  { label: "Ẩn", value: "hidden" },
  { label: "Công khai", value: "published" },
];

const discountTypes = [
  { label: "Giảm theo số tiền (VNĐ)", value: "amount" },
  { label: "Giảm theo phần trăm (%)", value: "percentage" },
];

interface Video {
  _id: string;
  url: string;
  duration: number;
  status?: string;
  title?: string;
  description?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Quiz {
  _id: string;
  questions: QuizQuestion[];
}

interface Lesson {
  _id: string;
  title: string;
  position: number;
  is_preview: boolean;
  video?: Video; // Hỗ trợ cấu trúc cũ (đơn lẻ)
  videos?: Video[]; // Hỗ trợ cấu trúc mới (mảng)
  quiz?: Quiz;
}

interface Section {
  _id: string;
  title: string;
  position: number;
  description?: string;
  lessons: Lesson[];
}

interface CourseData {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: {
    _id: string;
    name: string;
  };
  level: string;

  price: number;
  discount_amount: number;
  discount_percentage: number;
  status: string;
  displayStatus: string;
  rejection_reason?: string;
  requirements: string[];
  sections: Section[];
  views?: number;
  rating?: number;
  totalReviews?: number;
  enrolledCount?: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

interface EditPermissions {
  canEditBasicInfo: boolean;
  canEditPricing: boolean;
  canEditContent: boolean;
  canAddLessons: boolean;
  canEditLessons: boolean;
  canDeleteLessons: boolean;
  canEditVideos: boolean;
  canEditQuizzes: boolean;
  requiresReapproval: boolean;
  warningMessage?: string;
}

const EditCourse: React.FC = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState(false);
  const [deletingSection, setDeletingSection] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState(false);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<"amount" | "percentage">("amount");
  const [fileList, setFileList] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showReapprovalModal, setShowReapprovalModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonForm] = Form.useForm();
  const [videoFileList, setVideoFileList] = useState<{ [key: number | string]: any }>({});
  const [draggingQuestionIdx, setDraggingQuestionIdx] = useState<number | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  // New modal states
  const [showSectionEditModal, setShowSectionEditModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [sectionForm] = Form.useForm();
  const openVideoPreview = (file: any) => {
    try {
      let url: string | null = null;
      if (file?.url) url = file.url as string;
      else if (file?.originFileObj) url = URL.createObjectURL(file.originFileObj as File);
      if (url) {
        setPreviewVideoUrl(url);
        setShowVideoPreview(true);
      } else {
        message.info('Không có video để xem trước');
      }
    } catch (e) {
      message.error('Không thể xem trước video');
    }
  };

  const closeVideoPreview = () => {
    if (previewVideoUrl && previewVideoUrl.startsWith('blob:')) {
      try { URL.revokeObjectURL(previewVideoUrl); } catch {}
    }
    setShowVideoPreview(false);
    setPreviewVideoUrl(null);
  };

  // Chuẩn hóa dữ liệu quiz trước khi gửi backend
  const sanitizeQuizQuestions = (rawQuestions: any[]): any[] => {
    if (!Array.isArray(rawQuestions)) return [];
    return rawQuestions
      .map((q) => {
        const questionText = typeof q?.question === 'string' ? q.question.trim() : '';
        const originalOptions: any[] = Array.isArray(q?.options) ? q.options : [];
        const parsedCorrect = Number.isInteger(q?.correctIndex)
          ? q.correctIndex
          : parseInt(q?.correctIndex, 10);
        const originalCorrectIndex = Number.isNaN(parsedCorrect) ? -1 : parsedCorrect;

        let newCorrectIndex = -1;
        const options: string[] = [];
        originalOptions.forEach((opt, idx) => {
          const text = typeof opt === 'string' ? opt.trim() : '';
          if (text) {
            if (idx === originalCorrectIndex && newCorrectIndex === -1) {
              newCorrectIndex = options.length;
            }
            options.push(text);
          }
        });

        if (!questionText || options.length < 2) {
          return null;
        }

        if (newCorrectIndex < 0 || newCorrectIndex >= options.length) {
          newCorrectIndex = 0;
        }

        return {
          question: questionText,
          options,
          correctIndex: newCorrectIndex,
        };
      })
      .filter(Boolean) as any[];
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await getAllCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        message.error('Không thể tải danh mục');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      console.log('ID truyền vào getCourseById:', id);
      setLoading(true);
      setError(null);

      try {
        const data = await getCourseById(id);
        setCourse(data);

        // Set fileList cho Upload nếu có thumbnail
        if (data.thumbnail) {
          setFileList([{
            uid: '-1',
            name: 'thumbnail.jpg',
            status: 'done',
            url: data.thumbnail,
          }]);
        }

        // Determine discount type
        if (data.discount_percentage > 0) {
          setDiscountType("percentage");
        } else if (data.discount_amount > 0) {
          setDiscountType("amount");
        }

        // Set category_id là _id nếu category là object
        const formData = {
          ...data,
          price: typeof data.price === 'number' ? data.price : Number(data.price) || 0,
          category_id: data.category?._id || data.category_id,
          discount: data.discount_percentage || data.discount_amount || 0,
          requirements: data.requirements || [],
          sections: Array.isArray(data.sections) && data.sections.length > 0
            ? data.sections.map((s: any) => ({ title: s.title || '' }))
            : [{ title: '' }],
        };

        console.log('formData setFieldsValue:', formData);
        form.setFieldsValue(formData);
        setTimeout(() => {
          console.log('form.getFieldValue("price"):', form.getFieldValue('price'));
        }, 500);
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải thông tin khóa học");
        message.error(err.message || "Lỗi khi tải thông tin khóa học");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [form, id]);

  // Calculate edit permissions based on course status and enrollment
  const getEditPermissions = (): EditPermissions => {
    if (!course) {
      return {
        canEditBasicInfo: false,
        canEditPricing: false,
        canEditContent: false,
        canAddLessons: false,
        canEditLessons: false,
        canDeleteLessons: false,
        canEditVideos: false,
        canEditQuizzes: false,
        requiresReapproval: false,
      };
    }

    const hasEnrolledStudents = (course.enrolledCount || 0) > 0;
    const isPublished = course.status === 'approved' && course.displayStatus === 'published';

    // Draft status - full editing permissions
    if (course.status === 'draft') {
      return {
        canEditBasicInfo: true,
        canEditPricing: true,
        canEditContent: true,
        canAddLessons: true,
        canEditLessons: true,
        canDeleteLessons: true,
        canEditVideos: true,
        canEditQuizzes: true,
        requiresReapproval: false,
      };
    }

    // Rejected status - can edit to address rejection reasons
    if (course.status === 'rejected') {
      return {
        canEditBasicInfo: true,
        canEditPricing: true,
        canEditContent: true,
        canAddLessons: true,
        canEditLessons: true,
        canDeleteLessons: true,
        canEditVideos: true,
        canEditQuizzes: true,
        requiresReapproval: true,
        warningMessage: "Khóa học đã bị từ chối. Sau khi chỉnh sửa, bạn cần gửi lại để duyệt.",
      };
    }

    // Pending status - can edit but may require reapproval
    if (course.status === 'pending') {
      return {
        canEditBasicInfo: true,
        canEditPricing: true,
        canEditContent: true,
        canAddLessons: true,
        canEditLessons: true,
        canDeleteLessons: true,
        canEditVideos: true,
        canEditQuizzes: true,
        requiresReapproval: true,
        warningMessage: "Khóa học đang chờ duyệt. Thay đổi lớn có thể yêu cầu duyệt lại.",
      };
    }

    // Published status
    if (isPublished) {
      if (hasEnrolledStudents) {
        // Has enrolled students - restricted editing
        return {
          canEditBasicInfo: true,
          canEditPricing: false,
          canEditContent: false,
          canAddLessons: true,
          canEditLessons: false,
          canDeleteLessons: false,
          canEditVideos: false,
          canEditQuizzes: false,
          requiresReapproval: false,
          warningMessage: "Khóa học đã có học viên đăng ký. Chỉ được thêm nội dung mới, không được thay đổi hoặc xóa nội dung đã có.",
        };
      } else {
        // No enrolled students - more flexible editing
        return {
          canEditBasicInfo: true,
          canEditPricing: true,
          canEditContent: true,
          canAddLessons: true,
          canEditLessons: true,
          canDeleteLessons: true,
          canEditVideos: true,
          canEditQuizzes: true,
          requiresReapproval: true,
          warningMessage: "Khóa học đã công khai. Thay đổi video/quiz có thể yêu cầu duyệt lại.",
        };
      }
    }

    // Default case
    return {
      canEditBasicInfo: true,
      canEditPricing: true,
      canEditContent: true,
      canAddLessons: true,
      canEditLessons: true,
      canDeleteLessons: true,
      canEditVideos: true,
      canEditQuizzes: true,
      requiresReapproval: false,
    };
  };

  const permissions = getEditPermissions();

  const handleFinish = async (values: any) => {
    if (permissions.requiresReapproval) {
      setShowReapprovalModal(true);
      return;
    }

    await saveCourse(values);
  };

  const saveCourse = async (values: any) => {
    setSaving(true);
    try {
      let courseData = {
        ...values,
        discount_amount: discountType === "amount" ? values.discount : 0,
        discount_percentage: discountType === "percentage" ? values.discount : 0,
      };
      delete courseData.discount;

      // Xử lý thumbnail: nếu không chọn file mới thì chỉ gửi URL ảnh cũ
      if (fileList.length === 0 && course?.thumbnail) {
        courseData.thumbnail = course.thumbnail;
      } else if (fileList.length > 0 && fileList[0].originFileObj) {
        courseData.thumbnail = fileList[0].originFileObj;
      } else {
        delete courseData.thumbnail;
      }

      // If reapproval is required, set status to pending
      if (permissions.requiresReapproval) {
        courseData.status = 'pending';
        courseData.displayStatus = 'hidden';
      }

      await updateCourse(id!, courseData);
      message.success("Cập nhật khóa học thành công!");
      navigate("/instructor/courses");
    } catch (err: any) {
      message.error(err.message || "Lỗi khi cập nhật khóa học");
    } finally {
      setSaving(false);
      setShowReapprovalModal(false);
    }
  };

  const handleDiscountTypeChange = (value: "amount" | "percentage") => {
    setDiscountType(value);
    // Reset discount value when changing type
    form.setFieldsValue({ discount: 0 });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let result = '';
    if (hours > 0) {
      result += `${hours}h `;
    }
    if (minutes > 0) {
      result += `${minutes}m `;
    }
    if (remainingSeconds > 0 || result === '') {
      result += `${remainingSeconds}s`;
    }

    return result.trim();
  };

  const toggleSectionExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);

    // Initialize form with lesson data
    const initialValues = {
      title: lesson.title,
      is_preview: lesson.is_preview,
      videos: [], // Khởi tạo mảng rỗng
      questions: []
    };

    // Handle videos (support both old single video and new multiple videos)
    if (lesson.videos && lesson.videos.length > 0) {
      // Có nhiều video - tạo fields cho từng video
      initialValues.videos = lesson.videos.map(video => ({
        description: video.description || '',
        duration: video.duration || 0,
        status: video.status || 'draft',
        url: video.url
      }));
    } else if (lesson.video) {
      // Convert single video to array format
      initialValues.videos = [{
        description: lesson.video.description || '',
        duration: lesson.video.duration || 0,
        status: lesson.video.status || 'draft',
        url: lesson.video.url
      }];
    } else {
      // Không có video - tạo 1 field trống để người dùng có thể thêm
      initialValues.videos = [{}];
    }

    // Handle quiz
    if (lesson.quiz && lesson.quiz.questions) {
      initialValues.questions = lesson.quiz.questions;
    }

    lessonForm.setFieldsValue(initialValues);

    // Set video file list if videos exist
    if (lesson.videos && lesson.videos.length > 0) {
      const fileListObj: { [key: number]: any } = {};
      lesson.videos.forEach((video, index) => {
        fileListObj[index] = {
          uid: `-${index + 1}`,
          name: video.title || `video-${index + 1}.mp4`,
          status: 'done' as const,
          url: video.url,
        };
      });
      setVideoFileList(fileListObj);
    } else if (lesson.video) {
      // Hỗ trợ video đơn lẻ từ form tạo
      setVideoFileList({
        0: {
          uid: '-1',
          name: lesson.video.title || 'video.mp4',
          status: 'done' as const,
          url: lesson.video.url,
        }
      });
    } else {
      setVideoFileList({});
    }

    setShowLessonModal(true);
  };

  // Handler for editing section
  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    sectionForm.setFieldsValue({
      title: section.title,
      description: section.description || ''
    });
    setShowSectionEditModal(true);
  };

  // Handler for adding lesson
  const handleAddLesson = (section: Section) => {
    setSelectedSection(section);
    lessonForm.resetFields();
    lessonForm.setFieldsValue({
      title: '',
      is_preview: false,
      video_status: 'draft',
      video_description: '',
      video_duration: 0,
      questions: []
    });
    setVideoFileList({});
    setShowAddLessonModal(true);
  };

  // Handler for adding section
  const handleAddSection = () => {
    sectionForm.resetFields();
    sectionForm.setFieldsValue({
      title: '',
      description: ''
    });
    setShowAddSectionModal(true);
  };

  // Handler for saving section
  const handleSaveSection = async (values: any) => {
    if (!selectedSection) return;

    setSavingSection(true);
    try {
      // Gọi API để cập nhật section
      await updateSection(selectedSection._id, {
        title: values.title,
        description: values.description
      });

      message.success("Cập nhật chương thành công!");
      setShowSectionEditModal(false);
      sectionForm.resetFields();

      // Refresh course data để cập nhật UI
      if (id) {
        const data = await getCourseById(id);
        setCourse(data);
      }
    } catch (err: any) {
      message.error(err.message || "Lỗi khi cập nhật chương");
      console.error('Error updating section:', err);
    } finally {
      setSavingSection(false);
    }
  };

  // Handler for saving new lesson
  const handleSaveNewLesson = async (values: any) => {
    if (!selectedSection) return;

    setSavingLesson(true);
    try {
      // Gọi API để tạo lesson mới
      const newLesson = await createLesson(selectedSection._id, {
        title: values.title,
        is_preview: values.is_preview || false
      });

      // Xử lý video nếu có
      console.log('Values video:', values.video_file);
      console.log('Video file list:', videoFileList);

      if (values.video_file && values.video_file.fileList && values.video_file.fileList.length > 0) {
        const videoFile = videoFileList.newLesson?.originFileObj;
        const videoStatus = values.video_status || 'draft';
        const videoDescription = values.video_description || '';
        const videoDuration = values.video_duration || 0;

        console.log('Video data:', { videoFile, videoStatus, videoDescription, videoDuration });

        if (videoFile) {
          console.log('Creating video...');
          const formData = new FormData();
          formData.append('lesson_id', newLesson[0]._id); // Lấy lesson ID từ response
          formData.append('video', videoFile);
          formData.append('description', videoDescription);
          formData.append('duration', videoDuration.toString());
          formData.append('status', videoStatus);

          await createVideo(newLesson[0]._id, formData);
          console.log('Video created successfully');
        } else {
          console.log('No video file to process');
        }
      } else {
        console.log('No video to process');
      }

      // Xử lý quiz nếu có
      const sanitizedNewQuestions = sanitizeQuizQuestions(values.questions || []);
      if (sanitizedNewQuestions.length > 0) {
        await createQuiz(newLesson[0]._id, {
          questions: sanitizedNewQuestions
        });
      }

      message.success("Thêm bài học thành công!");
      setShowAddLessonModal(false);
      lessonForm.resetFields();
      setVideoFileList({}); // Reset video file list

      // Refresh course data để cập nhật UI
      if (id) {
        const data = await getCourseById(id);
        setCourse(data);
      }
    } catch (err: any) {
      message.error(err.message || "Lỗi khi thêm bài học");
      console.error('Error creating lesson:', err);
    } finally {
      setSavingLesson(false);
    }
  };

  // Handler for saving new section
  const handleSaveNewSection = async (values: any) => {
    if (!id) return;

    setSavingSection(true);
    try {
      // Gọi API để tạo section mới
      await createSection(id, {
        title: values.title,
        description: values.description
      });

      message.success("Thêm chương học thành công!");
      setShowAddSectionModal(false);
      sectionForm.resetFields();

      // Refresh course data để cập nhật UI
      const data = await getCourseById(id);
      setCourse(data);
    } catch (err: any) {
      message.error(err.message || "Lỗi khi thêm chương học");
      console.error('Error creating section:', err);
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveLesson = async (values: any) => {
    if (!selectedLesson) return;

    setSavingLesson(true);
    try {
      // Gọi API để cập nhật lesson
      await updateLesson(selectedLesson._id, {
        title: values.title,
        is_preview: values.is_preview || false
      });

      // Xử lý video nếu có
      console.log('Edit - Values videos:', values.videos);
      console.log('Edit - Video file list:', videoFileList);

      if (values.videos && values.videos.length > 0) {
        // Xử lý từng video có file thực sự
        for (let i = 0; i < values.videos.length; i++) {
          const videoData = values.videos[i];
          const videoFile = videoFileList[i]?.originFileObj;

          console.log(`Edit - Video ${i}:`, { videoData, videoFile, hasFile: !!videoFile, hasStatus: !!videoData.status });

          // Chỉ tạo/cập nhật video nếu có file và status
          if (videoFile && videoData.status) {
            console.log(`Edit - Processing video ${i}...`);
            const formData = new FormData();
            formData.append('lesson_id', selectedLesson._id);
            formData.append('video', videoFile);
            formData.append('description', videoData.description || '');
            formData.append('duration', videoData.duration?.toString() || '0');
            formData.append('status', videoData.status || 'draft');

            // Nếu video đã tồn tại thì update, nếu không thì create
            if (selectedLesson.videos && selectedLesson.videos[i]) {
              console.log(`Edit - Updating existing video ${i}`);
              await updateVideo(selectedLesson.videos[i]._id, formData);
            } else {
              console.log(`Edit - Creating new video ${i}`);
              await createVideo(selectedLesson._id, formData);
            }
            console.log(`Edit - Video ${i} processed successfully`);
          } else if (videoData.status && !videoFile) {
            // Có status nhưng không có file mới - có thể là video có sẵn
            console.log(`Edit - Video ${i} has status but no new file - keeping existing video`);
          } else {
            console.log(`Edit - Skipping video ${i} - no file or status`);
          }
        }
      } else {
        console.log('Edit - No videos to process');
      }

      // Xử lý quiz nếu có
      const sanitizedQuestions = sanitizeQuizQuestions(values.questions || []);
      if (sanitizedQuestions.length > 0) {
        if (selectedLesson.quiz) {
          await updateQuiz(selectedLesson.quiz._id, {
            questions: sanitizedQuestions
          });
        } else {
          await createQuiz(selectedLesson._id, {
            questions: sanitizedQuestions
          });
        }
      }

      message.success("Cập nhật bài học thành công!");
      setShowLessonModal(false);
      lessonForm.resetFields();
      setVideoFileList({}); // Reset video file list

      // Refresh course data để cập nhật UI
      if (id) {
        const data = await getCourseById(id);
        setCourse(data);
      }
    } catch (err: any) {
      message.error(err.message || "Lỗi khi cập nhật bài học");
      console.error('Error updating lesson:', err);
    } finally {
      setSavingLesson(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending': return 'processing';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  // Handler for deleting lesson
  const handleDeleteLesson = async (lesson: Lesson) => {
    Modal.confirm({
      title: 'Xác nhận xóa bài học',
      content: `Bạn có chắc chắn muốn xóa bài học "${lesson.title}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeletingLesson(true);
        try {
          await deleteLesson(lesson._id);
          message.success("Xóa bài học thành công!");

          // Refresh course data để cập nhật UI
          if (id) {
            const data = await getCourseById(id);
            setCourse(data);
          }
        } catch (err: any) {
          message.error(err.message || "Lỗi khi xóa bài học");
          console.error('Error deleting lesson:', err);
        } finally {
          setDeletingLesson(false);
        }
      },
    });
  };

  // Handler for deleting section
  const handleDeleteSection = async (section: Section) => {
    Modal.confirm({
      title: 'Xác nhận xóa chương học',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa chương "{section.title}"?</p>
          {section.lessons && section.lessons.length > 0 && (
            <Alert
              message="Cảnh báo"
              description={`Chương này có ${section.lessons.length} bài học. Tất cả bài học, video và quiz sẽ bị xóa vĩnh viễn.`}
              type="warning"
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
          <p style={{ marginTop: 8, color: '#ff4d4f' }}>Hành động này không thể hoàn tác.</p>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeletingSection(true);
        try {
          await deleteSection(section._id);
          message.success("Xóa chương học thành công!");

          // Refresh course data để cập nhật UI
          if (id) {
            const data = await getCourseById(id);
            setCourse(data);
          }
        } catch (err: any) {
          message.error(err.message || "Lỗi khi xóa chương học");
          console.error('Error deleting section:', err);
        } finally {
          setDeletingSection(false);
        }
      },
    });
  };

  // Handler for deleting video
  const handleDeleteVideo = async (videoId: string, videoTitle?: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa video',
      content: `Bạn có chắc chắn muốn xóa video "${videoTitle || 'này'}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeletingVideo(true);
        try {
          await deleteVideo(videoId);
          message.success("Xóa video thành công!");

          // Refresh course data để cập nhật UI
          if (id) {
            const data = await getCourseById(id);
            setCourse(data);
          }
        } catch (err: any) {
          message.error(err.message || "Lỗi khi xóa video");
          console.error('Error deleting video:', err);
        } finally {
          setDeletingVideo(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">Đang tải thông tin khóa học...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-6">
        <Card className="border-red-200 bg-red-50">
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4">
      {/* Course Info Header */}
      {course && (
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <Row gutter={24} align="middle">
            <Col span={4}>
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-24 object-cover rounded-2xl shadow-md border-4 border-white"
                />
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                  {course.sections?.length || 0} chương
                </div>
              </div>
            </Col>
            <Col span={20}>
              <Title level={2} className="mb-3 text-gray-800" style={{ margin: 0 }}>
                {course.title}
              </Title>
              <div className="mb-4">
                <Space size="small" wrap>
                  <Tag color="blue" className="px-3 py-1 rounded-full font-medium">
                    📚 {course.category?.name}
                  </Tag>
                  <Tag color="green" className="px-3 py-1 rounded-full font-medium">
                    🎯 {levels.find(l => l.value === course.level)?.label}
                  </Tag>
                  <Tag color={getStatusColor(course.status)} className="px-3 py-1 rounded-full font-medium">
                    {course.status === 'approved' ? '✅' : course.status === 'pending' ? '⏳' : course.status === 'rejected' ? '❌' : '📝'} 
                    {statuses.find(s => s.value === course.status)?.label}
                  </Tag>
                  {course.enrolledCount && course.enrolledCount > 0 && (
                    <Tag color="purple" className="px-3 py-1 rounded-full font-medium">
                      👥 {course.enrolledCount} học viên
                    </Tag>
                  )}
                  {course.views && (
                    <Tag color="purple" className="px-3 py-1 rounded-full font-medium">
                      👁 {course.views} lượt xem
                    </Tag>
                  )}
                  {course.rating && (
                    <Tag color="gold" className="px-3 py-1 rounded-full font-medium">
                      ⭐ {course.rating}/5 ({course.totalReviews} đánh giá)
                    </Tag>
                  )}
                </Space>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOutlined className="text-blue-500" />
                  <span>Tổng {course.sections?.reduce((total, section) => total + (section.lessons?.length || 0), 0) || 0} bài học</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarOutlined className="text-green-500" />
                  <span className="font-semibold">
                    {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')} VNĐ`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <SettingOutlined className="text-orange-500" />
                  <span>Cập nhật: {new Date(course.updatedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Warning Messages */}
      {permissions.warningMessage && (
        <Alert
          message="Lưu ý chỉnh sửa"
          description={permissions.warningMessage}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          className="mb-8 border-orange-200 bg-orange-50 rounded-xl"
        />
      )}

      <Card
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <InfoCircleOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-800">Chỉnh sửa thông tin khóa học</div>
              <div className="text-sm text-gray-500">Cập nhật thông tin cơ bản, giá cả và nội dung</div>
            </div>
            {!permissions.canEditBasicInfo && (
              <Tag color="red" icon={<LockOutlined />} className="ml-auto">
                Chế độ xem chỉ
              </Tag>
            )}
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => form.submit()}
            disabled={!permissions.canEditBasicInfo}
            size="large"
            className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Lưu thay đổi
          </Button>
        }
        className="border-0 shadow-lg mb-8"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          disabled={saving || !permissions.canEditBasicInfo}
          initialValues={{
            sections: [{ title: '' }],
          }}
        >
          <Row gutter={32}>
            <Col span={16}>
              {/* Basic Information */}
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <BookOutlined className="text-white" />
                    </div>
                    <span className="text-lg font-semibold">Thông tin cơ bản</span>
                  </div>
                }
                className="mb-8 border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Form.Item
                  label="Tiêu đề khóa học"
                  name="title"
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                >
                  <Input 
                    placeholder="Nhập tiêu đề khóa học" 
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  label="Mô tả"
                  name="description"
                  rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Mô tả chi tiết về khóa học"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Danh mục"
                      name="category_id"
                      rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
                    >
                      <Select
                        placeholder="Chọn danh mục"
                        loading={categoriesLoading}
                        showSearch
                        size="large"
                        className="rounded-lg"
                        filterOption={(input, option) =>
                          (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {categories.map(category => (
                          <Select.Option key={category._id} value={category._id}>
                            {category.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Trình độ"
                      name="level"
                      rules={[{ required: true, message: "Chọn trình độ!" }]}
                    >
                      <Select 
                        placeholder="Chọn trình độ"
                        size="large"
                        className="rounded-lg"
                      >
                        {levels.map(level => (
                          <Select.Option key={level.value} value={level.value}>
                            {level.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Trạng thái"
                      name="status"
                      rules={[{ required: true, message: "Chọn trạng thái!" }]}
                    >
                      <Select 
                        placeholder="Chọn trạng thái"
                        size="large"
                        className="rounded-lg"
                      >
                        {statuses.map(status => (
                          <Select.Option key={status.value} value={status.value}>
                            {status.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Trạng thái hiển thị"
                      name="displayStatus"
                      rules={[{ required: true, message: "Chọn trạng thái hiển thị!" }]}
                    >
                      <Select 
                        placeholder="Chọn trạng thái hiển thị"
                        size="large"
                        className="rounded-lg"
                      >
                        {displayStatuses.map(status => (
                          <Select.Option key={status.value} value={status.value}>
                            {status.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {course?.rejection_reason && (
                  <Form.Item
                    label="Lý do từ chối"
                    name="rejection_reason"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Lý do từ chối (nếu có)"
                      disabled
                      className="rounded-lg bg-red-50 border-red-200"
                    />
                  </Form.Item>
                )}
              </Card>

              {/* Pricing Information */}
              <Card
                title={
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <DollarOutlined className="text-white" />
                    </div>
                    <span className="text-lg font-semibold">Thông tin giá</span>
                    {!permissions.canEditPricing && (
                      <Tag color="red" icon={<LockOutlined />} className="ml-auto">
                        Không thể chỉnh sửa
                      </Tag>
                    )}
                  </div>
                }
                className="mb-8 border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Giá gốc (VNĐ)"
                      name="price"
                      rules={[{ required: true, message: "Nhập giá!" }]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        size="large"
                        className="rounded-lg"
                        placeholder="Nhập giá khóa học (0 = miễn phí)"
                        formatter={(value) =>
                          value !== undefined && value !== null
                            ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            : ''
                        }
                        disabled={!permissions.canEditPricing}
                      />
                    </Form.Item>
                    <div className="text-gray-500 text-sm -mt-3 mb-4">
                      Nhập <b>0</b> nếu muốn tạo khóa học miễn phí.
                    </div>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Loại giảm giá">
                      <Select
                        value={discountType}
                        onChange={handleDiscountTypeChange}
                        placeholder="Chọn loại giảm giá"
                        disabled={!permissions.canEditPricing}
                        size="large"
                        className="rounded-lg"
                      >
                        {discountTypes.map(type => (
                          <Select.Option key={type.value} value={type.value}>
                            {type.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={discountType === "amount" ? "Giảm giá (VNĐ)" : "Giảm giá (%)"}
                  name="discount"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={discountType === "percentage" ? 100 : undefined}
                    placeholder={discountType === "amount" ? "Nhập số tiền giảm" : "Nhập phần trăm giảm"}
                    size="large"
                    className="rounded-lg"
                    formatter={(value) =>
                      discountType === "amount"
                        ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        : `${value}%`
                    }
                    disabled={!permissions.canEditPricing}
                  />
                </Form.Item>
              </Card>

              {/* Requirements */}
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <CheckCircleOutlined className="text-white" />
                    </div>
                    <span className="text-lg font-semibold">Yêu cầu trước khóa học</span>
                  </div>
                }
                className="mb-8 border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Form.List name="requirements">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name }) => (
                        <div key={key} className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <Form.Item
                              name={name}
                              rules={[{ required: true, message: "Nhập nội dung yêu cầu" }]}
                              className="mb-0"
                            >
                              <Input
                                placeholder="VD: Có kiến thức cơ bản về JavaScript"
                                className="rounded-lg"
                                disabled={!permissions.canEditContent}
                              />
                            </Form.Item>
                          </div>
                          {permissions.canEditContent && (
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            />
                          )}
                        </div>
                      ))}
                      {permissions.canEditContent && (
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            icon={<PlusOutlined />}
                            block
                            size="large"
                            className="border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                          >
                            Thêm yêu cầu
                          </Button>
                        </Form.Item>
                      )}
                    </>
                  )}
                </Form.List>
              </Card>

              {/* Course Sections with Lessons */}
              <Card
                title={
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileTextOutlined className="text-white" />
                    </div>
                    <span className="text-lg font-semibold">Chương trình học</span>
                  </div>
                }
                extra={
                  <Space>
                    {permissions.canAddLessons && (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddSection}
                        size="large"
                        className="bg-gradient-to-r from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Thêm chương
                      </Button>
                    )}
                    {!permissions.canEditContent && (
                      <Tag color="orange" icon={<InfoCircleOutlined />} className="px-3 py-1 rounded-full">
                        Chỉ được thêm mới
                      </Tag>
                    )}
                  </Space>
                }
                className="border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {course?.sections && course.sections.length > 0 ? (
                  <Collapse
                    activeKey={Array.from(expandedSections)}
                    onChange={(keys) => setExpandedSections(new Set(keys as string[]))}
                    className="border-0 bg-transparent"
                    expandIconPosition="end"
                  >
                    {course.sections.map((section, sectionIndex) => (
                      <Panel
                        key={section._id}
                        className="mb-6 border-0 shadow-lg bg-white rounded-2xl overflow-hidden"
                        header={
                          <div className="flex items-center justify-between w-full py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl text-xl font-bold shadow-lg">
                                {sectionIndex + 1}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  {section.title}
                                </h3>
                                {section.description && (
                                  <p className="text-sm text-gray-600 line-clamp-1 max-w-md">
                                    {section.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                                <FileTextOutlined className="text-blue-600 text-lg" />
                                <span className="text-sm font-semibold text-blue-700">
                                  {section.lessons?.length || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {permissions.canEditContent && (
                                  <Button
                                    type="text"
                                    size="large"
                                    icon={<EditOutlined />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditSection(section);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                  >
                                  </Button>
                                )}
                                {permissions.canEditContent && (
                                  <Button
                                    type="text"
                                    size="large"
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSection(section);
                                    }}
                                    loading={deletingSection}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                  >
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        }
                      >
                        {section.lessons && section.lessons.length > 0 ? (
                          <>
                            <div className="space-y-4">
                              {section.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson._id}
                                  className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
                                >
                                  <div className="flex items-start justify-between">
                                    {/* Lesson Info */}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-2xl text-lg font-bold">
                                          {lessonIndex + 1}
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="text-lg font-bold text-gray-900 mb-2">
                                            {lesson.title}
                                          </h4>
                                          <div className="flex items-center gap-3">
                                            {lesson.is_preview && (
                                              <Tag color="green" icon={<EyeOutlined />} className="text-xs px-3 py-1 rounded-full">
                                                Xem trước
                                              </Tag>
                                            )}
                                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                              Bài học #{lesson.position || lessonIndex + 1}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Lesson Content Status */}
                                      <div className="flex items-center gap-6">
                                        {/* Video Status */}
                                        <div className="flex items-center gap-3">
                                          {(lesson.videos && lesson.videos.length > 0) || lesson.video ? (
                                            <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                                              <PlayCircleOutlined className="text-green-600 text-lg" />
                                              <span className="text-sm font-semibold text-green-700">
                                                {lesson.videos ? lesson.videos.length : 1} video
                                                {lesson.videos && lesson.videos.length > 0 && (
                                                  <span className="ml-2 text-green-600">
                                                    ({lesson.videos.reduce((total, v) => total + (v.duration || 0), 0) > 0
                                                      ? formatDuration(lesson.videos.reduce((total, v) => total + (v.duration || 0), 0))
                                                      : 'N/A'})
                                                  </span>
                                                )}
                                                {lesson.videos && lesson.videos.length > 1 && (
                                                  <span className="ml-2 text-blue-600 font-medium">
                                                    (Nhiều video)
                                                  </span>
                                                )}
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-3 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
                                              <VideoCameraOutlined className="text-orange-600 text-lg" />
                                              <span className="text-sm font-semibold text-orange-700">
                                                Chưa có video
                                              </span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Quiz Status */}
                                        <div className="flex items-center gap-3">
                                          {lesson.quiz ? (
                                            <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
                                              <QuestionCircleOutlined className="text-purple-600 text-lg" />
                                              <span className="text-sm font-semibold text-purple-700">
                                                {lesson.quiz.questions?.length || 0} câu hỏi
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-3 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
                                              <QuestionCircleOutlined className="text-orange-600 text-lg" />
                                              <span className="text-sm font-semibold text-orange-700">
                                                Chưa có quiz
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Hiển thị danh sách video chi tiết nếu có nhiều video */}
                                      {lesson.videos && lesson.videos.length > 1 && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                          <div className="text-sm text-gray-700 mb-3 font-medium">Danh sách video:</div>
                                          <div className="space-y-2">
                                            {lesson.videos.map((video, index) => (
                                              <div key={video._id} className="flex items-center justify-between text-sm p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                  <PlayCircleOutlined className="text-blue-500 text-lg" />
                                                  <span className="text-gray-800 font-medium">
                                                    {video.title || `Video ${index + 1}`}
                                                  </span>
                                                  <span className="text-gray-500">
                                                    ({formatDuration(video.duration || 0)})
                                                  </span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                  video.status === 'published'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                  {video.status === 'published' ? 'Công khai' : 'Nháp'}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 ml-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      {permissions.canEditLessons ? (
                                        <Tooltip title="Sửa bài học">
                                          <Button
                                            type="text"
                                            size="large"
                                            icon={<EditOutlined />}
                                            onClick={() => handleEditLesson(lesson)}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                                          />
                                        </Tooltip>
                                      ) : (
                                        <Tooltip title="Không thể chỉnh sửa khi đã có học viên">
                                          <Button
                                            type="text"
                                            size="large"
                                            icon={<LockOutlined />}
                                            disabled
                                            className="text-gray-400 rounded-xl"
                                          />
                                        </Tooltip>
                                      )}

                                      {permissions.canDeleteLessons ? (
                                        <Tooltip title="Xóa bài học">
                                          <Button
                                            type="text"
                                            size="large"
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDeleteLesson(lesson)}
                                            loading={deletingLesson}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                          />
                                        </Tooltip>
                                      ) : (
                                        <Tooltip title="Không thể xóa khi đã có học viên">
                                          <Button
                                            type="text"
                                            size="large"
                                            icon={<LockOutlined />}
                                            disabled
                                            className="text-gray-400 rounded-xl"
                                          />
                                        </Tooltip>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {permissions.canAddLessons && (
                              <div className="text-center py-8">
                                <Button
                                  type="dashed"
                                  icon={<PlusOutlined />}
                                  onClick={() => handleAddLesson(section)}
                                  className="border-3 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 rounded-2xl"
                                  size="large"
                                >
                                  Thêm bài học mới
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-16">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 border-3 border-dashed border-gray-300">
                              <FileTextOutlined className="text-6xl text-gray-400 mb-6" />
                              <h3 className="text-2xl font-semibold text-gray-600 mb-3">
                                Chưa có bài học nào
                              </h3>
                              <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
                                Bắt đầu thêm bài học đầu tiên cho chương này
                              </p>
                              {permissions.canAddLessons && (
                                <Button
                                  type="primary"
                                  icon={<PlusOutlined />}
                                  onClick={() => handleAddLesson(section)}
                                  size="large"
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl px-8 py-4 h-auto text-lg"
                                >
                                  Thêm bài học đầu tiên
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </Panel>
                    ))}
                  </Collapse>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 border-3 border-dashed border-gray-300">
                      <FileTextOutlined className="text-6xl text-gray-400 mb-6" />
                      <h3 className="text-2xl font-semibold text-gray-600 mb-3">
                        Chưa có chương học nào
                      </h3>
                      <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
                        Bắt đầu tạo chương học đầu tiên cho khóa học này
                      </p>
                      {permissions.canAddLessons && (
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddSection}
                          size="large"
                          className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl px-8 py-4 h-auto text-lg"
                        >
                          Thêm chương học đầu tiên
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </Col>

            <Col span={8}>
              {/* Thumbnail Upload */}
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <UploadOutlined className="text-white" />
                    </div>
                    <span className="text-lg font-semibold">Ảnh đại diện</span>
                  </div>
                }
                className="mb-8 border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Form.Item name="thumbnail">
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                    accept="image/*"
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                    disabled={!permissions.canEditBasicInfo}
                    className="rounded-xl"
                  >
                    {fileList.length < 1 && (
                      <div className="text-center">
                        <PlusOutlined className="text-2xl text-blue-500 mb-2" />
                        <div className="text-blue-600 font-medium">Tải ảnh</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
                <Text type="secondary" className="text-xs leading-relaxed">
                  Kích thước khuyến nghị: 800x450px. Định dạng: JPG, PNG, GIF.
                </Text>
              </Card>

              {/* Course Statistics */}
              {course && (
                <Card 
                  title={
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <BarChartOutlined className="text-white" />
                      </div>
                      <span className="text-lg font-semibold">Thống kê khóa học</span>
                    </div>
                  }
                  className="border-0 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{course.views || 0}</div>
                        <div className="text-sm text-blue-700">Lượt xem</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{course.rating ? `${course.rating}/5` : '0'}</div>
                        <div className="text-sm text-green-700">Đánh giá</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">{course.totalReviews || 0}</div>
                        <div className="text-sm text-purple-700">Số đánh giá</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                        <div className="text-2xl font-bold text-orange-600">{course.enrolledCount || 0}</div>
                        <div className="text-sm text-orange-700">Học viên</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Số chương:</span>
                        <span className="font-semibold text-gray-800">{course.sections?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Tổng bài học:</span>
                        <span className="font-semibold text-gray-800">{course.sections?.reduce((total, section) => total + (section.lessons?.length || 0), 0) || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Bài học có video:</span>
                        <span className="font-semibold text-gray-800">{course.sections?.reduce((total, section) =>
                          total + (section.lessons?.filter(lesson =>
                            (lesson.videos && lesson.videos.length > 0) || lesson.video
                          )?.length || 0), 0) || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Bài học có quiz:</span>
                        <span className="font-semibold text-gray-800">{course.sections?.reduce((total, section) =>
                          total + (section.lessons?.filter(lesson => lesson.quiz)?.length || 0), 0) || 0}</span>
                      </div>
                    </div>

                    <Divider className="my-4" />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Ngày tạo:</span>
                        <span className="font-semibold text-gray-800">{new Date(course.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Cập nhật lần cuối:</span>
                        <span className="font-semibold text-gray-800">{new Date(course.updatedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-gray-600 mb-2">Slug:</div>
                        <Text code className="text-xs break-all">{course.slug}</Text>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </Col>
          </Row>

          <Divider className="my-8" />

          <Form.Item>
            <div className="flex items-center justify-center gap-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={<SaveOutlined />}
                disabled={!permissions.canEditBasicInfo}
                size="large"
                className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-8 py-4 h-auto text-lg"
              >
                Cập nhật khóa học
              </Button>
              <Button 
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn hủy không?')) {
                    navigate("/instructor/courses");
                  }
                }}
                size="large"
                className="rounded-xl px-8 py-4 h-auto text-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              >
                Hủy
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      {/* Reapproval Modal */}
      <Modal
        title="Yêu cầu duyệt lại"
        open={showReapprovalModal}
        onOk={() => {
          const values = form.getFieldsValue();
          saveCourse(values);
        }}
        onCancel={() => setShowReapprovalModal(false)}
        okText="Gửi duyệt lại"
        cancelText="Hủy"
      >
        <p>
          Bạn đã thực hiện thay đổi quan trọng đến khóa học.
          Khóa học sẽ được chuyển về trạng thái "Chờ duyệt" và cần được admin duyệt lại.
        </p>
        <p>Bạn có muốn tiếp tục không?</p>
      </Modal>

      {/* Lesson Edit Modal */}
      <Modal
        title={`Chỉnh sửa bài học - ${selectedLesson?.title}`}
        open={showLessonModal}
        onOk={() => lessonForm.submit()}
        onCancel={() => {
          setShowLessonModal(false);
          lessonForm.resetFields();
        }}
        okText="Lưu bài học"
        cancelText="Hủy"
        width={800}
        confirmLoading={savingLesson}
      >
        <Form
          form={lessonForm}
          layout="vertical"
          onFinish={handleSaveLesson}
        >
          {/* Basic Lesson Information */}
          <Card title="Thông tin bài học" className="mb-4">
            <Form.Item
              label="Tiêu đề bài học"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề bài học!" }]}
            >
              <Input placeholder="Nhập tiêu đề bài học" />
            </Form.Item>

            <Form.Item
              label="Cho phép xem trước"
              name="is_preview"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Có"
                unCheckedChildren="Không"
              />
            </Form.Item>
          </Card>

          {/* Video Section */}
          <Card title="Video bài học" className="mb-4">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <InfoCircleOutlined className="text-blue-600" />
                <span className="text-sm text-blue-700">
                  Mỗi bài học chỉ có thể thêm 1 video.
                </span>
              </div>
            </div>

            <Form.List name="videos">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Card key={key} title={`Video ${name + 1}`} className="mb-4">
                      <Form.Item
                        name={[name, 'status']}
                        label="Trạng thái video"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                      >
                        <Select placeholder="Chọn trạng thái video">
                          <Select.Option value="draft">Nháp</Select.Option>
                          <Select.Option value="published">Công khai</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name={[name, 'description']}
                        label="Mô tả video"
                      >
                        <TextArea rows={2} placeholder="Mô tả video (tùy chọn)" />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name={[name, 'duration']}
                            label="Thời lượng (giây)"
                            rules={[{ required: true, message: "Vui lòng nhập thời lượng!" }]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={1}
                              placeholder="Nhập thời lượng video tính bằng giây"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name={[name, 'video_file']}
                            label="File video"
                            rules={[
                              {
                                validator: (_, value) => {
                                  // Kiểm tra xem có video có sẵn hoặc file mới không
                                  const hasExistingVideo = videoFileList[name] && videoFileList[name].url;
                                  const hasNewFile = value && value.fileList && value.fileList.length > 0;

                                  if (hasExistingVideo || hasNewFile) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error('Vui lòng tải lên video hoặc sử dụng video có sẵn!'));
                                }
                              }
                            ]}
                          >
                              <Upload
                              listType="picture-card"
                              maxCount={1}
                              accept="video/*"
                              beforeUpload={() => false}
                              fileList={videoFileList[name] ? [videoFileList[name]] : []}
                              onChange={(info) => {
                                console.log(`Upload onChange for video ${name}:`, info);
                                // Cập nhật videoFileList khi có file mới
                                if (info.fileList.length > 0) {
                                  setVideoFileList(prev => {
                                    const newList = {
                                      ...prev,
                                      [name]: info.fileList[0]
                                    };
                                    console.log('Updated videoFileList:', newList);
                                    return newList;
                                  });

                                  const file = info.fileList[0].originFileObj;
                                  if (file) {
                                    console.log(`File uploaded for video ${name}:`, file);
                                    // Tự động lấy thời lượng video
                                    const video = document.createElement('video');
                                    video.preload = 'metadata';
                                    video.onloadedmetadata = () => {
                                      const duration = Math.round(video.duration);
                                      console.log(`Duration for video ${name}:`, duration);
                                      lessonForm.setFieldsValue({
                                        videos: lessonForm.getFieldValue('videos').map((v: any, index: number) =>
                                          index === name ? { ...v, duration } : v
                                        )
                                      });
                                    };
                                    video.src = URL.createObjectURL(file);
                                  }
                                } else {
                                  // Xóa file khỏi videoFileList
                                  setVideoFileList(prev => {
                                    const newList = { ...prev };
                                    delete newList[name];
                                    console.log('Removed file from videoFileList:', newList);
                                    return newList;
                                  });
                                }
                              }}
                                onPreview={(file) => openVideoPreview(file)}
                              >
                              <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Tải lên video</div>
                              </div>
                            </Upload>
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Hiển thị video có sẵn nếu có (chỉ trong modal chỉnh sửa) */}
                      {selectedLesson?.videos && selectedLesson.videos[name] && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <PlayCircleOutlined className="text-blue-600 text-lg" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  Video hiện tại: {selectedLesson.videos[name].title || `Video ${name + 1}`}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Thời lượng: {formatDuration(selectedLesson.videos[name].duration || 0)}
                                </div>
                                {selectedLesson.videos[name].description && (
                                  <div className="text-sm text-gray-500">
                                    Mô tả: {selectedLesson.videos[name].description}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="text"
                                size="small"
                                icon={<PlayCircleOutlined />}
                                onClick={() => {
                                  if (selectedLesson.videos && selectedLesson.videos[name]) {
                                    window.open(selectedLesson.videos[name].url, '_blank');
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Xem
                              </Button>
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                loading={deletingVideo}
                                onClick={() => {
                                  if (selectedLesson.videos && selectedLesson.videos[name]) {
                                    handleDeleteVideo(
                                      selectedLesson.videos[name]._id,
                                      selectedLesson.videos[name].title || `Video ${name + 1}`
                                    );
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                Xóa
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      >
                        Xóa video
                      </Button>
                    </Card>
                  ))}
                  {fields.length === 0 && (
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      block
                    >
                      Thêm video
                    </Button>
                  )}
                  {fields.length > 0 && (
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      block
                    >
                      Thêm video khác
                    </Button>
                  )}
                </>
              )}
            </Form.List>

            <div style={{ color: '#888', fontSize: '12px' }}>
              <InfoCircleOutlined /> Hỗ trợ định dạng: MP4, AVI, MOV, WMV. Kích thước tối đa: 500MB.
            </div>
          </Card>

          {/* Quiz Section */}
          <Card title="Quiz bài học">
            <Form.List name="questions">
              {(fields, { add, remove, move }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <div
                      key={key}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggingQuestionIdx !== null && draggingQuestionIdx !== name) {
                          move(draggingQuestionIdx, name);
                        }
                        setDraggingQuestionIdx(null);
                      }}
                      style={{ marginBottom: '16px' }}
                    >
                      <Card
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{`Câu hỏi ${name + 1}`}</span>
                            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', color: '#888' }}
                              draggable
                              onDragStart={() => setDraggingQuestionIdx(name)}
                              onDragEnd={() => setDraggingQuestionIdx(null)}
                            >
                              <DragOutlined style={{ cursor: 'grab' }} />
                            </span>
                          </div>
                        }
                        className="mb-0"
                      >
                      <Form.Item
                        name={[name, 'question']}
                        label="Câu hỏi"
                        rules={[{ required: true, message: "Vui lòng nhập câu hỏi!" }]}
                      >
                        <TextArea rows={2} placeholder="Nhập câu hỏi" />
                      </Form.Item>

                      <Form.List name={[name, 'options']}>
                        {(optionFields, { add: addOption, remove: removeOption }) => (
                          <>
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ marginBottom: '8px', fontWeight: '500', color: '#666' }}>
                                Lựa chọn (tích vào ô bên trái để chọn đáp án đúng):
                              </div>
                              {/* Hidden field to hold correctIndex and enable validation */}
                              <Form.Item
                                name={[name, 'correctIndex']}
                                rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng!' }]}
                                style={{ display: 'none' }}
                              >
                                <Input />
                              </Form.Item>
                              {optionFields.map(({ key: optionKey, name: optionName }) => (
                                <div key={optionKey} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  marginBottom: '8px',
                                  padding: '8px',
                                  border: '1px solid #d9d9d9',
                                  borderRadius: '6px',
                                  backgroundColor: '#fafafa'
                                }}>
                                  <Radio
                                    checked={lessonForm.getFieldValue(['questions', name, 'correctIndex']) === optionName}
                                    onChange={() => lessonForm.setFieldValue(['questions', name, 'correctIndex'], optionName)}
                                    style={{ marginRight: '8px' }}
                                  />
                                  <Form.Item
                                    name={[name, 'options', optionName]}
                                    style={{ flex: 1, marginBottom: 0 }}
                                    rules={[{ required: true, message: 'Vui lòng nhập lựa chọn!' }]}
                                  >
                                    <Input
                                      placeholder={`Nhập lựa chọn ${optionName + 1}`}
                                      style={{ border: 'none', backgroundColor: 'transparent' }}
                                    />
                                  </Form.Item>
                                  {optionFields.length > 2 && (
                                    <Button
                                      type="text"
                                      danger
                                      size="small"
                                      icon={<DeleteOutlined />}
                                      onClick={() => removeOption(optionName)}
                                      style={{ marginLeft: '8px' }}
                                    >
                                      Xóa
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                            <Button
                              type="dashed"
                              onClick={() => addOption()}
                              icon={<PlusOutlined />}
                              block
                            >
                              Thêm lựa chọn
                            </Button>
                          </>
                        )}
                      </Form.List>

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      >
                        Xóa câu hỏi
                      </Button>
                    </Card>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({
                      question: '',
                      options: ['', ''], // Khởi tạo với 2 lựa chọn mặc định
                      correctIndex: 0
                    })}
                    icon={<PlusOutlined />}
                    block
                  >
                    Thêm câu hỏi
                  </Button>
                </>
              )}
            </Form.List>
          </Card>
        </Form>
      </Modal>

      {/* Add New Lesson Modal */}
      <Modal
        title="Thêm bài học mới"
        open={showAddLessonModal}
        onOk={() => lessonForm.submit()}
        onCancel={() => {
          setShowAddLessonModal(false);
          lessonForm.resetFields();
          setVideoFileList({});
        }}
        okText="Thêm bài học"
        cancelText="Hủy"
        width={800}
        confirmLoading={savingLesson}
      >
        <Form
          form={lessonForm}
          layout="vertical"
          onFinish={handleSaveNewLesson}
        >
          {/* Basic Lesson Information */}
          <Card title="Thông tin bài học" className="mb-4">
            <Form.Item
              label="Tiêu đề bài học"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề bài học!" }]}
            >
              <Input placeholder="Nhập tiêu đề bài học" />
            </Form.Item>

            <Form.Item
              label="Cho phép xem trước"
              name="is_preview"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Có"
                unCheckedChildren="Không"
              />
            </Form.Item>
          </Card>

          {/* Video Section */}
          <Card title="Video bài học" className="mb-4">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <InfoCircleOutlined className="text-blue-600" />
                <span className="text-sm text-blue-700">
                  Mỗi bài học chỉ cho phép tải lên 1 file video.
                </span>
              </div>
            </div>

            <Form.Item
              name="video_status"
              label="Trạng thái video"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái video">
                <Select.Option value="draft">Nháp</Select.Option>
                <Select.Option value="published">Công khai</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="video_description"
              label="Mô tả video"
            >
              <TextArea rows={2} placeholder="Mô tả video (tùy chọn)" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="video_duration"
                  label="Thời lượng (giây)"
                  rules={[{ required: true, message: "Vui lòng nhập thời lượng!" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    placeholder="Nhập thời lượng video tính bằng giây"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="video_file"
                  label="File video"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng tải lên video!"
                    }
                  ]}
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    accept="video/*"
                    beforeUpload={() => false}
                    onChange={(info) => {
                      console.log('Add Lesson - Upload onChange:', info);
                      // Cập nhật videoFileList khi có file mới
                      if (info.fileList.length > 0) {
                        setVideoFileList(prev => {
                          const newList = {
                            ...prev,
                            newLesson: info.fileList[0]
                          };
                          console.log('Add Lesson - Updated videoFileList:', newList);
                          return newList;
                        });

                        const file = info.fileList[0].originFileObj;
                        if (file) {
                          console.log('Add Lesson - File uploaded:', file);
                          // Tự động lấy thời lượng video
                          const video = document.createElement('video');
                          video.preload = 'metadata';
                          video.onloadedmetadata = () => {
                            const duration = Math.round(video.duration);
                            console.log('Add Lesson - Duration:', duration);
                            lessonForm.setFieldsValue({
                              video_duration: duration
                            });
                          };
                          video.src = URL.createObjectURL(file);
                        }
                      } else {
                        // Xóa file khỏi videoFileList
                        setVideoFileList(prev => {
                          const newList = { ...prev };
                          delete newList.newLesson;
                          console.log('Add Lesson - Removed file from videoFileList:', newList);
                          return newList;
                        });
                      }
                    }}
                    onPreview={(file) => openVideoPreview(file)}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên video</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <div style={{ color: '#888', fontSize: '12px' }}>
              <InfoCircleOutlined /> Hỗ trợ định dạng: MP4, AVI, MOV, WMV. Kích thước tối đa: 500MB.
            </div>
          </Card>

          {/* Quiz Section */}
          <Card title="Quiz bài học">
            <Form.List name="questions">
              {(fields, { add, remove, move }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <div
                      key={key}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggingQuestionIdx !== null && draggingQuestionIdx !== name) {
                          move(draggingQuestionIdx, name);
                        }
                        setDraggingQuestionIdx(null);
                      }}
                      style={{ marginBottom: '16px' }}
                    >
                      <Card
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{`Câu hỏi ${name + 1}`}</span>
                            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', color: '#888' }}
                              draggable
                              onDragStart={() => setDraggingQuestionIdx(name)}
                              onDragEnd={() => setDraggingQuestionIdx(null)}
                            >
                              <DragOutlined style={{ cursor: 'grab' }} />
                            </span>
                          </div>
                        }
                        className="mb-0"
                      >
                      <Form.Item
                        name={[name, 'question']}
                        label="Câu hỏi"
                        rules={[{ required: true, message: "Vui lòng nhập câu hỏi!" }]}
                      >
                        <TextArea rows={2} placeholder="Nhập câu hỏi" />
                      </Form.Item>

                      <Form.List name={[name, 'options']}>
                        {(optionFields, { add: addOption, remove: removeOption }) => (
                          <>
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ marginBottom: '8px', fontWeight: '500', color: '#666' }}>
                                Lựa chọn (tích vào ô bên trái để chọn đáp án đúng):
                              </div>
                              <Form.Item
                                name={[name, 'correctIndex']}
                                style={{ marginBottom: 0 }}
                                rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng!' }]}
                              >
                                <Radio.Group>
                                  {optionFields.map(({ key: optionKey, name: optionName }) => (
                                    <div key={optionKey} style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      marginBottom: '8px',
                                      padding: '8px',
                                      border: '1px solid #d9d9d9',
                                      borderRadius: '6px',
                                      backgroundColor: '#fafafa'
                                    }}>
                                      <Radio value={optionName} style={{ marginRight: '8px' }} />
                                      <Form.Item
                                        name={[name, 'options', optionName]}
                                        style={{ flex: 1, marginBottom: 0 }}
                                        rules={[{ required: true, message: 'Vui lòng nhập lựa chọn!' }]}
                                      >
                                        <Input
                                          placeholder={`Nhập lựa chọn ${optionName + 1}`}
                                          style={{ border: 'none', backgroundColor: 'transparent' }}
                                        />
                                      </Form.Item>
                                      {optionFields.length > 2 && (
                                        <Button
                                          type="text"
                                          danger
                                          size="small"
                                          icon={<DeleteOutlined />}
                                          onClick={() => removeOption(optionName)}
                                          style={{ marginLeft: '8px' }}
                                        >
                                          Xóa
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </Radio.Group>
                              </Form.Item>
                            </div>
                            <Button
                              type="dashed"
                              onClick={() => addOption()}
                              icon={<PlusOutlined />}
                              block
                            >
                              Thêm lựa chọn
                            </Button>
                          </>
                        )}
                      </Form.List>

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      >
                        Xóa câu hỏi
                      </Button>
                    </Card>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({
                      question: '',
                      options: ['', ''], // Khởi tạo với 2 lựa chọn mặc định
                      correctIndex: 0
                    })}
                    icon={<PlusOutlined />}
                    block
                  >
                    Thêm câu hỏi
                  </Button>
                </>
              )}
            </Form.List>
          </Card>
        </Form>
      </Modal>

      {/* Video Preview Modal */}
      <Modal
        title="Xem trước video"
        open={showVideoPreview}
        onCancel={closeVideoPreview}
        footer={null}
        width={900}
        destroyOnClose
      >
        {previewVideoUrl ? (
          <video
            src={previewVideoUrl}
            controls
            style={{ width: '100%', borderRadius: 8 }}
          />
        ) : (
          <Alert type="info" message="Không có video để xem trước" />
        )}
      </Modal>

      {/* Section Edit Modal */}
      <Modal
        title={`Chỉnh sửa chương - ${selectedSection?.title}`}
        open={showSectionEditModal}
        onOk={() => sectionForm.submit()}
        onCancel={() => {
          setShowSectionEditModal(false);
          sectionForm.resetFields();
        }}
        okText="Lưu chương"
        cancelText="Hủy"
        width={600}
        confirmLoading={savingSection}
      >
        <Form
          form={sectionForm}
          layout="vertical"
          onFinish={handleSaveSection}
        >
          <Form.Item
            label="Tiêu đề chương"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề chương!" }]}
          >
            <Input placeholder="Nhập tiêu đề chương" />
          </Form.Item>
          <Form.Item
            label="Mô tả chương"
            name="description"
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết cho chương (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Section Modal */}
      <Modal
        title="Thêm chương học mới"
        open={showAddSectionModal}
        onOk={() => sectionForm.submit()}
        onCancel={() => {
          setShowAddSectionModal(false);
          sectionForm.resetFields();
        }}
        okText="Thêm chương"
        cancelText="Hủy"
        width={600}
        confirmLoading={savingSection}
      >
        <Form
          form={sectionForm}
          layout="vertical"
          onFinish={handleSaveNewSection}
        >
          <Form.Item
            label="Tiêu đề chương"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề chương!" }]}
          >
            <Input placeholder="Nhập tiêu đề chương" />
          </Form.Item>
          <Form.Item
            label="Mô tả chương"
            name="description"
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết cho chương (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EditCourse;
