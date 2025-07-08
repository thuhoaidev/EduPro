import React, { useState, useRef } from 'react';
import { 
  BookOpen, Video, Users, Clock, Plus, Upload, X, ChevronDown, 
  Save, Eye, ArrowLeft, FileText, PlayCircle, Settings, 
  ImageIcon, Star, Award, Target, CheckCircle
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

export default function CreateCourse() {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 'free',
    customPrice: '',
    thumbnail: null,
    thumbnailPreview: null,
    tags: [],
    duration: '',
    whatYouLearn: [''],
    requirements: [''],
    targetAudience: '',
    publishOption: 'draft'
  });

  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    type: 'video'
  });

  const fileInputRef = useRef(null);

  const categories = [
    { id: 'frontend', name: 'Frontend Development', icon: '🎨' },
    { id: 'backend', name: 'Backend Development', icon: '⚙️' },
    { id: 'mobile', name: 'Mobile Development', icon: '📱' },
    { id: 'data', name: 'Data Science', icon: '📊' },
    { id: 'design', name: 'UI/UX Design', icon: '🎭' },
    { id: 'devops', name: 'DevOps', icon: '🚀' },
    { id: 'ml', name: 'Machine Learning', icon: '🤖' }
  ];

  const handleInputChange = (field, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const removeTag = (tagToRemove) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCourseData(prev => ({
          ...prev,
          thumbnail: file,
          thumbnailPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addLesson = () => {
    if (newLesson.title.trim()) {
      setLessons(prev => [...prev, { ...newLesson, id: Date.now() }]);
      setNewLesson({
        title: '',
        description: '',
        videoUrl: '',
        duration: '',
        type: 'video'
      });
      setShowLessonForm(false);
    }
  };

  const removeLesson = (lessonId) => {
    setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
  };

  const saveCourse = (courseToSave) => {
    // Lấy danh sách khóa học hiện tại từ localStorage
    const existingCourses = JSON.parse(localStorage.getItem('instructorCourses') || '[]');
    
    // Thêm khóa học mới
    const updatedCourses = [...existingCourses, courseToSave];
    
    // Lưu vào localStorage
    localStorage.setItem('instructorCourses', JSON.stringify(updatedCourses));
    
    // Lưu thông tin khóa học mới nhất
    localStorage.setItem('latestCourseCreated', JSON.stringify(courseToSave));
  };

  const navigateToMyCourses = () => {
    // Mô phỏng điều hướng đến trang khóa học của giảng viên
    window.location.href = '/instructor/courses';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    if (!courseData.title.trim()) {
      alert('Vui lòng nhập tên khóa học');
      setIsSubmitting(false);
      return;
    }
    if (!courseData.description.trim()) {
      alert('Vui lòng nhập mô tả khóa học');
      setIsSubmitting(false);
      return;
    }
    if (!courseData.category) {
      alert('Vui lòng chọn danh mục');
      setIsSubmitting(false);
      return;
    }

    // Chuẩn bị dữ liệu gửi lên backend
    const payload = {
      ...courseData,
      price: courseData.price === 'free' ? 0 : Number(courseData.customPrice || 0),
      requirements: courseData.requirements,
      sections: lessons.map((lesson, idx) => ({
        title: lesson.title,
        position: idx,
      })),
      // Các trường khác nếu cần
    };

    try {
      // Gọi API tạo khóa học
      await courseService.createCourse(payload);
      alert('🎉 Khóa học đã được tạo thành công!');
      navigateToMyCourses();
    } catch (error) {
      alert('❌ Có lỗi xảy ra khi tạo khóa học. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalDuration = () => {
    if (lessons.length === 0) return '0:00';
    const total = lessons.reduce((sum, lesson) => {
      const [minutes, seconds] = lesson.duration.split(':').map(Number);
      return sum + (minutes || 0) * 60 + (seconds || 0);
    }, 0);
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}:00` : `${mins}:00`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 rounded-xl shadow-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Tạo khóa học mới
                </h1>
                <p className="text-sm text-gray-500">Tạo và quản lý nội dung khóa học chuyên nghiệp</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Eye className="w-4 h-4 mr-2" />
                Xem trước
              </button>
              <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Save className="w-4 h-4 mr-2" />
                Lưu nháp
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tạo khóa học
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              {/* Tabs */}
              <div className="border-b border-gray-200/50">
                <div className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`py-4 border-b-2 font-medium text-sm transition-all ${
                      activeTab === 'basic' 
                        ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Thông tin cơ bản
                  </button>
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`py-4 border-b-2 font-medium text-sm transition-all ${
                      activeTab === 'content' 
                        ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <PlayCircle className="w-4 h-4 inline mr-2" />
                    Nội dung khóa học
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-4 border-b-2 font-medium text-sm transition-all ${
                      activeTab === 'settings' 
                        ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Cài đặt
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'basic' && (
                  <div className="space-y-8">
                    {/* Course Title */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Tên khóa học *
                      </label>
                      <input
                        type="text"
                        value={courseData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Ví dụ: React từ cơ bản đến nâng cao"
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
                      />
                    </div>

                    {/* Description */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Mô tả khóa học *
                      </label>
                      <textarea
                        value={courseData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Mô tả chi tiết về khóa học, nội dung sẽ học được..."
                        rows={6}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm resize-none"
                      />
                    </div>

                    {/* Category & Level */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Danh mục *
                        </label>
                        <div className="relative">
                          <select
                            value={courseData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white/50 backdrop-blur-sm transition-all"
                          >
                            <option value="">Chọn danh mục</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Cấp độ *
                        </label>
                        <div className="relative">
                          <select
                            value={courseData.level}
                            onChange={(e) => handleInputChange('level', e.target.value)}
                            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white/50 backdrop-blur-sm transition-all"
                          >
                            <option value="beginner">🌱 Cơ bản</option>
                            <option value="intermediate">🚀 Trung cấp</option>
                            <option value="advanced">⭐ Nâng cao</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* What You'll Learn */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <Target className="w-4 h-4 inline mr-2" />
                        Những gì học viên sẽ học được
                      </label>
                      {courseData.whatYouLearn.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-3">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayInputChange('whatYouLearn', index, e.target.value)}
                            placeholder="Ví dụ: Làm chủ React hooks và context API"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                          />
                          {courseData.whatYouLearn.length > 1 && (
                            <button
                              onClick={() => removeArrayItem('whatYouLearn', index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addArrayItem('whatYouLearn')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm mục tiêu học tập
                      </button>
                    </div>

                    {/* Requirements */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <Award className="w-4 h-4 inline mr-2" />
                        Yêu cầu trước khi học
                      </label>
                      {courseData.requirements.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-3">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayInputChange('requirements', index, e.target.value)}
                            placeholder="Ví dụ: Biết HTML, CSS cơ bản"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                          />
                          {courseData.requirements.length > 1 && (
                            <button
                              onClick={() => removeArrayItem('requirements', index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addArrayItem('requirements')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm yêu cầu
                      </button>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Thẻ tag
                      </label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {courseData.tags.map(tag => (
                          <span key={tag} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm flex items-center border border-blue-200">
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-2 hover:text-blue-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        {showTagInput ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addTag()}
                              placeholder="Thêm tag..."
                              className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              autoFocus
                            />
                            <button
                              onClick={addTag}
                              className="ml-2 p-1 text-blue-600 hover:text-blue-700"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowTagInput(true)}
                            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm flex items-center hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Thêm tag
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <ImageIcon className="w-4 h-4 inline mr-2" />
                        Ảnh đại diện khóa học
                      </label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50 group"
                      >
                        {courseData.thumbnailPreview ? (
                          <div className="relative">
                            <img 
                              src={courseData.thumbnailPreview} 
                              alt="Preview" 
                              className="max-w-full h-48 object-cover rounded-lg mx-auto shadow-lg"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCourseData(prev => ({...prev, thumbnail: null, thumbnailPreview: null}));
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-blue-500 transition-colors" />
                            <p className="text-gray-600 mb-2 font-medium">Kéo thả ảnh vào đây hoặc click để chọn</p>
                            <p className="text-sm text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                          </>
                        )}
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'content' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Nội dung khóa học</h3>
                      <button
                        onClick={() => setShowLessonForm(true)}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all flex items-center shadow-lg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm bài học
                      </button>
                    </div>

                    {lessons.length === 0 ? (
                      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Video className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Chưa có bài học nào</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          Bắt đầu tạo nội dung khóa học bằng cách thêm bài học đầu tiên
                        </p>
                        <button
                          onClick={() => setShowLessonForm(true)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                        >
                          Thêm bài học đầu tiên
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {lessons.map((lesson, index) => (
                          <div key={lesson.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Bài {index + 1}
                                  </span>
                                  <span className="text-sm text-gray-500">{lesson.duration}</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h4>
                                <p className="text-gray-600 text-sm">{lesson.description}</p>
                              </div>
                              <button
                                onClick={() => removeLesson(lesson.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Lesson Form */}
                    {showLessonForm && (
                      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Thêm bài học mới</h3>
                            <button
                              onClick={() => setShowLessonForm(false)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tiêu đề bài học *
                              </label>
                              <input
                                type="text"
                                value={newLesson.title}
                                onChange={(e) => setNewLesson(prev => ({...prev, title: e.target.value}))}
                                placeholder="Ví dụ: Giới thiệu về React Components"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mô tả bài học
                              </label>
                              <textarea
                                value={newLesson.description}
                                onChange={(e) => setNewLesson(prev => ({...prev, description: e.target.value}))}
                                placeholder="Mô tả ngắn gọn về nội dung bài học..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Loại bài học
                                </label>
                                <div className="relative">
                                  <select
                                    value={newLesson.type}
                                    onChange={(e) => setNewLesson(prev => ({...prev, type: e.target.value}))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                  >
                                    <option value="video">📹 Video</option>
                                    <option value="text">📄 Văn bản</option>
                                    <option value="quiz">❓ Quiz</option>
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Thời lượng
                                </label>
                                <input
                                  type="text"
                                  value={newLesson.duration}
                                  onChange={(e) => setNewLesson(prev => ({...prev, duration: e.target.value}))}
                                  placeholder="Ví dụ: 15:30"
                                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>

                            {newLesson.type === 'video' && (
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  URL Video
                                </label>
                                <input
                                  type="url"
                                  value={newLesson.videoUrl}
                                  onChange={(e) => setNewLesson(prev => ({...prev, videoUrl: e.target.value}))}
                                  placeholder="https://youtube.com/watch?v=..."
                                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                            <button
                              onClick={() => setShowLessonForm(false)}
                              className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={addLesson}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                            >
                              Thêm bài học
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-8">
                    {/* Pricing */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Định giá khóa học</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <input
                            type="radio"
                            id="free"
                            name="price"
                            value="free"
                            checked={courseData.price === 'free'}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <label htmlFor="free" className="text-sm font-medium text-gray-700">
                            🆓 Miễn phí
                          </label>
                        </div>
                        <div className="flex items-center space-x-4">
                          <input
                            type="radio"
                            id="paid"
                            name="price"
                            value="paid"
                            checked={courseData.price === 'paid'}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <label htmlFor="paid" className="text-sm font-medium text-gray-700">
                            💰 Có phí
                          </label>
                        </div>
                        {courseData.price === 'paid' && (
                          <div className="ml-8">
                            <input
                              type="number"
                              value={courseData.customPrice}
                              onChange={(e) => handleInputChange('customPrice', e.target.value)}
                              placeholder="Nhập giá (VNĐ)"
                              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Target Audience */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <Users className="w-4 h-4 inline mr-2" />
                        Đối tượng học viên
                      </label>
                      <textarea
                        value={courseData.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        placeholder="Ví dụ: Lập trình viên frontend muốn học React, sinh viên IT..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Course Duration */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <Clock className="w-4 h-4 inline mr-2" />
                        Thời lượng khóa học (ước tính)
                      </label>
                      <input
                        type="text"
                        value={courseData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="Ví dụ: 10 giờ"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Publish Options */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tùy chọn xuất bản</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <input
                            type="radio"
                            id="draft"
                            name="publish"
                            value="draft"
                            checked={courseData.publishOption === 'draft'}
                            onChange={(e) => handleInputChange('publishOption', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <label htmlFor="draft" className="text-sm font-medium text-gray-700">
                            📝 Lưu nháp - Chưa công khai
                          </label>
                        </div>
                        <div className="flex items-center space-x-4">
                          <input
                            type="radio"
                            id="publish"
                            name="publish"
                            value="publish"
                            checked={courseData.publishOption === 'publish'}
                            onChange={(e) => handleInputChange('publishOption', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <label htmlFor="publish" className="text-sm font-medium text-gray-700">
                            🌐 Xuất bản ngay - Công khai cho học viên
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Course Preview Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Xem trước khóa học
                </h3>
                
                <div className="space-y-4">
                  {courseData.thumbnailPreview ? (
                    <img 
                      src={courseData.thumbnailPreview} 
                      alt="Course preview" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">
                      {courseData.title || 'Tên khóa học sẽ hiển thị ở đây'}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {courseData.description || 'Mô tả khóa học sẽ hiển thị ở đây...'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <PlayCircle className="w-4 h-4 mr-1" />
                        {lessons.length} bài
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {calculateTotalDuration()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">5.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Số bài học</span>
                    <span className="font-semibold text-blue-600">{lessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tổng thời lượng</span>
                    <span className="font-semibold text-blue-600">{calculateTotalDuration()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cấp độ</span>
                    <span className="font-semibold text-blue-600 capitalize">
                      {courseData.level === 'beginner' ? '🌱 Cơ bản' : 
                       courseData.level === 'intermediate' ? '🚀 Trung cấp' : '⭐ Nâng cao'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Giá</span>
                    <span className="font-semibold text-green-600">
                      {courseData.price === 'free' ? 'Miễn phí' : 
                       courseData.customPrice ? `${courseData.customPrice.toLocaleString()} VNĐ` : 'Có phí'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Trạng thái</span>
                    <span className={`font-semibold ${courseData.publishOption === 'publish' ? 'text-green-600' : 'text-orange-600'}`}>
                      {courseData.publishOption === 'publish' ? '🌐 Công khai' : '📝 Nháp'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  💡 Mẹo tạo khóa học
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Tên khóa học nên rõ ràng và hấp dẫn</li>
                  <li>• Thêm ít nhất 5 bài học để tăng chất lượng</li>
                  <li>• Sử dụng ảnh đại diện chất lượng cao</li>
                  <li>• Mô tả chi tiết những gì học viên sẽ học được</li>
                  <li>• Thêm tags để dễ tìm kiếm</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}