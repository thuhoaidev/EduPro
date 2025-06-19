import React, { useState, useEffect } from 'react';
import { Play, Plus, Edit, Trash2, Save, X, Clock, Video, HelpCircle, CheckCircle, Eye, Star, Search, Filter, ChevronDown, ChevronRight, Award, Target, BarChart3 } from 'lucide-react';

const VideoQuizManager = () => {
  const [activeTab, setActiveTab] = useState('videos');
  
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: 'Giới thiệu về HTML5',
      description: 'Tìm hiểu về HTML5 và các tính năng mới, semantic elements và cách sử dụng hiệu quả',
      duration: '15:30',
      videoUrl: 'https://example.com/video1.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop',
      isPublished: true,
      views: 12543,
      likes: 987,
      createdAt: '2024-01-15',
      category: 'HTML/CSS',
      level: 'Beginner'
    },
    {
      id: 2,
      title: 'CSS Grid Layout Nâng Cao',
      description: 'Học cách sử dụng CSS Grid để tạo layout phức tạp và responsive',
      duration: '22:45',
      videoUrl: 'https://example.com/video2.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop',
      isPublished: true,
      views: 10234,
      likes: 756,
      createdAt: '2024-01-16',
      category: 'HTML/CSS',
      level: 'Advanced'
    },
    {
      id: 3,
      title: 'JavaScript ES6+ Features',
      description: 'Khám phá các tính năng mới của JavaScript ES6+ như arrow functions, destructuring, async/await',
      duration: '18:20',
      videoUrl: 'https://example.com/video3.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=225&fit=crop',
      isPublished: false,
      views: 8976,
      likes: 634,
      createdAt: '2024-01-17',
      category: 'JavaScript',
      level: 'Intermediate'
    }
  ]);

  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: 'Kiểm tra HTML cơ bản',
      description: 'Bài kiểm tra kiến thức HTML căn bản với 10 câu hỏi trắc nghiệm',
      totalQuestions: 10,
      timeLimit: 15,
      attempts: 1247,
      avgScore: 8.5,
      isPublished: true,
      difficulty: 'Easy',
      category: 'HTML/CSS',
      questions: [
        {
          id: 1,
          question: 'HTML là viết tắt của gì?',
          type: 'multiple-choice',
          options: [
            'HyperText Markup Language',
            'Home Tool Markup Language',
            'Hyperlinks and Text Markup Language',
            'HyperText Making Language'
          ],
          correctAnswer: 0,
          explanation: 'HTML là viết tắt của HyperText Markup Language - ngôn ngữ đánh dấu siêu văn bản'
        },
        {
          id: 2,
          question: 'Thẻ nào được sử dụng để tạo tiêu đề lớn nhất trong HTML?',
          type: 'multiple-choice',
          options: ['<h6>', '<h1>', '<header>', '<title>'],
          correctAnswer: 1,
          explanation: 'Thẻ <h1> được sử dụng để tạo tiêu đề cấp 1 - tiêu đề lớn nhất trong HTML'
        },
        {
          id: 3,
          question: 'Thuộc tính nào được sử dụng để thêm CSS inline?',
          type: 'multiple-choice',
          options: ['class', 'id', 'style', 'css'],
          correctAnswer: 2,
          explanation: 'Thuộc tính "style" được sử dụng để thêm CSS trực tiếp vào element'
        }
      ],
      createdAt: '2024-01-18'
    },
    {
      id: 2,
      title: 'JavaScript Variables & Functions',
      description: 'Test kiến thức về biến và hàm trong JavaScript',
      totalQuestions: 8,
      timeLimit: 12,
      attempts: 892,
      avgScore: 7.2,
      isPublished: true,
      difficulty: 'Medium',
      category: 'JavaScript',
      questions: [
        {
          id: 1,
          question: 'Cách nào sau đây KHÔNG phải là cách khai báo biến trong JavaScript?',
          type: 'multiple-choice',
          options: ['var x = 5;', 'let x = 5;', 'const x = 5;', 'variable x = 5;'],
          correctAnswer: 3,
          explanation: 'JavaScript có 3 cách khai báo biến: var, let, const. Không có từ khóa "variable"'
        },
        {
          id: 2,
          question: 'Hàm arrow function được giới thiệu trong phiên bản ES nào?',
          type: 'multiple-choice',
          options: ['ES5', 'ES6', 'ES7', 'ES8'],
          correctAnswer: 1,
          explanation: 'Arrow function được giới thiệu trong ES6 (ES2015)'
        }
      ],
      createdAt: '2024-01-19'
    },
    {
      id: 3,
      title: 'React Hooks Deep Dive',
      description: 'Kiểm tra hiểu biết sâu về React Hooks',
      totalQuestions: 12,
      timeLimit: 20,
      attempts: 456,
      avgScore: 6.8,
      isPublished: false,
      difficulty: 'Hard',
      category: 'React',
      questions: [
        {
          id: 1,
          question: 'Hook nào được sử dụng để quản lý state trong functional component?',
          type: 'multiple-choice',
          options: ['useEffect', 'useState', 'useContext', 'useReducer'],
          correctAnswer: 1,
          explanation: 'useState là hook cơ bản nhất để quản lý state trong functional component'
        }
      ],
      createdAt: '2024-01-20'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showQuizQuestions, setShowQuizQuestions] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: '',
    duration: '',
    videoUrl: '',
    timeLimit: 10,
    difficulty: 'Easy',
    totalQuestions: 0,
    questions: [],
    level: 'Beginner'
  });

  const categories = ['HTML/CSS', 'JavaScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Other'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      setFormData({ ...item });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      thumbnail: '',
      duration: '',
      videoUrl: '',
      timeLimit: 10,
      difficulty: 'Easy',
      totalQuestions: 0,
      questions: [],
      level: 'Beginner'
    });
  };

  const handleSubmit = () => {
    if (!formData.title) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }

    const newItem = {
      ...formData,
      id: editingItem ? editingItem.id : Date.now(),
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString().split('T')[0],
      isPublished: editingItem ? editingItem.isPublished : false,
      ...(modalType === 'video' && {
        views: editingItem ? editingItem.views : 0,
        likes: editingItem ? editingItem.likes : 0
      }),
      ...(modalType === 'quiz' && {
        attempts: editingItem ? editingItem.attempts : 0,
        avgScore: editingItem ? editingItem.avgScore : 0
      })
    };

    if (modalType === 'video') {
      if (editingItem) {
        setVideos(prev => prev.map(video => video.id === editingItem.id ? newItem : video));
      } else {
        setVideos(prev => [...prev, newItem]);
      }
    } else if (modalType === 'quiz') {
      if (editingItem) {
        setQuizzes(prev => prev.map(quiz => quiz.id === editingItem.id ? newItem : quiz));
      } else {
        setQuizzes(prev => [...prev, newItem]);
      }
    }

    setShowModal(false);
    setEditingItem(null);
    resetForm();
  };

  const handleDelete = (type, id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      if (type === 'video') {
        setVideos(prev => prev.filter(video => video.id !== id));
      } else if (type === 'quiz') {
        setQuizzes(prev => prev.filter(quiz => quiz.id !== id));
      }
    }
  };

  const togglePublish = (type, id) => {
    if (type === 'video') {
      setVideos(prev => prev.map(video => 
        video.id === id ? { ...video, isPublished: !video.isPublished } : video
      ));
    } else if (type === 'quiz') {
      setQuizzes(prev => prev.map(quiz => 
        quiz.id === id ? { ...quiz, isPublished: !quiz.isPublished } : quiz
      ));
    }
  };

  const getFilteredData = (data) => {
    let filtered = data;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => 
        filterStatus === 'published' ? item.isPublished : !item.isPublished
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    return filtered;
  };

  const formatNumber = (num) => {
    return num.toLocaleString('vi-VN');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-orange-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleQuizQuestions = (quizId) => {
    setShowQuizQuestions(prev => ({
      ...prev,
      [quizId]: !prev[quizId]
    }));
  };

  const toggleQuestionExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalQuestions: prev.questions.length + 1
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
      totalQuestions: prev.questions.length - 1
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Học Liệu</h1>
              <p className="text-gray-600 mt-1">Quản lý video bài giảng và bài quiz của bạn</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-[88px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'videos', name: 'Video Bài Giảng', icon: Video, color: 'text-blue-600 border-blue-500' },
              { id: 'quizzes', name: 'Bài Quiz', icon: HelpCircle, color: 'text-purple-600 border-purple-500' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? tab.color
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.name}
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {activeTab === 'videos' ? getFilteredData(videos).length : getFilteredData(quizzes).length}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab === 'videos' ? 'Danh sách Video' : 'Danh sách Quiz'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {activeTab === 'videos' 
                ? 'Quản lý các video bài giảng và nội dung học tập'
                : 'Quản lý các bài kiểm tra và đánh giá'
              }
            </p>
          </div>
          <button
            onClick={() => openModal(activeTab.slice(0, -1))}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-200 transition-all transform hover:scale-105"
          >
            <Plus size={20} />
            Tạo {activeTab === 'videos' ? 'Video' : 'Quiz'} mới
          </button>
        </div>

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            {getFilteredData(videos).map((video) => (
              <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                <div className="p-6">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 relative">
                      <div className="w-64 h-36 rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={32} className="text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-sm font-medium">
                        {video.duration}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {video.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed mb-3">{video.description}</p>
                          
                          <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(video.level)}`}>
                              {video.level}
                            </span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                              {video.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              video.isPublished 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}>
                              {video.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                            </span>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye size={16} />
                              <span>{formatNumber(video.views)} lượt xem</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star size={16} />
                              <span>{formatNumber(video.likes)} thích</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              <span>{video.createdAt}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => togglePublish('video', video.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              video.isPublished
                                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                            }`}
                          >
                            {video.isPublished ? 'Ẩn' : 'Xuất bản'}
                          </button>
                          <button
                            onClick={() => openModal('video', video)}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete('video', video.id)}
                            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            {getFilteredData(quizzes).map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{quiz.title}</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">{quiz.description}</p>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
                          {quiz.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          quiz.isPublished 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {quiz.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => togglePublish('quiz', quiz.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          quiz.isPublished
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        }`}
                      >
                        {quiz.isPublished ? 'Ẩn' : 'Xuất bản'}
                      </button>
                      <button
                        onClick={() => openModal('quiz', quiz)}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete('quiz', quiz.id)}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Quiz Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                      <div className="text-2xl font-bold text-blue-700">{quiz.totalQuestions}</div>
                      <div className="text-xs text-blue-600 font-medium">Câu hỏi</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                      <div className="text-2xl font-bold text-green-700">{quiz.timeLimit}p</div>
                      <div className="text-xs text-green-600 font-medium">Thời gian</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
                      <div className="text-2xl font-bold text-purple-700">{formatNumber(quiz.attempts)}</div>
                      <div className="text-xs text-purple-600 font-medium">Lượt làm</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
                      <div className="text-2xl font-bold text-orange-700">{quiz.avgScore}/10</div>
                      <div className="text-xs text-orange-600 font-medium">Điểm TB</div>
                    </div>
                  </div>

                  {/* Questions Toggle */}
                  <button
                    onClick={() => toggleQuizQuestions(quiz.id)}
                    className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Xem câu hỏi ({quiz.questions.length})
                    </span>
                    {showQuizQuestions[quiz.id] ? 
                      <ChevronDown size={16} className="text-gray-500" /> : 
                      <ChevronRight size={16} className="text-gray-500" />
                    }
                  </button>

                  {/* Questions List */}
                  {showQuizQuestions[quiz.id] && (
                    <div className="mt-4 space-y-3">
                      {quiz.questions.map((question, index) => (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              Câu {index + 1}: {question.question}
                            </h4>
                            <button
                              onClick={() => toggleQuestionExpand(question.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {expandedQuestions[question.id] ? 'Thu gọn' : 'Xem chi tiết'}
                            </button>
                          </div>
                          
                          {expandedQuestions[question.id] && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                {question.options.map((option, optIndex) => (
                                  <div 
                                    key={optIndex}
                                    className={`p-2 rounded text-sm ${
                                      optIndex === question.correctAnswer 
                                        ? 'bg-green-100 text-green-800 border border-green-300' 
                                        : 'bg-white border border-gray-200'
                                    }`}
                                  >
                                    <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option}
                                    {optIndex === question.correctAnswer && (
                                      <CheckCircle size={14} className="inline ml-1 text-green-600" />
                                    )}
                                  </div>
                                ))}
                              </div>
                              {question.explanation && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                                  <div className="flex items-start gap-2">
                                    <HelpCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-blue-800 mb-1">Giải thích:</p>
                                      <p className="text-sm text-blue-700">{question.explanation}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                    <span>Tạo ngày: {quiz.createdAt}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Target size={16} />
                        <span>ID: {quiz.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'videos' && getFilteredData(videos).length === 0) || 
          (activeTab === 'quizzes' && getFilteredData(quizzes).length === 0)) && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              {activeTab === 'videos' ? (
                <Video size={64} className="mx-auto text-gray-300 mb-4" />
              ) : (
                <HelpCircle size={64} className="mx-auto text-gray-300 mb-4" />
              )}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' 
                  ? 'Không tìm thấy kết quả' 
                  : `Chưa có ${activeTab === 'videos' ? 'video' : 'quiz'} nào`}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                  ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                  : `Hãy tạo ${activeTab === 'videos' ? 'video bài giảng' : 'bài quiz'} đầu tiên của bạn`}
              </p>
              {!(searchTerm || filterStatus !== 'all' || filterCategory !== 'all') && (
                <button
                  onClick={() => openModal(activeTab.slice(0, -1))}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  <Plus size={20} />
                  Tạo {activeTab === 'videos' ? 'Video' : 'Quiz'} mới
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Chỉnh sửa' : 'Tạo mới'} {modalType === 'video' ? 'Video' : 'Quiz'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={`Nhập tiêu đề ${modalType === 'video' ? 'video' : 'quiz'}...`}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder={`Mô tả chi tiết về ${modalType === 'video' ? 'nội dung video' : 'bài quiz'}...`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {modalType === 'video' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cấp độ
                        </label>
                        <select
                          name="level"
                          value={formData.level}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          {levels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thời lượng
                        </label>
                        <input
                          type="text"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="VD: 15:30"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL Video
                        </label>
                        <input
                          type="url"
                          name="videoUrl"
                          value={formData.videoUrl}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="https://example.com/video.mp4"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL Thumbnail
                        </label>
                        <input
                          type="url"
                          name="thumbnail"
                          value={formData.thumbnail}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="https://example.com/thumbnail.jpg"
                        />
                      </div>
                    </>
                  )}

                  {modalType === 'quiz' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Độ khó
                        </label>
                        <select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          {difficulties.map(diff => (
                            <option key={diff} value={diff}>{diff}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thời gian làm bài (phút)
                        </label>
                        <input
                          type="number"
                          name="timeLimit"
                          value={formData.timeLimit}
                          onChange={handleInputChange}
                          min="1"
                          max="120"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Quiz Questions Section */}
                {modalType === 'quiz' && (
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Câu hỏi ({formData.questions.length})
                      </h3>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Plus size={16} />
                        Thêm câu hỏi
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.questions.map((question, questionIndex) => (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Câu hỏi {questionIndex + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeQuestion(question.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nội dung câu hỏi
                              </label>
                              <input
                                type="text"
                                value={question.question}
                                onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập câu hỏi..."
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={question.correctAnswer === optionIndex}
                                    onChange={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                                    className="text-green-600"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={`Đáp án ${String.fromCharCode(65 + optionIndex)}`}
                                  />
                                </div>
                              ))}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giải thích (tùy chọn)
                              </label>
                              <textarea
                                value={question.explanation}
                                onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Giải thích đáp án đúng..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {formData.questions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <HelpCircle size={48} className="mx-auto mb-2 text-gray-300" />
                        <p>Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save size={16} />
                {editingItem ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoQuizManager;