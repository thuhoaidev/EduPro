import React, { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Input, 
  Select, 
  Upload, 
  message, 
  Card, 
  Space, 
  Tag, 
  Tooltip,
  Modal,
  Row,
  Col
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
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MGQ1ZWNiNzRiMjRjNzJmNWM4ZTRlM2EiLCJpYXQiOjE2MjQ1NzI4MDAsImV4cCI6MTYyNDY1OTIwMH0.example'; // Thay bằng token thực tế

// API Functions
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API Methods
const blogAPI = {
  // Lấy danh sách blog
  getBlogs: () => apiRequest('/blogs'),
  
  // Tạo blog mới
  createBlog: (blogData) => apiRequest('/blogs', 'POST', blogData),
  
  // Cập nhật blog
  updateBlog: (id, blogData) => apiRequest(`/blogs/${id}`, 'PUT', blogData),
  
  // Xóa blog
  deleteBlog: (id) => apiRequest(`/blogs/${id}`, 'DELETE'),
  
  // Thả tim blog
  likeBlog: (id) => apiRequest(`/blogs/${id}/like`, 'POST'),
  
  // Bỏ thả tim blog
  unlikeBlog: (id) => apiRequest(`/blogs/${id}/unlike`, 'POST'),
  
  // Lưu draft
  saveDraft: (draftData) => apiRequest('/blogs/draft', 'POST', draftData),
  
  // Lấy drafts
  getDrafts: () => apiRequest('/blogs/drafts')
};

const BlogWritePage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [blogId, setBlogId] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const textAreaRef = useRef(null);

  // Categories giống F8
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

  // Popular tags
  const popularTags = [
    'JavaScript', 'React', 'Node.js', 'Python', 'CSS', 'HTML',
    'TypeScript', 'Vue.js', 'Angular', 'Express', 'MongoDB', 'MySQL'
  ];

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // Load blogs and drafts on component mount
  useEffect(() => {
    loadBlogs();
    loadDrafts();
  }, []);

  const loadBlogs = async () => {
    try {
      const response = await blogAPI.getBlogs();
      setBlogs(response.blogs || response.data || []);
    } catch (error) {
      message.error('Không thể tải danh sách blog');
    }
  };

  const loadDrafts = async () => {
    try {
      const response = await blogAPI.getDrafts();
      setDrafts(response.drafts || response.data || []);
    } catch (error) {
      console.error('Không thể tải drafts:', error);
    }
  };

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
    
    // Set cursor position
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

  const handleImageUpload = (file) => {
    // Simulate image upload
    message.success('Ảnh đã được tải lên thành công!');
    const imageUrl = `![${file.name}](https://via.placeholder.com/600x300?text=${encodeURIComponent(file.name)})`;
    setContent(prev => prev + '\n\n' + imageUrl + '\n\n');
    return false; // Prevent default upload
  };

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
        tags,
        thumbnail: thumbnail ? URL.createObjectURL(thumbnail) : null,
        status: 'published',
        publishedAt: new Date().toISOString()
      };

      let response;
      if (blogId) {
        // Update existing blog
        response = await blogAPI.updateBlog(blogId, blogData);
        message.success('Bài viết đã được cập nhật thành công!');
      } else {
        // Create new blog
        response = await blogAPI.createBlog(blogData);
        message.success('Bài viết đã được đăng thành công!');
        setBlogId(response.id || response._id);
      }
      
      // Reload blogs
      await loadBlogs();
      
      // Reset form
      setTitle('');
      setContent('');
      setTags([]);
      setCategory('');
      setThumbnail(null);
      setBlogId(null);
      
    } catch (error) {
      message.error('Có lỗi xảy ra khi đăng bài: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

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
        tags,
        thumbnail: thumbnail ? URL.createObjectURL(thumbnail) : null,
        status: 'draft',
        savedAt: new Date().toISOString()
      };

      await blogAPI.saveDraft(draftData);
      message.success('Bản nháp đã được lưu!');
      
      // Reload drafts
      await loadDrafts();
      
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu bản nháp: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLikeBlog = async (id) => {
    try {
      await blogAPI.likeBlog(id);
      message.success('Đã thả tim bài viết!');
      await loadBlogs(); // Reload to update like count
    } catch (error) {
      message.error('Có lỗi xảy ra khi thả tim: ' + error.message);
    }
  };

  const handleUnlikeBlog = async (id) => {
    try {
      await blogAPI.unlikeBlog(id);
      message.success('Đã bỏ thả tim bài viết!');
      await loadBlogs(); // Reload to update like count
    } catch (error) {
      message.error('Có lỗi xảy ra khi bỏ thả tim: ' + error.message);
    }
  };

  const renderPreview = () => {
    if (!content) return <div className="text-gray-400 text-center py-8">Chưa có nội dung để xem trước</div>;
    
    // Simple markdown-like rendering
    const htmlContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

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
        .blog-item {
          padding: 12px;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          margin-bottom: 8px;
          background: white;
          transition: all 0.2s ease;
        }
        .blog-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        @media (max-width: 768px) {
          .write-container {
            padding: 10px;
          }
        }
      `}</style>

      <div className="write-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Viết bài mới
            </h1>
            <p className="text-gray-600 mt-1">Chia sẻ kiến thức và kinh nghiệm của bạn</p>
          </div>
          <div className="flex items-center gap-3">
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

              {/* Tags */}
              <Card title="Tags" className="shadow-lg border-0">
                <div className="mb-3">
                  <Select
                    mode="tags"
                    placeholder="Thêm tags..."
                    value={tags}
                    onChange={setTags}
                    className="w-full"
                    tokenSeparators={[',']}
                  >
                    {popularTags.map(tag => (
                      <Option key={tag} value={tag}>{tag}</Option>
                    ))}
                  </Select>
                </div>
                <div className="text-xs text-gray-500 mb-2">Tags phổ biến:</div>
                <div className="flex flex-wrap gap-1">
                  {popularTags.slice(0, 8).map(tag => (
                    <Tag 
                      key={tag}
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        if (!tags.includes(tag)) {
                          setTags([...tags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </Card>

              {/* Thumbnail */}
              <Card title="Ảnh đại diện" className="shadow-lg border-0">
                <Upload
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setThumbnail(file);
                    message.success('Ảnh đại diện đã được chọn!');
                    return false;
                  }}
                >
                  {thumbnail ? (
                    <img src={URL.createObjectURL(thumbnail)} alt="thumbnail" className="w-full h-full object-cover" />
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

              {/* Published Blogs */}
              <Card title="Bài viết đã đăng" className="shadow-lg border-0">
                <div className="max-h-60 overflow-y-auto">
                  {blogs.length > 0 ? (
                    blogs.slice(0, 5).map(blog => (
                      <div key={blog._id || blog.id} className="blog-item">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium mb-1 truncate">{blog.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{blog.category}</span>
                              <span>•</span>
                              <span>{blog.likes || 0} ❤️</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="small"
                              icon={blog.isLiked ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                              onClick={() => blog.isLiked ? handleUnlikeBlog(blog._id || blog.id) : handleLikeBlog(blog._id || blog.id)}
                              className="border-0"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-4">
                      Chưa có bài viết nào
                    </div>
                  )}
                </div>
              </Card>

              {/* Help */}
              <Card 
                title={
                  <span className="flex items-center gap-2">
                    <QuestionCircleOutlined />
                    Hướng dẫn viết bài
                  </span>
                }
                className="shadow-lg border-0"
              >
                <div className="text-sm space-y-2">
                  <div>• Tiêu đề nên ngắn gọn, súc tích</div>
                  <div>• Sử dụng markdown để định dạng</div>
                  <div>• Thêm ảnh để bài viết sinh động</div>
                  <div>• Chọn danh mục và tags phù hợp</div>
                  <div>• Kiểm tra lại trước khi đăng</div>
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