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
  { label: "English", value: "en" },
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
  language: string;
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
  const [videoFileList, setVideoFileList] = useState<{ [key: number]: any }>({});

  // New modal states
  const [showSectionEditModal, setShowSectionEditModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [sectionForm] = Form.useForm();

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
      videos: [{}], // Tạo 1 video entry mặc định
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
      console.log('Values videos:', values.videos);
      console.log('Video file list:', videoFileList);

      if (values.videos && values.videos.length > 0) {
        // Xử lý từng video có file thực sự
        for (let i = 0; i < values.videos.length; i++) {
          const videoData = values.videos[i];
          const videoFile = videoFileList[i]?.originFileObj;

          console.log(`Video ${i}:`, { videoData, videoFile, hasFile: !!videoFile, hasStatus: !!videoData.status });

          // Chỉ tạo video nếu có file và status
          if (videoFile && videoData.status) {
            console.log(`Creating video ${i}...`);
            const formData = new FormData();
            formData.append('lesson_id', newLesson[0]._id); // Lấy lesson ID từ response
            formData.append('video', videoFile);
            formData.append('description', videoData.description || '');
            formData.append('duration', videoData.duration?.toString() || '0');
            formData.append('status', videoData.status || 'draft');

            await createVideo(newLesson[0]._id, formData);
            console.log(`Video ${i} created successfully`);
          } else {
            console.log(`Skipping video ${i} - no file or status`);
          }
        }
      } else {
        console.log('No videos to process');
      }

      // Xử lý quiz nếu có
      if (values.questions && values.questions.length > 0) {
        await createQuiz(newLesson[0]._id, {
          questions: values.questions
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
      if (values.questions && values.questions.length > 0) {
        if (selectedLesson.quiz) {
          await updateQuiz(selectedLesson.quiz._id, {
            questions: values.questions
          });
        } else {
          await createQuiz(selectedLesson._id, {
            questions: values.questions
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
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-6xl mx-auto mt-6">
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
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-6">
      {/* Course Info Header */}
      {course && (
        <Card className="mb-6">
          <Row gutter={16} align="middle">
            <Col span={4}>
              <img
                src={course.thumbnail}
                alt={course.title}
                style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </Col>
            <Col span={20}>
              <Title level={3} style={{ margin: 0 }}>{course.title}</Title>
              <Space size="small" className="mt-2">
                <Tag color="blue">{course.category?.name}</Tag>
                <Tag color="green">{levels.find(l => l.value === course.level)?.label}</Tag>
                <Tag color="orange">{languages.find(l => l.value === course.language)?.label}</Tag>
                <Tag color={getStatusColor(course.status)}>
                  {statuses.find(s => s.value === course.status)?.label}
                </Tag>
                {course.enrolledCount && course.enrolledCount > 0 && (
                  <Tag color="purple">👥 {course.enrolledCount} học viên</Tag>
                )}
                {course.views && <Tag color="purple">👁 {course.views} lượt xem</Tag>}
                {course.rating && <Tag color="gold">⭐ {course.rating}/5 ({course.totalReviews} đánh giá)</Tag>}
              </Space>
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
          className="mb-6"
        />
      )}

      <Card
        title={
          <Space>
            <InfoCircleOutlined />
            <span>Chỉnh sửa thông tin khóa học</span>
            {!permissions.canEditBasicInfo && (
              <Tag color="red" icon={<LockOutlined />}>
                Chế độ xem chỉ
              </Tag>
            )}
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => form.submit()}
            disabled={!permissions.canEditBasicInfo}
          >
            Lưu thay đổi
          </Button>
        }
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
          <Row gutter={24}>
            <Col span={16}>
              {/* Basic Information */}
              <Card title="Thông tin cơ bản" className="mb-6">
                <Form.Item
                  label="Tiêu đề khóa học"
                  name="title"
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                >
                  <Input placeholder="Nhập tiêu đề khóa học" />
                </Form.Item>

                <Form.Item
                  label="Mô tả"
                  name="description"
                  rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Mô tả chi tiết về khóa học"
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
                      <Select placeholder="Chọn trình độ">
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
                      label="Ngôn ngữ"
                      name="language"
                      rules={[{ required: true, message: "Chọn ngôn ngữ!" }]}
                    >
                      <Select placeholder="Chọn ngôn ngữ">
                        {languages.map(lang => (
                          <Select.Option key={lang.value} value={lang.value}>
                            {lang.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Trạng thái"
                      name="status"
                      rules={[{ required: true, message: "Chọn trạng thái!" }]}
                    >
                      <Select placeholder="Chọn trạng thái">
                        {statuses.map(status => (
                          <Select.Option key={status.value} value={status.value}>
                            {status.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Trạng thái hiển thị"
                  name="displayStatus"
                  rules={[{ required: true, message: "Chọn trạng thái hiển thị!" }]}
                >
                  <Select placeholder="Chọn trạng thái hiển thị">
                    {displayStatuses.map(status => (
                      <Select.Option key={status.value} value={status.value}>
                        {status.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {course?.rejection_reason && (
                  <Form.Item
                    label="Lý do từ chối"
                    name="rejection_reason"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Lý do từ chối (nếu có)"
                      disabled
                    />
                  </Form.Item>
                )}
              </Card>

              {/* Pricing Information */}
              <Card
                title="Thông tin giá"
                className="mb-6"
                extra={
                  !permissions.canEditPricing && (
                    <Tag color="red" icon={<LockOutlined />}>
                      Không thể chỉnh sửa
                    </Tag>
                  )
                }
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
                        placeholder="Nhập giá khóa học (0 = miễn phí)"
                        formatter={(value) =>
                          value !== undefined && value !== null
                            ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            : ''
                        }
                        disabled={!permissions.canEditPricing}
                      />
                    </Form.Item>
                    <div style={{ color: '#888', fontSize: 12, marginTop: -12, marginBottom: 12 }}>
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
              <Card title="Yêu cầu trước khóa học" className="mb-6">
                <Form.List name="requirements">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name }) => (
                        <Space key={key} align="baseline" className="mb-2">
                          <Form.Item
                            name={name}
                            rules={[{ required: true, message: "Nhập nội dung yêu cầu" }]}
                          >
                            <Input
                              placeholder="VD: Có kiến thức cơ bản về JavaScript"
                              style={{ width: 400 }}
                              disabled={!permissions.canEditContent}
                            />
                          </Form.Item>
                          {permissions.canEditContent && (
                            <MinusCircleOutlined
                              onClick={() => remove(name)}
                              style={{ color: '#ff4d4f' }}
                            />
                          )}
                        </Space>
                      ))}
                      {permissions.canEditContent && (
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            icon={<PlusOutlined />}
                            block
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
                title="Chương trình học"
                extra={
                  <Space>
                    {permissions.canAddLessons && (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddSection}
                        size="small"
                      >
                        Thêm chương
                      </Button>
                    )}
                    {!permissions.canEditContent && (
                      <Tag color="orange" icon={<InfoCircleOutlined />}>
                        Chỉ được thêm mới
                      </Tag>
                    )}
                  </Space>
                }
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
                        className="mb-4 border border-gray-200 rounded-xl shadow-sm bg-white"
                        header={
                          <div className="flex items-center justify-between w-full py-2">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl text-lg font-bold shadow-sm">
                                {sectionIndex + 1}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {section.title}
                                </h3>
                                {section.description && (
                                  <p className="text-sm text-gray-500 line-clamp-1">
                                    {section.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                                <FileTextOutlined className="text-blue-600 text-sm" />
                                <span className="text-sm font-medium text-blue-700">
                                  {section.lessons?.length || 0} bài học
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {permissions.canEditContent && (
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditSection(section);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    Sửa chương
                                  </Button>
                                )}
                                {permissions.canEditContent && (
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSection(section);
                                    }}
                                    loading={deletingSection}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Xóa chương
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        }
                      >
                        {section.lessons && section.lessons.length > 0 ? (
                          <>
                            <div className="space-y-3">
                              {section.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson._id}
                                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 group"
                                >
                                  <div className="flex items-start justify-between">
                                    {/* Lesson Info */}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                                          {lessonIndex + 1}
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="text-base font-semibold text-gray-900 mb-1">
                                            {lesson.title}
                                          </h4>
                                          <div className="flex items-center gap-2">
                                            {lesson.is_preview && (
                                              <Tag color="green" icon={<EyeOutlined />} className="text-xs">
                                                Xem trước
                                              </Tag>
                                            )}
                                            <span className="text-xs text-gray-500">
                                              Bài học #{lesson.position || lessonIndex + 1}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Lesson Content Status */}
                                      <div className="flex items-center gap-4">
                                        {/* Video Status */}
                                        <div className="flex items-center gap-2">
                                          {(lesson.videos && lesson.videos.length > 0) || lesson.video ? (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                                              <PlayCircleOutlined className="text-green-600 text-sm" />
                                              <span className="text-xs font-medium text-green-700">
                                                {lesson.videos ? lesson.videos.length : 1} video
                                                {lesson.videos && lesson.videos.length > 0 && (
                                                  <span className="ml-1">
                                                    ({lesson.videos.reduce((total, v) => total + (v.duration || 0), 0) > 0
                                                      ? formatDuration(lesson.videos.reduce((total, v) => total + (v.duration || 0), 0))
                                                      : 'N/A'})
                                                  </span>
                                                )}
                                                {lesson.videos && lesson.videos.length > 1 && (
                                                  <span className="ml-1 text-blue-600">
                                                    (Nhiều video)
                                                  </span>
                                                )}
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full">
                                              <VideoCameraOutlined className="text-orange-600 text-sm" />
                                              <span className="text-xs font-medium text-orange-700">
                                                Chưa có video
                                              </span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Quiz Status */}
                                        <div className="flex items-center gap-2">
                                          {lesson.quiz ? (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full">
                                              <QuestionCircleOutlined className="text-purple-600 text-sm" />
                                              <span className="text-xs font-medium text-purple-700">
                                                {lesson.quiz.questions?.length || 0} câu hỏi
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full">
                                              <QuestionCircleOutlined className="text-orange-600 text-sm" />
                                              <span className="text-xs font-medium text-orange-700">
                                                Chưa có quiz
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Hiển thị danh sách video chi tiết nếu có nhiều video */}
                                      {lesson.videos && lesson.videos.length > 1 && (
                                        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                          <div className="text-xs text-gray-600 mb-2">Danh sách video:</div>
                                          <div className="space-y-1">
                                            {lesson.videos.map((video, index) => (
                                              <div key={video._id} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                  <PlayCircleOutlined className="text-blue-500" />
                                                  <span className="text-gray-700">
                                                    {video.title || `Video ${index + 1}`}
                                                  </span>
                                                  <span className="text-gray-500">
                                                    ({formatDuration(video.duration || 0)})
                                                  </span>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs ${video.status === 'published'
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
                                    <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      {permissions.canEditLessons ? (
                                        <Tooltip title="Sửa bài học">
                                          <Button
                                            type="text"
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={() => handleEditLesson(lesson)}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          />
                                        </Tooltip>
                                      ) : (
                                        <Tooltip title="Không thể chỉnh sửa khi đã có học viên">
                                          <Button
                                            type="text"
                                            size="small"
                                            icon={<LockOutlined />}
                                            disabled
                                            className="text-gray-400"
                                          />
                                        </Tooltip>
                                      )}

                                      {permissions.canDeleteLessons ? (
                                        <Tooltip title="Xóa bài học">
                                          <Button
                                            type="text"
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDeleteLesson(lesson)}
                                            loading={deletingLesson}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                          />
                                        </Tooltip>
                                      ) : (
                                        <Tooltip title="Không thể xóa khi đã có học viên">
                                          <Button
                                            type="text"
                                            size="small"
                                            icon={<LockOutlined />}
                                            disabled
                                            className="text-gray-400"
                                          />
                                        </Tooltip>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {permissions.canAddLessons && (
                              <div className="text-center py-6">
                                <Button
                                  type="dashed"
                                  icon={<PlusOutlined />}
                                  onClick={() => handleAddLesson(section)}
                                  className="border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50"
                                  size="large"
                                >
                                  Thêm bài học mới
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-12">
                            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-200">
                              <FileTextOutlined className="text-4xl text-gray-400 mb-4" />
                              <h3 className="text-lg font-medium text-gray-600 mb-2">
                                Chưa có bài học nào
                              </h3>
                              <p className="text-sm text-gray-500 mb-6">
                                Bắt đầu thêm bài học đầu tiên cho chương này
                              </p>
                              {permissions.canAddLessons && (
                                <Button
                                  type="primary"
                                  icon={<PlusOutlined />}
                                  onClick={() => handleAddLesson(section)}
                                  size="large"
                                  className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
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
                  <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-200">
                      <FileTextOutlined className="text-4xl text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Chưa có chương học nào
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">
                        Bắt đầu tạo chương học đầu tiên cho khóa học này
                      </p>
                      {permissions.canAddLessons && (
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddSection}
                          size="large"
                          className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
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
              <Card title="Ảnh đại diện" className="mb-6">
                <Form.Item name="thumbnail">
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                    accept="image/*"
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                    disabled={!permissions.canEditBasicInfo}
                  >
                    {fileList.length < 1 && (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Kích thước khuyến nghị: 800x450px. Định dạng: JPG, PNG, GIF.
                </Text>
              </Card>

              {/* Course Statistics */}
              {course && (
                <Card title="Thống kê khóa học">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Lượt xem">
                      {course.views || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Đánh giá trung bình">
                      {course.rating ? `${course.rating}/5` : 'Chưa có'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số đánh giá">
                      {course.totalReviews || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Học viên đã đăng ký">
                      {course.enrolledCount || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số chương">
                      {course.sections?.length || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng bài học">
                      {course.sections?.reduce((total, section) => total + (section.lessons?.length || 0), 0) || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bài học có video">
                      {course.sections?.reduce((total, section) =>
                        total + (section.lessons?.filter(lesson =>
                          (lesson.videos && lesson.videos.length > 0) || lesson.video
                        )?.length || 0), 0) || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bài học có quiz">
                      {course.sections?.reduce((total, section) =>
                        total + (section.lessons?.filter(lesson => lesson.quiz)?.length || 0), 0) || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cập nhật lần cuối">
                      {new Date(course.updatedAt).toLocaleDateString('vi-VN')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Slug">
                      <Text code>{course.slug}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
            </Col>
          </Row>

          <Divider />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={<SaveOutlined />}
                disabled={!permissions.canEditBasicInfo}
              >
                Cập nhật khóa học
              </Button>
              <Button onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn hủy không?')) {
                  navigate("/instructor/courses");
                }
              }}>
                Hủy
              </Button>
            </Space>
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
                  Mỗi bài học có thể có nhiều video. Mỗi video chỉ cho phép tải 1 file video.
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
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Card key={key} title={`Câu hỏi ${name + 1}`} className="mb-4">
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
                            {optionFields.map(({ key: optionKey, name: optionName }) => (
                              <Form.Item
                                key={optionKey}
                                name={optionName}
                                label={`Lựa chọn ${optionName + 1}`}
                                rules={[{ required: true, message: "Vui lòng nhập lựa chọn!" }]}
                              >
                                <Input placeholder={`Nhập lựa chọn ${optionName + 1}`} />
                              </Form.Item>
                            ))}
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

                      <Form.Item
                        name={[name, 'correctIndex']}
                        label="Đáp án đúng"
                        rules={[{ required: true, message: "Vui lòng chọn đáp án đúng!" }]}
                      >
                        <Select placeholder="Chọn đáp án đúng">
                          {(() => {
                            // Lấy số lựa chọn hiện tại của câu hỏi này
                            const currentOptions = lessonForm.getFieldValue(['questions', name, 'options']) || [];
                            const optionCount = currentOptions.length;

                            // Tạo mảng index dựa trên số lựa chọn thực tế
                            return Array.from({ length: Math.max(optionCount, 1) }, (_, index) => (
                              <Select.Option key={index} value={index}>
                                Lựa chọn {index + 1}
                              </Select.Option>
                            ));
                          })()}
                        </Select>
                      </Form.Item>

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      >
                        Xóa câu hỏi
                      </Button>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
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
                  Mỗi bài học có thể có nhiều video. Mỗi video chỉ cho phép tải 1 file video.
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
                              onChange={(info) => {
                                console.log(`Add Lesson - Upload onChange for video ${name}:`, info);
                                // Cập nhật videoFileList khi có file mới
                                if (info.fileList.length > 0) {
                                  setVideoFileList(prev => {
                                    const newList = {
                                      ...prev,
                                      [name]: info.fileList[0]
                                    };
                                    console.log('Add Lesson - Updated videoFileList:', newList);
                                    return newList;
                                  });

                                  const file = info.fileList[0].originFileObj;
                                  if (file) {
                                    console.log(`Add Lesson - File uploaded for video ${name}:`, file);
                                    // Tự động lấy thời lượng video
                                    const video = document.createElement('video');
                                    video.preload = 'metadata';
                                    video.onloadedmetadata = () => {
                                      const duration = Math.round(video.duration);
                                      console.log(`Add Lesson - Duration for video ${name}:`, duration);
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
                                    console.log('Add Lesson - Removed file from videoFileList:', newList);
                                    return newList;
                                  });
                                }
                              }}
                            >
                              <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Tải lên video</div>
                              </div>
                            </Upload>
                          </Form.Item>
                        </Col>
                      </Row>

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
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Card key={key} title={`Câu hỏi ${name + 1}`} className="mb-4">
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
                            {optionFields.map(({ key: optionKey, name: optionName }) => (
                              <Form.Item
                                key={optionKey}
                                name={optionName}
                                label={`Lựa chọn ${optionName + 1}`}
                                rules={[{ required: true, message: "Vui lòng nhập lựa chọn!" }]}
                              >
                                <Input placeholder={`Nhập lựa chọn ${optionName + 1}`} />
                              </Form.Item>
                            ))}
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

                      <Form.Item
                        name={[name, 'correctIndex']}
                        label="Đáp án đúng"
                        rules={[{ required: true, message: "Vui lòng chọn đáp án đúng!" }]}
                      >
                        <Select placeholder="Chọn đáp án đúng">
                          {(() => {
                            // Lấy số lựa chọn hiện tại của câu hỏi này
                            const currentOptions = lessonForm.getFieldValue(['questions', name, 'options']) || [];
                            const optionCount = currentOptions.length;

                            // Tạo mảng index dựa trên số lựa chọn thực tế
                            return Array.from({ length: Math.max(optionCount, 1) }, (_, index) => (
                              <Select.Option key={index} value={index}>
                                Lựa chọn {index + 1}
                              </Select.Option>
                            ));
                          })()}
                        </Select>
                      </Form.Item>

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      >
                        Xóa câu hỏi
                      </Button>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
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
