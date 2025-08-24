import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Input, 
  Select, 
  Upload, 
  message, 
  Card, 
  Space,  
  Tooltip,
  Modal,
  Alert,
  List,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  SaveOutlined,
  SendOutlined,
  PictureOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  CodeOutlined,
  QuestionCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  GlobalOutlined,
  MobileOutlined,
  AreaChartOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  CloudOutlined,
  RocketOutlined,
  LaptopOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

// API Configuration
const apiUrl = 'http://localhost:5000/api';

// Get auth token from localStorage or context
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// API Helper function
const apiRequest = async (endpoint, method = 'GET', data = null, isFormData = false) => {
  const token = getAuthToken();
  const config: any = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  if (data && method !== 'GET') {
    if (isFormData) {
      config.body = data;
    } else {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }
  }

  const response = await fetch(`${apiUrl}${endpoint}`, config);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Request failed');
  }

  return result;
};

// Blog API
const blogAPI = {
  // Create new blog
 createBlog: (formData) => apiRequest('/blogs', 'POST', formData, true),
  
  // Update existing blog (for editing drafts)
  updateBlog: (id, blogData, isFormData = false) =>
  apiRequest(`/blogs/${id}`, 'PUT', blogData, isFormData),
  
  // Get single blog by ID (for loading drafts)
  getBlog: (id) => apiRequest(`/blogs/${id}`),
  
  // Upload image
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiRequest('/image', 'POST', formData, true);
  },
  
  // Get categories from API
  getCategories: () => apiRequest('/categories/status/active')
};

// Icon mapping cho danh mục (giống AppSidebar)
const categoryIconMap = {
  'Marketing': <ThunderboltOutlined />,
  'Công nghệ thông tin': <CodeOutlined />,
  'Phát triển web': <GlobalOutlined />,
  'Phát triển mobile': <MobileOutlined />,
  'Kinh doanh': <AreaChartOutlined />,
  'Kỹ năng mềm': <MessageOutlined />,
  'Frontend': <GlobalOutlined />,
  'Backend': <DatabaseOutlined />,
  'Mobile Development': <MobileOutlined />,
  'DevOps': <CloudOutlined />,
  'Database': <DatabaseOutlined />,
  'UI/UX Design': <RocketOutlined />,
  'Career Tips': <MessageOutlined />,
  'Tutorial': <LaptopOutlined />
};

// Danh sách icon dự phòng
const fallbackIcons = [
  <DatabaseOutlined />,
  <CloudOutlined />,
  <RocketOutlined />,
  <LaptopOutlined />,
  <ThunderboltOutlined />
];

