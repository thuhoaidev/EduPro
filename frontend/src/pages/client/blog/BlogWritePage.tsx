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
  Row,
  Col,
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
  try {
    const token = getAuthToken();
    const config = {
      method,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    };

    if (isFormData && data) {
      config.body = data;
    } else if (data) {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${apiUrl}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return { success: true };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Blog API
const blogAPI = {
  // Create new blog
  createBlog: (blogData) => apiRequest('/blogs', 'POST', blogData),
  
  // Update existing blog (for editing drafts)
  updateBlog: (id, blogData) => apiRequest(`/blogs/${id}`, 'PUT', blogData),
  
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
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
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
      setThumbnailUrl(blog.thumbnail || '');
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

  // Thumbnail upload handler
  const handleThumbnailUpload = async (file) => {
    try {
      const response = await blogAPI.uploadImage(file);
      const imageUrl = response.data?.url || response.url;
      if (imageUrl) {
        setThumbnailUrl(imageUrl);
        message.success('Ảnh đại diện đã được tải lên!');
      }
    } catch (error) {
      message.error('Không thể tải ảnh đại diện: ' + error.message);
    }
    return false;
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

    setIsPublishing(true);

    try {
      const blogData = {
        title: title.trim(),
        content: content.trim(),
        category,
        thumbnail: thumbnailUrl,
        status: 'pending'
      };

      let response;
      if (blogId) {
        response = await blogAPI.updateBlog(blogId, blogData);
        message.success('Bài viết đã được cập nhật thành công!');
      } else {
        response = await blogAPI.createBlog(blogData);
        message.success('Bài viết đã được gửi duyệt!');
        setBlogId(response.data?.id || response.data?._id || response.id || response._id);
      }

      setTimeout(() => {
       navigate('/blog/mine');
       }, 2000);

    } catch (error) {
      message.error('Có lỗi xảy ra khi đăng bài: ' + error.message);
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
      const draftData = {
        title: title.trim(),
        content: content.trim(),
        category,
        thumbnail: thumbnailUrl,
        status: 'draft'
      };

      let response;
      if (blogId) {
        response = await blogAPI.updateBlog(blogId, draftData);
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
    setThumbnailUrl('');
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
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <style jsx>{`
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
          transition: all 0.2s ease;
        }
        .toolbar-btn:hover {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          transform: translateY(-1px);
        }
        .category-item {
          transition: all 0.2s ease;
        }
        .category-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {blogId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
            </h1>
            <p className="text-gray-600 mt-1">Chia sẻ kiến thức và kinh nghiệm của bạn</p>
          </div>
          <div className="flex items-center gap-3">
            {blogId && (
              <Button 
                icon={<PlusOutlined />}
                onClick={resetForm}
                className="toolbar-btn"
              >
                Bài mới
              </Button>
            )}
            <Button 
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="toolbar-btn"
            />
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              type={isPreviewMode ? 'primary' : 'default'}
            >
              {isPreviewMode ? 'Chỉnh sửa' : 'Xem trước'}
            </Button>
          </div>
        </div>

        <Row gutter={24}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card className="shadow-lg border-0">
              {/* Title Input */}
              <div className="mb-6">
                <Input
                  placeholder="Tiêu đề bài viết..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-semibold border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 focus:border-blue-500"
                  style={{ boxShadow: 'none' }}
                />
              </div>

              {/* Toolbar */}
              {!isPreviewMode && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
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
                  <div className="w-px h-6 bg-gray-300 mx-2" />
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
                  <span className="text-sm text-gray-500">{wordCount} từ</span>
                </div>
              )}

              {/* Content Area */}
              <div className="min-h-[500px]">
                {isPreviewMode ? (
                  <div className="prose max-w-none">
                    <h2 className="text-2xl font-bold mb-4">{title || 'Tiêu đề bài viết'}</h2>
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
                    className="border-0 text-base leading-relaxed resize-none"
                    style={{ boxShadow: 'none' }}
                  />
                )}
              </div>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" className="w-full">
              {/* Category Selection - THAY ĐỔI CHÍNH Ở ĐÂY */}
              <Card title="Danh mục" className="shadow-lg border-0">
                <Spin spinning={loadingCategories}>
                  {categories.length > 0 ? (
                    <List
                      dataSource={categories}
                      renderItem={(cat) => (
                        <List.Item
                          key={cat.id}
                          style={{
                            padding: '8px 0',
                            border: 'none'
                          }}
                        >
                          <div
                            className={`category-item w-full flex items-center p-3 rounded-lg border-2 cursor-pointer ${
                              category === cat.value 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              setCategory(cat.value);
                              console.log('Selected category:', cat);
                            }}
                          >
                            <div 
                              className="flex items-center justify-center w-12 h-12 rounded-lg mr-3 text-lg"
                              style={{ 
                                backgroundColor: category === cat.value ? '#e6f4ff' : '#f5f5f5',
                                color: category === cat.value ? '#1677ff' : '#666'
                              }}
                            >
                              {cat.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-1">{cat.name}</div>
                              {cat.description && (
                                <div className="text-sm text-gray-500 line-clamp-2">
                                  {cat.description}
                                </div>
                              )}
                            </div>
                            {category === cat.value && (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </List.Item>
                      )}
                      split={false}
                    />
                  ) : !loadingCategories ? (
                    <div className="text-center text-gray-500 py-8">
                      <CodeOutlined className="text-2xl mb-2" />
                      <div>Không có danh mục nào</div>
                      <div className="text-xs mt-1">Kiểm tra kết nối API</div>
                    </div>
                  ) : null}
                </Spin>
                
                {/* Debug info - có thể xóa */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                    <div>Categories loaded: {categories.length}</div>
                    <div>Selected: {category}</div>
                    <div>Loading: {loadingCategories.toString()}</div>
                  </div>
                )}
              </Card>

              {/* Thumbnail */}
              <Card title="Ảnh đại diện" className="shadow-lg border-0">
                <Upload
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={handleThumbnailUpload}
                  accept="image/*"
                >
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <PlusOutlined className="text-2xl mb-2" />
                      <div>Chọn ảnh</div>
                    </div>
                  )}
                </Upload>
                <div className="text-xs text-gray-500 mt-2">
                  Khuyến nghị: 1200x630px, định dạng JPG hoặc PNG
                </div>
              </Card>

              {/* Publishing */}
              <Card className="shadow-lg border-0">
                <Space direction="vertical" size="middle" className="w-full">
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handlePublish}
                    loading={isPublishing}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 border-0 font-semibold"
                  >
                    {blogId ? 'Cập nhật bài' : 'Đăng bài'}
                  </Button>
                  <Button
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleSaveDraft}
                    loading={isSaving}
                    className="w-full h-12"
                  >
                    Lưu nháp
                  </Button>
                </Space>
              </Card>

              {/* Writing Tips */}
              <Card title={<><QuestionCircleOutlined className="mr-2" />Gợi ý viết bài</>} className="shadow-lg border-0">
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-700 mb-1">✍️ Tiêu đề hấp dẫn</div>
                    <div className="text-gray-600 text-xs">Sử dụng từ khóa quan trọng, tạo tò mò cho người đọc</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-700 mb-1">🎯 Nội dung có cấu trúc</div>
                    <div className="text-gray-600 text-xs">Chia thành các phần rõ ràng, sử dụng heading</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-700 mb-1">🖼️ Sử dụng hình ảnh</div>
                    <div className="text-gray-600 text-xs">Thêm ảnh minh họa để bài viết sinh động hơn</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-700 mb-1">⌨️ Phím tắt</div>
                    <div className="text-gray-600 text-xs">
                      Ctrl+B (đậm), Ctrl+I (nghiêng), Ctrl+S (lưu), Ctrl+Enter (đăng)
                    </div>
                  </div>
                </div>
              </Card>

              {/* Statistics */}
              <Card title="Thống kê" className="shadow-lg border-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{wordCount}</div>
                    <div className="text-xs text-gray-600">Từ</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.ceil(wordCount / 200) || 0}
                    </div>
                    <div className="text-xs text-gray-600">Phút đọc</div>
                  </div>
                </div>
              </Card>
            </Space>
          </Col>
        </Row>

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