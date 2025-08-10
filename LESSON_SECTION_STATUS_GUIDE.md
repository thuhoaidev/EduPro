# Hướng dẫn Quản lý Trạng thái Lesson và Section

## Tổng quan

Tính năng này cho phép quản lý trạng thái riêng biệt cho từng lesson và section, thay vì ẩn toàn bộ khóa học khi có nội dung mới được thêm vào.

## Các thay đổi chính

### 1. Backend Models

#### Lesson Model (`backend/src/models/Lesson.js`)
- Thêm trường `status` với các giá trị: `'draft'`, `'published'`
- Mặc định: `'draft'`

#### Section Model (`backend/src/models/Section.js`)
- Thêm trường `status` với các giá trị: `'draft'`, `'published'`
- Mặc định: `'draft'`

### 2. Validation Schemas

#### Lesson Validation (`backend/src/validations/lesson.validation.js`)
- Thêm validation cho trường `status`
- Hỗ trợ `'draft'` và `'published'`

#### Section Validation (`backend/src/validations/section.validation.js`)
- Thêm validation cho trường `status`
- Hỗ trợ `'draft'` và `'published'`

### 3. Controllers

#### Lesson Controller (`backend/src/controllers/lesson.controller.js`)
- Cập nhật `createLessons` để hỗ trợ trường `status`
- Cập nhật `updateLesson` để hỗ trợ trường `status`

#### Section Controller (`backend/src/controllers/section.controller.js`)
- Cập nhật `createSection` để hỗ trợ trường `status`
- Cập nhật `updateSection` để hỗ trợ trường `status`

#### Admin Controller (`backend/src/controllers/admin.controller.js`)
- `approveCourseWithContent`: Duyệt khóa học và cập nhật trạng thái lesson/section
- `getCourseContentStatus`: Lấy thông tin trạng thái lesson và section

### 4. Frontend

#### CourseEdit Component (`frontend/src/pages/instructor/course/CourseEdit.tsx`)
- Hiển thị trạng thái lesson và section bằng Tag
- Cập nhật logic để không ẩn toàn bộ khóa học
- Chỉ gửi khóa học để duyệt lại khi có nội dung mới

#### Service (`frontend/src/services/courseService.ts`)
- Cập nhật `createSection` và `updateSection` để hỗ trợ trường `status`
- Cập nhật `createLesson` để hỗ trợ trường `status`

## Cách hoạt động

### 1. Khi Instructor thêm nội dung mới

1. **Thêm Lesson mới:**
   - Lesson được tạo với `status: 'draft'`
   - Nếu khóa học có học viên đăng ký và đang published:
     - Khóa học được gửi để duyệt lại (`status: 'pending'`)
     - Lesson mới vẫn ở trạng thái `'draft'`
     - Lesson cũ vẫn hiển thị bình thường

2. **Thêm Section mới:**
   - Section được tạo với `status: 'draft'`
   - Logic tương tự như thêm lesson

### 2. Khi Admin duyệt khóa học

1. **Duyệt (Approve):**
   - Khóa học: `status: 'approved'`, `displayStatus: 'published'`
   - Tất cả lesson có `status: 'draft'` → `'published'`
   - Tất cả section có `status: 'draft'` → `'published'`

2. **Từ chối (Reject):**
   - Khóa học: `status: 'rejected'`, `displayStatus: 'hidden'`
   - Lesson và section vẫn giữ trạng thái `'draft'`

## API Endpoints

### Admin Endpoints

#### Duyệt khóa học và cập nhật trạng thái
```
PUT /api/admin/courses/:courseId/approve-content
Body: { "action": "approve" | "reject" }
```

#### Lấy thông tin trạng thái lesson và section
```
GET /api/admin/courses/:courseId/content-status
```

### Response mẫu cho content-status
```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "...",
      "title": "Khóa học React",
      "status": "pending",
      "displayStatus": "published"
    },
    "sections": [
      {
        "_id": "...",
        "title": "Chương 1: Giới thiệu",
        "status": "published",
        "lessons": [
          {
            "_id": "...",
            "title": "Bài 1: Hello World",
            "status": "published",
            "position": 1
          }
        ]
      }
    ],
    "stats": {
      "totalSections": 3,
      "draftSections": 1,
      "publishedSections": 2,
      "totalLessons": 15,
      "draftLessons": 3,
      "publishedLessons": 12
    }
  }
}
```

## Script Cập nhật Database

### Chạy script để cập nhật dữ liệu hiện có
```bash
cd backend
node update-lesson-section-status.js
```

Script này sẽ:
- Cập nhật tất cả lesson hiện có thành `status: 'published'`
- Cập nhật tất cả section hiện có thành `status: 'published'`

## UI/UX

### Hiển thị trạng thái

#### Lesson Status
- **Nháp (Draft):** Tag màu cam với icon đồng hồ
- **Công khai (Published):** Tag màu xanh với icon check

#### Section Status
- **Nháp (Draft):** Tag màu cam với icon đồng hồ
- **Công khai (Published):** Tag màu xanh với icon check

### Thông báo
- Khi thêm nội dung mới: "Bài học/Chương học mới sẽ ở trạng thái nháp cho đến khi khóa học được duyệt lại"
- Khi khóa học chờ duyệt: "Khóa học đang chờ duyệt lại. Nội dung mới sẽ ở trạng thái nháp cho đến khi khóa học được duyệt lại"

## Lợi ích

1. **Trải nghiệm người dùng tốt hơn:** Nội dung cũ vẫn hiển thị bình thường
2. **Quản lý linh hoạt:** Có thể duyệt từng phần nội dung riêng biệt
3. **Tính minh bạch:** Rõ ràng về trạng thái của từng lesson/section
4. **Không gián đoạn:** Học viên vẫn có thể học nội dung cũ trong khi chờ nội dung mới

## Lưu ý

1. **Migration:** Chạy script cập nhật database trước khi sử dụng
2. **Backup:** Backup database trước khi chạy script
3. **Testing:** Test kỹ tính năng trong môi trường development
4. **Documentation:** Cập nhật tài liệu API cho team