const BlogWritePage = () => {
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');

  
  // UI states
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [blogId, setBlogId] = useState(null);
  const [apiError, setApiError] = useState(null);
  
  // Categories state - THÊM MỚI
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const textAreaRef = useRef(null);

  // Load categories from API - THÊM MỚI
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        // console.log('Đang tải danh mục từ API...');
        
        const response = await blogAPI.getCategories();
        // console.log('Response từ API:', response);
        
        // Xử lý dữ liệu từ API
        const backendCategories = response.data || response;
        // console.log('Backend categories:', backendCategories);
        
        const formattedCategories = backendCategories.map((cat, index) => ({
          id: cat._id,
          value: cat._id, // Sử dụng _id làm value
          name: cat.name,
          label: cat.name,
          description: cat.description,
          icon: categoryIconMap[cat.name] || fallbackIcons[index % fallbackIcons.length],
          color: `hsl(${(index * 50) % 360}, 60%, 60%)` // Tạo màu động
        }));
        
        // console.log('Formatted categories:', formattedCategories);
        setCategories(formattedCategories);
        
        message.success(`Đã tải ${formattedCategories.length} danh mục`);
        
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('Không thể tải danh mục: ' + error.message);
        
        // Fallback categories nếu API lỗi
        const fallbackCategories = [
          { 
            id: 'frontend', 
            value: 'frontend', 
            name: 'Frontend', 
            label: 'Frontend', 
            description: 'Phát triển giao diện người dùng',
            icon: <GlobalOutlined />, 
            color: '#1890ff' 
          },
          { 
            id: 'backend', 
            value: 'backend', 
            name: 'Backend', 
            label: 'Backend', 
            description: 'Phát triển server và API',
            icon: <DatabaseOutlined />, 
            color: '#52c41a' 
          },
          { 
            id: 'mobile', 
            value: 'mobile', 
            name: 'Mobile Development', 
            label: 'Mobile Development', 
            description: 'Phát triển ứng dụng di động',
            icon: <MobileOutlined />, 
            color: '#fa8c16' 
          },
          { 
            id: 'devops', 
            value: 'devops', 
            name: 'DevOps', 
            label: 'DevOps', 
            description: 'Triển khai và vận hành hệ thống',
            icon: <CloudOutlined />, 
            color: '#722ed1' 
          },
        ];
        
        setCategories(fallbackCategories);
        console.log('Sử dụng fallback categories:', fallbackCategories);
        
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Calculate word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(content.trim() ? words.length : 0);
  }, [content]);

  // Load blog for editing (if blogId is provided via props or URL)
  const loadBlogForEditing = async (id) => {
    try {
      const response = await blogAPI.getBlog(id);
      const blog = response.data || response;

      setTitle(blog.title || '');
      setContent(blog.content || '');
      setCategory(blog.category || '');
      setBlogId(id);

      message.success('Đã tải bài viết để chỉnh sửa');
    } catch (error) {
      message.error('Không thể tải bài viết: ' + error.message);
    }
  };

  // Toolbar functions
  const insertText = (beforeText, afterText = '') => {
    const textarea = textAreaRef.current?.resizableTextArea?.textArea;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + 
                   beforeText + selectedText + afterText + 
                   content.substring(end);
    
    setContent(newText);
    
    setTimeout(() => {
      const newCursorPos = start + beforeText.length + selectedText.length + afterText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const toolbarButtons = [
    { icon: <BoldOutlined />, tooltip: 'In đậm (Ctrl+B)', action: () => insertText('**', '**') },
    { icon: <ItalicOutlined />, tooltip: 'In nghiêng (Ctrl+I)', action: () => insertText('*', '*') },
    { icon: <UnderlineOutlined />, tooltip: 'Gạch chân', action: () => insertText('<u>', '</u>') },
    { icon: <CodeOutlined />, tooltip: 'Code inline', action: () => insertText('`', '`') },
    { icon: <LinkOutlined />, tooltip: 'Chèn link', action: () => insertText('[', '](url)') },
    { icon: <UnorderedListOutlined />, tooltip: 'Danh sách không thứ tự', action: () => insertText('\n- ') },
    { icon: <OrderedListOutlined />, tooltip: 'Danh sách có thứ tự', action: () => insertText('\n1. ') },
  ];

  // Image upload handler
  const handleImageUpload = async (file) => {
    try {
      message.loading('Đang tải ảnh lên...', 0);
      const response = await blogAPI.uploadImage(file);
      message.destroy();
      
      const imageUrl = response.data?.url || response.url;
      if (imageUrl) {
        const markdownImage = `![${file.name}](${imageUrl})`;
        setContent(prev => prev + '\n\n' + markdownImage + '\n\n');
        message.success('Ảnh đã được tải lên thành công!');
      }
    } catch (error) {
      message.destroy();
      message.error('Không thể tải ảnh lên: ' + error.message);
    }
    return false;
  };

  // Cover image upload handler
  const handleCoverImageUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ được upload file ảnh!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    setCoverImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  };

  // Remove cover image
  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview('');
  };


  // Publish blog
  const navigate = useNavigate();
  const handlePublish = async () => {
  if (!title.trim()) {
    message.error('Vui lòng nhập tiêu đề bài viết');
    return;
  }
  if (!content.trim()) {
    message.error('Vui lòng nhập nội dung bài viết');
    return;
  }
  if (!category) {
    message.error('Vui lòng chọn danh mục');
    return;
  }
  if (!coverImage) {
    message.error('Vui lòng thêm ảnh bìa cho bài viết');
    return;
  }

  setIsPublishing(true);

  try {
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('category', category);
    formData.append('status', 'pending');
    formData.append('coverImage', coverImage);

    let response;
    if (blogId) {
      response = await blogAPI.updateBlog(blogId, formData, true);
      message.success('Bài viết đã được cập nhật!');
    } else {
      response = await blogAPI.createBlog(formData); // 👈 sửa hàm createBlog như bên dưới
      message.success('Bài viết đã được gửi duyệt!');
      setBlogId(response.data?._id || response._id);
    }

    setTimeout(() => {
      navigate('/blog/mine');
    }, 1500);
  } catch (error) {
    message.error('Lỗi khi đăng bài: ' + error.message);
    setApiError('Không thể đăng bài. Vui lòng kiểm tra kết nối và thử lại.');
  } finally {
    setIsPublishing(false);
  }
};

  // Save draft
  const handleSaveDraft = async () => {
    if (!title.trim() && !content.trim()) {
      message.warning('Không có nội dung để lưu');
      return;
    }

    setIsSaving(true);

    try {
      const draftData = new FormData();
      draftData.append('title', title.trim());
      draftData.append('content', content.trim());
      draftData.append('category', category);
      draftData.append('status', 'draft');
      if (coverImage) {
        draftData.append('coverImage', coverImage);
      }

      let response;
      if (blogId) {
        response = await blogAPI.updateBlog(blogId, draftData, true);
        message.success('Bản nháp đã được cập nhật!');
      } else {
        response = await blogAPI.createBlog(draftData);
        setBlogId(response.data?.id || response.data?._id || response.id || response._id);
        message.success('Bản nháp đã được lưu!');
      }

    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu bản nháp: ' + error.message);
      setApiError('Không thể lưu bản nháp. Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('');
    setCoverImage(null);
    setCoverImagePreview('');
    setBlogId(null);
    setApiError(null);
  };

  // Render preview
  const renderPreview = () => {
    if (!content) return <div className="text-gray-400 text-center py-8">Chưa có nội dung để xem trước</div>;
    
    const htmlContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            insertText('**', '**');
            break;
          case 'i':
            e.preventDefault();
            insertText('*', '*');
            break;
          case 's':
            e.preventDefault();
            handleSaveDraft();
            break;
          case 'Enter':
            e.preventDefault();
            handlePublish();
            break;
          case 'p':
            e.preventDefault();
            setIsPreviewMode(!isPreviewMode);
            break;
        }
      }
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [content, isPreviewMode, isFullscreen]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 via-blue-100 to-cyan-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <style>{`
        .gradient-border {
          background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
          padding: 2px;
          border-radius: 12px;
        }
        .gradient-border-inner {
          background: white;
          border-radius: 10px;
          height: 100%;
        }
        .toolbar-btn {
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }
        .toolbar-btn:hover {
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
                 .category-item {
           transition: all 0.3s ease;
           background: white;
           border: 2px solid #e5e7eb;
         }
         .category-item:hover {
           transform: translateY(-2px);
           box-shadow: 0 4px 12px rgba(0,0,0,0.1);
           border-color: #d1d5db;
           background: #f9fafb;
         }
         .category-item.selected {
           background: #eff6ff;
           border-color: #3b82f6;
           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
         }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .write-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .rainbow-text {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: rainbow 3s ease-in-out infinite;
        }
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .floating-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
        }
        .glow-effect {
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @media (max-width: 768px) {
          .write-container {
            padding: 10px;
          }
        }
      `}</style>

      <div className="write-container">
        {/* API Error Alert */}
        {apiError && (
          <Alert
            message="Lỗi kết nối"
            description={apiError}
            type="error"
            showIcon
            closable
            onClose={() => setApiError(null)}
            className="mb-6"
          />
        )}

                 {/* Header */}
         <div className="flex items-center justify-between mb-6">
           <div>
             <h1 className="text-4xl font-bold rainbow-text pulse-animation">
               {blogId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
             </h1>
             <p className="text-purple-600 mt-2 font-medium">✨ Chia sẻ kiến thức và kinh nghiệm của bạn ✨</p>
           </div>
           <div className="flex items-center gap-3">
             {blogId && (
               <Button 
                 icon={<PlusOutlined />}
                 onClick={resetForm}
                 className="toolbar-btn glow-effect"
               >
                 Bài mới
               </Button>
             )}
             <Button 
               icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
               onClick={() => setIsFullscreen(!isFullscreen)}
               className="toolbar-btn glow-effect"
             />
             <Button 
               icon={<EyeOutlined />} 
               onClick={() => setIsPreviewMode(!isPreviewMode)}
               className={`toolbar-btn ${isPreviewMode ? 'pulse-animation' : ''}`}
             >
               {isPreviewMode ? 'Chỉnh sửa' : 'Xem trước'}
             </Button>
           </div>
         </div>

        {/* Main Content - Full Width */}
        <div className="w-full">
          <Card className="floating-card shadow-lg border-0">
            {/* Title Input */}
            <div className="mb-6">
              <Input
                placeholder="Tiêu đề bài viết..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold border-0 border-b-2 border-purple-300 rounded-none px-0 py-3 focus:border-pink-500 focus:shadow-lg"
                style={{ boxShadow: 'none' }}
              />
            </div>

            {/* Toolbar */}
            {!isPreviewMode && (
              <div className="flex items-center gap-2 mb-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                {toolbarButtons.map((btn, index) => (
                  <Tooltip key={index} title={btn.tooltip}>
                    <Button
                      size="small"
                      icon={btn.icon}
                      onClick={btn.action}
                      className="toolbar-btn border-0"
                    />
                  </Tooltip>
                ))}
                <div className="w-px h-6 bg-gradient-to-b from-pink-300 to-purple-300 mx-2" />
                <Upload
                  beforeUpload={handleImageUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Tooltip title="Thêm ảnh">
                    <Button size="small" icon={<PictureOutlined />} className="toolbar-btn border-0" />
                  </Tooltip>
                </Upload>
                <div className="flex-1" />
              </div>
            )}

            {/* Content Area */}
            <div className="min-h-[500px]">
              {isPreviewMode ? (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold mb-4 rainbow-text">{title || 'Tiêu đề bài viết'}</h2>
                  {renderPreview()}
                </div>
              ) : (
                <TextArea
                  ref={textAreaRef}
                  placeholder="Viết nội dung bài viết của bạn ở đây...

Một số gợi ý:
- Sử dụng **in đậm** để nhấn mạnh
- Sử dụng *in nghiêng* cho các thuật ngữ
- Sử dụng `code` cho các từ khóa kỹ thuật
- Thêm ảnh để minh họa

Hãy chia sẻ những kiến thức và kinh nghiệm quý báu của bạn!"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  autoSize={{ minRows: 20 }}
                  className="border-0 text-base leading-relaxed resize-none focus:ring-2 focus:ring-pink-300"
                  style={{ boxShadow: 'none' }}
                />
              )}
            </div>
          </Card>

          {/* Essential Controls - Inline */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cover Image Upload */}
            <Card title={<span className="rainbow-text font-bold">🖼️ Ảnh bìa</span>} className="floating-card shadow-lg border-0">
              {coverImagePreview ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-32 object-cover rounded-lg border-2 border-purple-200"
                    />
                    <button
                      onClick={removeCoverImage}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {coverImage?.name}
                  </div>
                </div>
              ) : (
                <Upload
                  beforeUpload={handleCoverImageUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
                    <PictureOutlined className="text-3xl text-purple-400 mb-2" />
                    <div className="text-sm font-medium text-purple-600 mb-1">Thêm ảnh bìa</div>
                    <div className="text-xs text-gray-500">JPG, PNG, GIF (tối đa 5MB)</div>
                  </div>
                </Upload>
              )}
              {!coverImage && (
                <div className="mt-2 text-xs text-red-500 text-center">
                  ⚠️ Ảnh bìa là bắt buộc
                </div>
              )}
            </Card>

            {/* Category Selection */}
            <Card title={<span className="rainbow-text font-bold">🎨 Danh mục</span>} className="floating-card shadow-lg border-0">
              <Spin spinning={loadingCategories}>
                {categories.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className={`category-item p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          category === cat.value ? 'selected' : ''
                        }`}
                        onClick={() => {
                          setCategory(cat.value);
                          console.log('Selected category:', cat);
                        }}
                      >
                        <div className="flex items-center">
                          <div 
                            className="flex items-center justify-center w-8 h-8 rounded-lg mr-3 text-sm"
                            style={{ 
                              backgroundColor: category === cat.value ? '#3b82f6' : '#f3f4f6',
                              color: category === cat.value ? '#ffffff' : '#6b7280'
                            }}
                          >
                            {cat.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{cat.name}</div>
                          </div>
                          {category === cat.value && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !loadingCategories ? (
                  <div className="text-center text-gray-500 py-8">
                    <CodeOutlined className="text-2xl mb-2" />
                    <div>Không có danh mục nào</div>
                    <div className="text-xs mt-1">Kiểm tra kết nối API</div>
                  </div>
                ) : null}
              </Spin>
            </Card>

            {/* Publishing */}
            <Card className="floating-card shadow-lg border-0">
              <Space direction="vertical" size="middle" className="w-full">
                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  onClick={handlePublish}
                  loading={isPublishing}
                  className="w-full h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 border-0 font-semibold glow-effect pulse-animation"
                >
                  {blogId ? 'Cập nhật bài' : 'Đăng bài'}
                </Button>
                <Button
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={handleSaveDraft}
                  loading={isSaving}
                  className="w-full h-12 bg-gradient-to-r from-yellow-400 to-orange-500 border-0 font-semibold text-white hover:from-yellow-500 hover:to-orange-600"
                >
                  Lưu nháp
                </Button>
              </Space>
            </Card>
          </div>
        </div>

        {/* Keyboard Shortcuts Modal */}
        <Modal
          title="Phím tắt"
          open={false}
          footer={null}
          width={400}
        >
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>In đậm</span>
              <code className="bg-gray-100 px-2 py-1 rounded">Ctrl + B</code>
            </div>
            <div className="flex justify-between">
              <span>In nghiêng</span>
              <code className="bg-gray-100 px-2 py-1 rounded">Ctrl + I</code>
            </div>
            <div className="flex justify-between">
              <span>Lưu nháp</span>
              <code className="bg-gray-100 px-2 py-1 rounded">Ctrl + S</code>
            </div>
            <div className="flex justify-between">
              <span>Đăng bài</span>
              <code className="bg-gray-100 px-2 py-1 rounded">Ctrl + Enter</code>
            </div>
            <div className="flex justify-between">
              <span>Xem trước</span>
              <code className="bg-gray-100 px-2 py-1 rounded">Ctrl + P</code>
            </div>
            <div className="flex justify-between">
              <span>Toàn màn hình</span>
              <code className="bg-gray-100 px-2 py-1 rounded">F11</code>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BlogWritePage;