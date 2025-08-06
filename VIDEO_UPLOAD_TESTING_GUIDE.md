# Hướng Dẫn Test Tính Năng Video Upload

## Tổng Quan

Tài liệu này hướng dẫn cách test tính năng upload video trong quá trình tạo khóa học và hiển thị video trong phần chỉnh sửa khóa học.

## Các Bước Test

### 1. Test Tạo Khóa Học Với Video

#### Bước 1: Truy cập trang tạo khóa học

- Mở trình duyệt và truy cập: `http://localhost:5173/admin/section-lesson/create-course`
- Đăng nhập với tài khoản admin hoặc instructor

#### Bước 2: Tạo khóa học cơ bản

- Điền thông tin khóa học:
  - **Tên khóa học**: "Test Course with Video"
  - **Mô tả**: "Khóa học test với video upload"
  - **Danh mục**: Chọn một danh mục
  - **Giá**: Free hoặc Paid

#### Bước 3: Thêm lesson với video

- Click "Thêm Lesson"
- Điền thông tin lesson:
  - **Tên lesson**: "Lesson 1 - Video Test"
  - **Mô tả**: "Lesson test với video upload"
  - **Loại**: Video
- **Upload video file**:
  - Click vào vùng upload video
  - Chọn file video (MP4, AVI, MOV)
  - Kiểm tra file size < 500MB
  - Đợi duration tự động được tính
- Click "Thêm Lesson"

#### Bước 4: Tạo khóa học

- Click "Tạo Khóa Học"
- Quan sát console log để kiểm tra:
  ```
  Course created: {id: ..., sections: [...]}
  Video uploaded for lesson X: {id: ..., quality_urls: {...}}
  All videos uploaded successfully
  ```

### 2. Test Hiển Thị Video Trong Chỉnh Sửa

#### Bước 1: Truy cập trang chỉnh sửa

- Sau khi tạo khóa học thành công, chuyển đến trang chỉnh sửa
- Hoặc truy cập: `http://localhost:5173/instructor/course/edit/{courseId}`

#### Bước 2: Kiểm tra hiển thị video

- Tìm lesson đã upload video
- Kiểm tra hiển thị:
  - ✅ "Video đã upload: [Tên video]"
  - ✅ Thời lượng video: "X:XX"
  - ✅ Quality tags: "HD ✓", "720p ✓", "360p ✓"
  - ✅ Nút "Xem video" hoạt động

#### Bước 3: Test video player

- Click nút "Xem video"
- Kiểm tra:
  - ✅ Modal video player mở ra
  - ✅ Video phát được
  - ✅ Có thể chọn quality khác nhau
  - ✅ Nút fullscreen hoạt động

### 3. Test Upload Video Mới

#### Bước 1: Thêm video cho lesson khác

- Trong trang chỉnh sửa, tìm lesson chưa có video
- Click "Thêm video"
- Upload file video mới
- Click "Lưu"

#### Bước 2: Kiểm tra kết quả

- ✅ Video được upload thành công
- ✅ Hiển thị trong danh sách lesson
- ✅ Có thể xem video

### 4. Test Chỉnh Sửa Video

#### Bước 1: Chỉnh sửa video

- Click nút "Chỉnh sửa video" (biểu tượng edit)
- Thay đổi tên video
- Upload file video mới (tùy chọn)
- Click "Lưu"

#### Bước 2: Kiểm tra kết quả

- ✅ Video được cập nhật
- ✅ Thông tin mới hiển thị đúng

### 5. Test Xóa Video

#### Bước 1: Xóa video

- Click nút "Xóa video" (biểu tượng delete)
- Xác nhận xóa

#### Bước 2: Kiểm tra kết quả

- ✅ Video bị xóa khỏi lesson
- ✅ Hiển thị "Chưa có video" và nút "Thêm video"

## Kiểm Tra Console Log

### Logs Thành Công

```
Course created: {id: "123", title: "Test Course", sections: [...]}
Video uploaded for lesson 456: {id: "789", title: "Test Video", quality_urls: {...}}
All videos uploaded successfully
```

### Logs Lỗi Cần Kiểm Tra

```
Error creating course: [Error details]
Error uploading video for lesson X: [Error details]
```

## Kiểm Tra Database

### Kiểm tra bảng courses

```sql
SELECT * FROM courses WHERE title LIKE '%Test%' ORDER BY created_at DESC LIMIT 5;
```

### Kiểm tra bảng sections

```sql
SELECT * FROM sections WHERE course_id IN (SELECT id FROM courses WHERE title LIKE '%Test%');
```

### Kiểm tra bảng lessons

```sql
SELECT * FROM lessons WHERE section_id IN (SELECT id FROM sections WHERE course_id IN (SELECT id FROM courses WHERE title LIKE '%Test%'));
```

### Kiểm tra bảng videos

```sql
SELECT * FROM videos WHERE lesson_id IN (SELECT id FROM lessons WHERE section_id IN (SELECT id FROM sections WHERE course_id IN (SELECT id FROM courses WHERE title LIKE '%Test%')));
```

## Các Trường Hợp Test Đặc Biệt

### 1. File Video Lớn (>500MB)

- Upload file > 500MB
- Kiểm tra thông báo lỗi: "File video phải nhỏ hơn 500MB!"

### 2. File Không Phải Video

- Upload file .txt, .pdf
- Kiểm tra thông báo lỗi: "Chỉ được chọn file video!"

### 3. Upload Nhiều Video Cùng Lúc

- Tạo khóa học với nhiều lesson có video
- Kiểm tra tất cả video được upload thành công

### 4. Mất Kết Nối Mạng

- Ngắt kết nối internet trong quá trình upload
- Kiểm tra thông báo lỗi và khả năng retry

## Kết Quả Mong Đợi

### ✅ Thành Công

- Khóa học được tạo với đầy đủ thông tin
- Video được upload và xử lý thành công
- Video hiển thị đúng trong trang chỉnh sửa
- Video player hoạt động bình thường
- Có thể chỉnh sửa và xóa video

### ❌ Lỗi Cần Sửa

- Video không upload được
- Video không hiển thị trong trang chỉnh sửa
- Video player không hoạt động
- Lỗi khi chỉnh sửa/xóa video

## Báo Cáo Test

Sau khi hoàn thành test, hãy báo cáo:

1. **Số lượng test case đã chạy**: X/Y
2. **Số lượng test case thành công**: X/Y
3. **Các lỗi phát hiện**: [Danh sách lỗi]
4. **Đề xuất cải thiện**: [Đề xuất]

## Kết Luận

Tính năng video upload đã được implement và test. Nếu tất cả test case đều pass, tính năng đã sẵn sàng cho production.
