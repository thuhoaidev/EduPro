import React, { useState, useRef, useEffect } from 'react';
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
  Alert
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
  FullscreenExitOutlined
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

// Simplified Blog API - only writing related endpoints
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
    formData.append('image', file);
    return apiRequest('/image', 'POST', formData, true);
  }
};

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
  
  const textAreaRef = useRef(null);

  // Predefined categories (no API call needed)
  const categories = [
    { value: 'frontend', label: 'Frontend', color: '#1890ff' },
    { value: 'backend', label: 'Backend', color: '#52c41a' },
    { value: 'mobile', label: 'Mobile Development', color: '#fa8c16' },
    { value: 'devops', label: 'DevOps', color: '#722ed1' },
    { value: 'database', label: 'Database', color: '#eb2f96' },
    { value: 'ui-ux', label: 'UI/UX Design', color: '#13c2c2' },
    { value: 'career', label: 'Career Tips', color: '#f5222d' },
    { value: 'tutorial', label: 'Tutorial', color: '#faad14' },
  ];
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
      image: thumbnailUrl, // 👈 sửa lại field này
      status: 'pending'     // 👈 sửa lại status hợp lệ
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
      resetForm();
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
      image: thumbnailUrl, // 👈 sửa lại field
      status: 'draft'       // 👈 giữ nguyên vì schema cho phép
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
        .category-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
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
              {/* Category Selection */}
              <Card title="Danh mục" className="shadow-lg border-0">
                <Row gutter={[8, 8]}>
                  {categories.map(cat => (
                    <Col span={12} key={cat.value}>
                      <div
                        className={`category-card p-3 rounded-lg border-2 text-center ${
                          category === cat.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setCategory(cat.value)}
                      >
                        <div 
                          className="w-4 h-4 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div className="text-sm font-medium">{cat.label}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
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
                    <div className="font-medium text-gray-700 mb-1">🖼️ Hình ảnh minh họa</div>
                    <div className="text-gray-600 text-xs">Thêm ảnh để làm bài viết sinh động hơn</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-700 mb-1">🏷️ Tags phù hợp</div>
                    <div className="text-gray-600 text-xs">Giúp người đọc dễ tìm thấy bài viết</div>
                  </div>
                </div>
              </Card>

              {/* Keyboard Shortcuts */}
              <Card title="Phím tắt" className="shadow-lg border-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ctrl + B:</span>
                    <span className="text-gray-600">In đậm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ctrl + I:</span>
                    <span className="text-gray-600">In nghiêng</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ctrl + S:</span>
                    <span className="text-gray-600">Lưu nháp</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ctrl + Enter:</span>
                    <span className="text-gray-600">Đăng bài</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ctrl + P:</span>
                    <span className="text-gray-600">Xem trước</span>
                  </div>
                  <div className="flex justify-between">
                    <span>F11:</span>
                    <span className="text-gray-600">Toàn màn hình</span>
                  </div>
                </div>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BlogWritePage;