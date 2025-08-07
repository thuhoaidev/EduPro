# Hướng dẫn sử dụng tính năng Video Upload

## Tổng quan

Tính năng video upload đã được cải tiến để cho phép giảng viên upload file video thực sự thay vì chỉ nhập URL. Video sẽ được xử lý với nhiều chất lượng khác nhau (360p, 720p, 1080p) và lưu trữ trên Cloudinary.

## Tính năng mới

### 1. Tạo khóa học với video upload

- **File**: `frontend/src/pages/admin/section-lesson/CreateCourse.jsx`
- **Tính năng**:
  - Upload file video trực tiếp (MP4, AVI, MOV)
  - Tự động đọc thời lượng video
  - Kiểm tra kích thước file (tối đa 500MB)
  - Hiển thị preview video đã chọn
  - Vẫn hỗ trợ URL video (tùy chọn)

### 2. Chỉnh sửa khóa học với video player

- **File**: `frontend/src/pages/instructor/course/CourseEdit.tsx`
- **Tính năng**:
  - Hiển thị video đã upload với thông tin chi tiết
  - Video player với nhiều chất lượng
  - Chỉnh sửa/xóa video
  - Upload video mới cho lesson

### 3. Video Player Component

- **File**: `frontend/src/components/VideoPlayer.tsx`
- **Tính năng**:
  - Phát video với controls đầy đủ
  - Chọn chất lượng video (360p, 720p, 1080p)
  - Fullscreen mode
  - Auto-play khi load

### 4. Backend API

- **File**: `backend/src/controllers/video.controller.js`
- **Tính năng**:
  - Upload video với nhiều chất lượng
  - Xử lý video qua Cloudinary
  - CRUD operations cho video
  - Validation file type và size

## Cách sử dụng

### Tạo khóa học với video

1. Vào trang "Tạo khóa học mới"
2. Chọn tab "Nội dung khóa học"
3. Click "Thêm bài học"
4. Chọn loại bài học là "Video"
5. Click vào vùng upload để chọn file video
6. Hệ thống sẽ tự động đọc thời lượng video
7. Có thể thêm URL video (tùy chọn)
8. Lưu bài học

### Chỉnh sửa video trong khóa học

1. Vào trang "Chỉnh sửa khóa học"
2. Tìm lesson cần thêm video
3. Click "Thêm video" hoặc "Chỉnh sửa video"
4. Upload file video mới hoặc chỉnh sửa thông tin
5. Lưu thay đổi

### Xem video

1. Trong trang chỉnh sửa khóa học
2. Click nút "Play" bên cạnh video
3. Video player sẽ mở với các tùy chọn chất lượng
4. Có thể chọn fullscreen để xem toàn màn hình

## Cấu trúc dữ liệu

### Video Model

```javascript
{
  lesson_id: ObjectId,
  duration: Number,
  quality_urls: Map {
    "360p": { url: String, public_id: String },
    "720p": { url: String, public_id: String },
    "1080p": { url: String, public_id: String }
  }
}
```

### Lesson với Video

```javascript
{
  id: String,
  title: String,
  description: String,
  videos: [Video],
  quiz: Quiz
}
```

## API Endpoints

### Upload Video

- **POST** `/api/videos`
- **Body**: FormData với `video` (file), `lesson_id`, `duration`

### Update Video

- **PUT** `/api/videos/:id`
- **Body**: FormData với `video` (file, optional), `duration`

### Delete Video

- **DELETE** `/api/videos/:id`

### Get Video by Lesson

- **GET** `/api/videos/lesson/:lesson_id`

## Lưu ý kỹ thuật

### Frontend

- Sử dụng HTML5 video API để đọc duration
- File size limit: 500MB
- Supported formats: MP4, AVI, MOV
- Auto-validation file type và size

### Backend

- Sử dụng Multer để xử lý file upload
- Cloudinary để lưu trữ và xử lý video
- Tự động tạo nhiều chất lượng video
- Cleanup files khi xóa video

### Performance

- Lazy loading video data
- Caching video URLs
- Optimized video compression
- CDN delivery qua Cloudinary

## Troubleshooting

### Video không upload được

- Kiểm tra file size (tối đa 500MB)
- Kiểm tra file format (MP4, AVI, MOV)
- Kiểm tra kết nối internet
- Kiểm tra Cloudinary configuration

### Video không phát được

- Kiểm tra video URL có hợp lệ
- Kiểm tra CORS settings
- Kiểm tra browser support cho video format

### Duration không đọc được

- Thử refresh trang
- Kiểm tra file video có bị corrupt
- Nhập thời lượng thủ công

## Cải tiến trong tương lai

1. **Video Processing**: Thêm subtitle, thumbnail tự động
2. **Analytics**: Theo dõi thời gian xem video
3. **Mobile Optimization**: Tối ưu cho mobile devices
4. **Batch Upload**: Upload nhiều video cùng lúc
5. **Video Editor**: Chỉnh sửa video trực tiếp trên web
