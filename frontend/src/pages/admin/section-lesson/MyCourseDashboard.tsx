import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, BookOpen, Users, Clock, Star, Search, Filter, MoreVertical, X } from 'lucide-react';

const MyCourseDashboard = () => {
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Lập trình React từ A-Z",
      slug: "react-tu-a-den-z",
      description: "Khóa học React đầy đủ từ cơ bản đến nâng cao",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=240&fit=crop",
      price: 299000,
      originalPrice: 599000,
      level: "Cơ bản",
      language: "Tiếng Việt",
      students: 1245,
      lessons: 45,
      duration: "12 giờ",
      rating: 4.8,
      reviews: 234,
      status: "published",
      instructor: "Nguyễn Văn A",
      createdAt: "2024-01-15",
      updatedAt: "2024-06-10"
    },
    {
      id: 2,
      title: "JavaScript Mastery",
      slug: "javascript-mastery",
      description: "Nắm vững JavaScript từ cơ bản đến chuyên sâu",
      thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=240&fit=crop",
      price: 399000,
      originalPrice: 799000,
      level: "Trung cấp",
      language: "Tiếng Việt",
      students: 892,
      lessons: 38,
      duration: "15 giờ",
      rating: 4.9,
      reviews: 156,
      status: "published",
      instructor: "Trần Thị B",
      createdAt: "2024-02-20",
      updatedAt: "2024-06-15"
    },
    {
      id: 3,
      title: "Node.js Backend Development",
      slug: "nodejs-backend-dev",
      description: "Xây dựng API và backend với Node.js",
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=240&fit=crop",
      price: 499000,
      originalPrice: 999000,
      level: "Nâng cao",
      language: "Tiếng Việt",
      students: 567,
      lessons: 52,
      duration: "20 giờ",
      rating: 4.7,
      reviews: 89,
      status: "draft",
      instructor: "Lê Văn C",
      createdAt: "2024-03-10",
      updatedAt: "2024-06-18"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [newCourse, setNewCourse] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail: '',
    price: '',
    originalPrice: '',
    level: 'Cơ bản',
    language: 'Tiếng Việt',
    status: 'draft'
  });

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || course.status === filterStatus;
    const matchLevel = filterLevel === 'all' || course.level === filterLevel;
    return matchSearch && matchStatus && matchLevel;
  });

  // Generate slug from title
  const generateSlug = (title) => {
    return title.toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  // Confirm dialog component
  const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
    if (!isOpen) return null;

    const typeStyles = {
      danger: {
        bg: 'bg-red-50',
        text: 'text-red-900',
        button: 'bg-red-600 hover:bg-red-700',
        icon: '⚠️'
      },
      warning: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-900',
        button: 'bg-yellow-600 hover:bg-yellow-700',
        icon: '⚠️'
      },
      info: {
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        button: 'bg-blue-600 hover:bg-blue-700',
        icon: 'ℹ️'
      }
    };

    const style = typeStyles[type] || typeStyles.danger;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
          <div className={`${style.bg} p-6 rounded-t-2xl`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{style.icon}</span>
              <h3 className={`text-lg font-semibold ${style.text}`}>{title}</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${style.button}`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show confirm dialog
  const showConfirmDialog = (title, message, onConfirm, type = 'danger') => {
    setConfirmAction({ title, message, onConfirm, type });
    setShowConfirm(true);
  };

  // Handle create course
  const handleCreateCourse = (e) => {
    e.preventDefault();
    
    showConfirmDialog(
      'Tạo khóa học mới',
      'Bạn có chắc chắn muốn tạo khóa học này không?',
      () => {
        const course = {
          ...newCourse,
          id: Date.now(),
          slug: newCourse.slug || generateSlug(newCourse.title),
          students: 0,
          lessons: 0,
          duration: "0 giờ",
          rating: 0,
          reviews: 0,
          instructor: "Bạn",
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        
        setCourses([course, ...courses]);
        resetForm();
        setShowConfirm(false);
      },
      'info'
    );
  };

  // Handle edit course
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setNewCourse({...course});
    setShowCreateForm(true);
  };

  // Handle update course
  const handleUpdateCourse = (e) => {
    e.preventDefault();
    
    showConfirmDialog(
      'Cập nhật khóa học',
      'Bạn có chắc chắn muốn cập nhật thông tin khóa học này không?',
      () => {
        setCourses(courses.map(course => 
          course.id === editingCourse.id 
            ? { ...newCourse, updatedAt: new Date().toISOString().split('T')[0] }
            : course
        ));
        resetForm();
        setShowConfirm(false);
      },
      'warning'
    );
  };

  // Handle delete course
  const handleDeleteCourse = (course) => {
    showConfirmDialog(
      'Xóa khóa học',
      `Bạn có chắc chắn muốn xóa khóa học "${course.title}" không? Hành động này không thể hoàn tác.`,
      () => {
        setCourses(courses.filter(c => c.id !== course.id));
        setShowConfirm(false);
      },
      'danger'
    );
  };

  // Reset form
  const resetForm = () => {
    setEditingCourse(null);
    setNewCourse({
      title: '',
      slug: '',
      description: '',
      thumbnail: '',
      price: '',
      originalPrice: '',
      level: 'Cơ bản',
      language: 'Tiếng Việt',
      status: 'draft'
    });
    setShowCreateForm(false);
  };

  // Handle cancel form
  const handleCancelForm = () => {
    if (newCourse.title || newCourse.description) {
      showConfirmDialog(
        'Hủy thao tác',
        'Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy không?',
        () => {
          resetForm();
          setShowConfirm(false);
        },
        'warning'
      );
    } else {
      resetForm();
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800', text: 'Đã xuất bản' },
      draft: { color: 'bg-yellow-100 text-yellow-800', text: 'Bản nháp' },
      archived: { color: 'bg-gray-100 text-gray-800', text: 'Đã lưu trữ' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const LevelBadge = ({ level }) => {
    const levelConfig = {
      'Cơ bản': 'bg-blue-100 text-blue-800',
      'Trung cấp': 'bg-orange-100 text-orange-800',
      'Nâng cao': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelConfig[level] || 'bg-gray-100 text-gray-800'}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý khóa học</h1>
              <p className="text-sm text-gray-600 mt-1">Quản lý và tổ chức các khóa học của bạn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="draft">Bản nháp</option>
                  <option value="archived">Đã lưu trữ</option>
                </select>
                
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">Tất cả cấp độ</option>
                  <option value="Cơ bản">Cơ bản</option>
                  <option value="Trung cấp">Trung cấp</option>
                  <option value="Nâng cao">Nâng cao</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="w-4 h-4 flex flex-col gap-0.5">
                  <div className="bg-current h-0.5 rounded-sm"></div>
                  <div className="bg-current h-0.5 rounded-sm"></div>
                  <div className="bg-current h-0.5 rounded-sm"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng khóa học</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng học viên</p>
                <p className="text-2xl font-bold text-gray-900">{courses.reduce((sum, course) => sum + course.students, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã xuất bản</p>
                <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.status === 'published').length}</p>
              </div>
            </div>
          </div>
        </div>
      
        {/* Course List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={course.status} />
                  </div>
                  <div className="absolute top-3 right-3">
                    <LevelBadge level={course.level} />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.lessons} bài</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-orange-600">
                        {course.price.toLocaleString()}đ
                      </span>
                      {course.originalPrice > course.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {course.originalPrice.toLocaleString()}đ
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course)}
                      className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khóa học</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học viên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-12 w-12 rounded-lg object-cover" src={course.thumbnail} alt={course.title} />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            <div className="text-sm text-gray-500">{course.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={course.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.students.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-900">{course.rating}</span>
                          <span className="ml-1 text-sm text-gray-500">({course.reviews})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.price.toLocaleString()}đ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.updatedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy khóa học nào</p>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 transform transition-all">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
              <h2 className="text-xl font-semibold">
                {editingCourse ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                {editingCourse ? 'Cập nhật thông tin khóa học của bạn' : 'Điền thông tin để tạo khóa học mới'}
              </p>
              <button
                onClick={handleCancelForm}
                className="absolute top-4 right-4 text-white hover:text-orange-200 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCourse.title}
                  onChange={(e) => {
                    setNewCourse({
                      ...newCourse,
                      title: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Nhập tiêu đề khóa học..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL thân thiện)
                </label>
                <input
                  type="text"
                  value={newCourse.slug}
                  onChange={(e) => setNewCourse({...newCourse, slug: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="slug-khoa-hoc"
                />
                <p className="text-xs text-gray-500 mt-1">URL sẽ là: /course/{newCourse.slug}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả khóa học <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows="4"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Mô tả chi tiết về nội dung khóa học..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh thumbnail
                </label>
                <input
                  type="url"
                  value={newCourse.thumbnail}
                  onChange={(e) => setNewCourse({...newCourse, thumbnail: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
                {newCourse.thumbnail && (
                  <div className="mt-2">
                    <img 
                      src={newCourse.thumbnail} 
                      alt="Preview" 
                      className="w-32 h-20 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá bán <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({...newCourse, price: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="299000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá gốc
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCourse.originalPrice}
                    onChange={(e) => setNewCourse({...newCourse, originalPrice: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="599000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ
                  </label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Nâng cao">Nâng cao</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngôn ngữ
                  </label>
                  <select
                    value={newCourse.language}
                    onChange={(e) => setNewCourse({...newCourse, language: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="English">English</option>
                    <option value="中文">中文</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={newCourse.status}
                    onChange={(e) => setNewCourse({...newCourse, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="published">Xuất bản</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-lg"
                >
                  {editingCourse ? 'Cập nhật khóa học' : 'Tạo khóa học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title={confirmAction?.title}
        message={confirmAction?.message}
        type={confirmAction?.type}
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default MyCourseDashboard;